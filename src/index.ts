/**
 * Router with radix tree structure.
 * @description An optimized, versatile router with radix tree structure for Deno/Node.js.
 * @module Fast-Router
 *
 * @example
 * ```typescript
 * import { FastRouter } from '@neabyte/fast-router'
 *
 * const router = new FastRouter()
 * router.add('GET', '/users/:id', { handler: 'getUser' })
 * router.add('GET', '/posts/*', { handler: 'posts' })
 * router.add('GET', '/files/**', { handler: 'files' })
 *
 * // Find and use routes
 * const match = router.find('GET', '/users/123')
 * console.log(match?.data?.handler) // 'getUser'
 * console.log(match?.params?.id)    // '123'
 *
 * // Remove routes
 * router.remove('GET', '/users/:id')
 * const removed = router.find('GET', '/users/123')
 * console.log(removed) // undefined (route was removed)
 * ```
 */
export * from '@app/Router.ts'

/**
 * Type definitions for router configuration.
 * @description TypeScript interfaces and type definitions.
 */
export * from '@app/Types.ts'
