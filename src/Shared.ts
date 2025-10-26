import type { RouterMethodData, RouterNode, RouterParamsMap } from '@app/Types.ts'

/**
 * Extract route parameters from path segments using parameter mapping.
 * @param segments - Path segments to extract parameters from
 * @param paramsMap - Parameter mapping configuration
 * @returns Object containing extracted parameters
 */
export function getMatchParams(
  segments: string[],
  paramsMap: RouterParamsMap
): Record<string, string> {
  const params = new nullProtoObj() as Record<string, string>
  for (const [index, name] of paramsMap) {
    const segment = index < 0 ? segments.slice(-index).join('/') : segments[index] ?? ''
    if (typeof name === 'string') {
      params[name] = segment
    } else {
      const match = segment.match(name)
      if (match?.groups) {
        Object.assign(params, match.groups)
      }
    }
  }
  return params
}

/**
 * Null prototype object constructor for property lookups.
 * @returns Object with null prototype
 */
export const nullProtoObj = (() => {
  function func(): void {
    // Empty constructor
  }
  func.prototype = Object.create(null)
  Object.freeze(func.prototype)
  return func
})() as unknown as { new (): Record<string, unknown> }

/**
 * Recursively search router tree for matching route.
 * @param node - Current router node to search from
 * @param method - HTTP method to match
 * @param segments - Path segments to match
 * @param index - Current segment index
 * @returns Array of matching route data or undefined if no match
 */
export function searchTree<T>(
  node: RouterNode<T>,
  method: string,
  segments: string[],
  index: number
): Array<RouterMethodData<T>> | undefined {
  if (index === segments.length) {
    const match = node.methods?.[method] || node.methods?.['']
    if (match) {
      return match
    }
    const paramMatch = node.param?.methods?.[method] || node.param?.methods?.['']
    if (paramMatch?.[0]?.paramsMap?.[paramMatch[0].paramsMap.length - 1]?.[2]) {
      return paramMatch
    }
    const wildcardMatch = node.wildcard?.methods?.[method] || node.wildcard?.methods?.['']
    return wildcardMatch?.[0]?.paramsMap?.[wildcardMatch[0].paramsMap.length - 1]?.[2]
      ? wildcardMatch
      : undefined
  }
  const segment = segments[index]
  if (!segment) {
    return undefined
  }
  const staticNode = node.static?.[segment]
  if (staticNode) {
    const match = searchTree(staticNode, method, segments, index + 1)
    if (match) {
      return match
    }
  }
  if (!node.param) {
    return node.wildcard?.methods?.[method] || node.wildcard?.methods?.['']
  }
  const paramMatch = searchTree(node.param, method, segments, index + 1)
  if (!paramMatch) {
    return node.wildcard?.methods?.[method] || node.wildcard?.methods?.['']
  }
  if (node.param.hasRegexParam) {
    const exactMatch = paramMatch.find((m) => m.paramsRegexp[index]?.test(segment))
    return exactMatch ? [exactMatch] : undefined
  }
  return paramMatch
}

/**
 * Split path into segments, removing empty segments.
 * @param path - Path string to split
 * @returns Array of non-empty path segments
 */
export function splitPath(path: string): string[] {
  const [_, ...s] = path.split('/')
  return s[s.length - 1] === '' ? s.slice(0, -1) : s
}
