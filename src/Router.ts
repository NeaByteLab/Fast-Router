import type {
  RouterContext,
  RouterMatchedRoute,
  RouterMethodData,
  RouterNode,
  RouterParamsMap
} from '@app/Types.ts'
import { getMatchParams, nullProtoObj, searchTree, splitPath } from '@app/Shared.ts'

/**
 * Router implementation with static route optimization.
 * @description Fast router with radix tree structure for optimized route matching.
 * @template T - Type of data associated with routes
 */
export class FastRouter<T = unknown> {
  /** Internal router context containing tree structure and static routes */
  private context: RouterContext<T>

  /**
   * Initialize FastRouter with empty context.
   */
  constructor() {
    this.context = {
      root: { key: '' },
      static: new nullProtoObj() as Record<string, RouterNode<T> | undefined>
    }
  }

  /**
   * Add a route to the router with optional data and HTTP method.
   * @param method - HTTP method (use '' for any method)
   * @param path - Route path pattern (supports :param, *, ** wildcards)
   * @param data - Optional data to associate with the route
   */
  add(method: string, path: string, data?: T): void {
    method = method.toUpperCase()
    if (!path.startsWith('/')) {
      path = `/${path}`
    }
    let node = this.context.root
    let unnamedParamIndex = 0
    const segments = splitPath(path)
    const paramsMap: RouterParamsMap = []
    const paramsRegexp: RegExp[] = []
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      if (!segment) {
        continue
      }
      if (segment.startsWith('**')) {
        node.wildcard ??= { key: '**' }
        node = node.wildcard
        paramsMap.push([-i, segment.split(':')[1] ?? '_', segment.length === 2])
        break
      }
      if (segment === '*' || segment.includes(':')) {
        node.param ??= { key: '*' }
        node = node.param
        if (segment === '*') {
          paramsMap.push([i, `_${unnamedParamIndex++}`, true])
        } else {
          const regexMatch = segment.match(/^:(\w+)\((.+)\)$/)
          if (regexMatch) {
            const regex = new RegExp(`^(?<${regexMatch[1]}>${regexMatch[2]})$`)
            node.hasRegexParam = true
            paramsRegexp[i] = regex
            paramsMap.push([i, regex, false])
          } else {
            paramsMap.push([i, segment.slice(1), false])
          }
        }
        continue
      }
      node.static ??= new nullProtoObj() as Record<string, RouterNode<T>>
      node = node.static[segment] ??= { key: segment }
    }
    const hasParams = paramsMap.length > 0
    node.methods ??= new nullProtoObj() as Record<string, RouterMethodData<T>[] | undefined>
    node.methods[method] = [
      {
        data: data ?? (null as T),
        paramsRegexp,
        paramsMap: hasParams ? paramsMap : undefined
      }
    ]
    if (!hasParams) {
      this.context.static[path] = node
    }
  }

  /**
   * Find matching route for given path and HTTP method.
   * @param method - HTTP method to match (use '' for any method)
   * @param path - Path to search for
   * @param opts - Search options
   * @param opts.params - Whether to extract parameters (default: true)
   * @returns Matched route data with parameters or undefined if not found
   */
  find(
    method: string,
    path: string,
    opts?: { params?: boolean }
  ): RouterMatchedRoute<T> | RouterMethodData<T> | undefined {
    const staticNode = this.context.static[path]
    if (staticNode && staticNode.methods) {
      const upperMethod = method.toUpperCase()
      const exactMatch = staticNode.methods[upperMethod] || staticNode.methods['']
      if (exactMatch && exactMatch[0]) {
        return exactMatch[0]
      }
    }
    method = method.toUpperCase()
    if (path.endsWith('/') && path !== '/') {
      path = path.slice(0, -1)
    }
    if (!path) {
      path = '/'
    }
    const segments = splitPath(path)
    const match = searchTree(this.context.root, method, segments, 0)
    if (!match?.[0]) {
      return undefined
    }
    const matchData = match[0]
    if (opts?.params === false) {
      return { data: matchData.data, params: undefined }
    }
    return {
      data: matchData.data,
      params: matchData.paramsMap ? getMatchParams(segments, matchData.paramsMap) : undefined
    }
  }

  /**
   * Remove a route from the router.
   * @param method - HTTP method to remove (use '' for any method)
   * @param path - Route path pattern to remove
   * @returns true if route was removed, false if route not found
   */
  remove(method: string, path: string): boolean {
    method = method.toUpperCase()
    if (!path.startsWith('/')) {
      path = `/${path}`
    }
    const segments = splitPath(path)
    const hasParams = segments.some(
      (segment) => segment === '*' || segment.includes(':') || segment.startsWith('**')
    )
    const node = hasParams ? this.findNode(segments) : this.context.static[path]
    if (!node?.methods?.[method]) {
      return false
    }
    delete node.methods[method]
    if (!Object.keys(node.methods).length) {
      delete node.methods
    }
    if (!hasParams) {
      delete this.context.static[path]
    }
    return true
  }

  /**
   * Find the node for a given path in the tree.
   * @param segments - Path segments
   * @returns The router node or undefined if not found
   */
  private findNode(segments: string[]): RouterNode<T> | undefined {
    let node: RouterNode<T> = this.context.root
    for (const segment of segments) {
      if (!segment) {
        continue
      }
      if (segment.startsWith('**')) {
        if (!node.wildcard) {
          return undefined
        }
        node = node.wildcard
        break
      }
      if (segment === '*' || segment.includes(':')) {
        if (!node.param) {
          return undefined
        }
        node = node.param
        continue
      }
      if (!node.static?.[segment]) {
        return undefined
      }
      node = node.static[segment]
    }
    return node
  }
}
