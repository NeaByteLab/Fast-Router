# Fast Router [![Module type: CJS+ESM](https://img.shields.io/badge/module%20type-cjs%2Besm-brightgreen)](https://github.com/voxpelli/badges-cjs-esm) [![npm version](https://img.shields.io/npm/v/@neabyte/fast-router.svg)](https://www.npmjs.org/package/@neabyte/fast-router) [![JSR](https://jsr.io/badges/@neabyte/fast-router)](https://jsr.io/@neabyte/fast-router) [![Node.js CI](https://github.com/NeaByteLab/Fast-Router/actions/workflows/ci.yaml/badge.svg)](https://github.com/NeaByteLab/Fast-Router)

**A fast, versatile router with radix tree structure for JavaScript**

> [!NOTE]
> This project is inspired by [rou3](https://github.com/h3js/rou3) and uses similar routing algorithm and tree structure. It provides a class-based API as an alternative to rou3's functional approach, suitable for object-oriented use cases.

## Table of Contents

- [Quick Start](#quick-start)
  - [Installation](#installation)
  - [Basic Usage](#basic-usage)
- [Examples](#examples)
  - [Data Type Flexibility](#data-type-flexibility)
  - [Named Parameters](#named-parameters)
  - [Wildcard Parameters](#wildcard-parameters)
  - [Catch-All Wildcard](#catch-all-wildcard)
  - [Regex Parameter Validation](#regex-parameter-validation)
  - [HTTP Method Support](#http-method-support)
  - [Static vs Parameter Routes](#static-vs-parameter-routes)
  - [Trailing Slash Normalization](#trailing-slash-normalization)
  - [Complex Nested Routes](#complex-nested-routes)
  - [Disable Parameter Extraction](#disable-parameter-extraction)
  - [Route Removal](#route-removal)
- [API Reference](#api-reference)
  - [`add`](#add)
  - [`find`](#find)
  - [`remove`](#remove)
- [Testing](#testing)
- [License](#license)

## Quick Start

### Installation

```bash
# npm package
npm install @neabyte/fast-router

# Deno module
deno add jsr:@neabyte/fast-router
```

### Basic Usage

```typescript
import { FastRouter } from '@neabyte/fast-router'

// Create a new router instance
const router = new FastRouter()

// Add routes with data
router.add('GET', '/users/:id', { handler: 'getUser' })
router.add('GET', '/users', { handler: 'listUsers' })
router.add('GET', '/posts/*', { handler: 'posts' })

// Find matching route
const match = router.find('GET', '/users/123')
console.log(match?.data?.handler) // 'getUser'
console.log(match?.params?.id) // '123'
```

## Examples

### Data Type Flexibility

Fast Router supports **any data type** via TypeScript generics. You're not limited to handler objects!

```typescript
// String data
const router1 = new FastRouter<string>()
router1.add('GET', '/users/:id', 'getUser')
const match1 = router1.find('GET', '/users/123')
console.log(match1?.data) // 'getUser'

// Number data
const router2 = new FastRouter<number>()
router2.add('GET', '/config/:key', 42)
const match2 = router2.find('GET', '/config/value')
console.log(match2?.data) // 42

// Array data
const router3 = new FastRouter<string[]>()
router3.add('GET', '/posts', ['list', 'posts'])
const match3 = router3.find('GET', '/posts')
console.log(match3?.data) // ['list', 'posts']

// Function data
const handler = (req: Request) => new Response('ok')
const router4 = new FastRouter<typeof handler>()
router4.add('GET', '/api/data', handler)
const match4 = router4.find('GET', '/api/data')
console.log(typeof match4?.data) // 'function'

// Complex object
interface RouteConfig {
  handler: string
  middleware: string[]
  timeout: number
}
const router5 = new FastRouter<RouteConfig>()
router5.add('GET', '/secure', {
  handler: 'protected',
  middleware: ['auth', 'rate-limit'],
  timeout: 5000
})
const match5 = router5.find('GET', '/secure')
console.log(match5?.data) // Full object

// Class instance
class MyHandler {
  name: string
  constructor(name: string) {
    this.name = name
  }
}
const router6 = new FastRouter<MyHandler>()
router6.add('GET', '/custom', new MyHandler('test'))
const match6 = router6.find('GET', '/custom')
console.log(match6?.data?.name) // 'test'

// No data (undefined)
const router7 = new FastRouter<undefined>()
router7.add('GET', '/ping')
const match7 = router7.find('GET', '/ping')
console.log(match7?.data) // null
```

### Named Parameters

```typescript
const router = new FastRouter()

// Route with named parameter
router.add('GET', '/users/:id', { handler: 'getUser' })
const userMatch = router.find('GET', '/users/123')
console.log(userMatch?.data?.handler) // 'getUser'
console.log(userMatch?.params?.id) // '123'

// Route with named parameters
router.add('GET', '/users/:id/posts/:postId', { handler: 'getPost' })
const postMatch = router.find('GET', '/users/123/posts/456')
console.log(postMatch?.data?.handler) // 'getPost'
console.log(postMatch?.params?.id) // '123'
console.log(postMatch?.params?.postId) // '456'
```

### Wildcard Parameters

```typescript
const router = new FastRouter()

// Single wildcard (matches one segment)
router.add('GET', '/posts/*', { handler: 'posts' })
const match = router.find('GET', '/posts/javascript')
console.log(match?.data?.handler) // 'posts'
console.log(match?.params?._0) // 'javascript'
```

### Catch-All Wildcard

```typescript
const router = new FastRouter()

// Catch-all wildcard (matches multiple segments)
router.add('GET', '/files/**', { handler: 'files' })
const match = router.find('GET', '/files/docs/user/guide.pdf')
console.log(match?.data?.handler) // 'files'

// Named catch-all
router.add('GET', '/files/**:name', { handler: 'fileName' })
const namedMatch = router.find('GET', '/files/docs/user/guide.pdf')
console.log(namedMatch?.params?.name) // 'docs/user/guide.pdf'
```

### Regex Parameter Validation

```typescript
const router = new FastRouter()

// Validate numeric ID
router.add('GET', '/user/:id(\\d+)', { handler: 'numericUser' })
const validMatch = router.find('GET', '/user/123')
console.log(validMatch?.data?.handler) // 'numericUser'
const invalidMatch = router.find('GET', '/user/abc')
console.log(invalidMatch) // undefined (regex validation failed)

// Validate phone format
router.add('GET', '/phone/:number(\\d{3}-\\d{3}-\\d{4})', { handler: 'phoneFormat' })
const phoneMatch = router.find('GET', '/phone/123-456-7890')
console.log(phoneMatch?.params?.number) // '123-456-7890'
```

### HTTP Method Support

```typescript
const router = new FastRouter()

// Method-specific route (GET)
router.add('GET', '/users/:id', { handler: 'getUser' })
const getMatch = router.find('GET', '/users/123')
console.log(getMatch?.data?.handler) // 'getUser'

// Method-specific route (PUT)
router.add('PUT', '/users/:id', { handler: 'updateUser' })
const putMatch = router.find('PUT', '/users/123')
console.log(putMatch?.data?.handler) // 'updateUser'

// Method-agnostic route
router.add('', '/api/data', { handler: 'anyMethod' })
const anyMatch = router.find('POST', '/api/data')
console.log(anyMatch?.data?.handler) // 'anyMethod'
```

### Static vs Parameter Routes

```typescript
const router = new FastRouter()

// Static route
router.add('GET', '/users/admin', { handler: 'adminRoute' })
const adminMatch = router.find('GET', '/users/admin')
console.log(adminMatch?.data?.handler) // 'adminRoute'

// Parameter route
router.add('GET', '/users/:id', { handler: 'userRoute' })
const userMatch = router.find('GET', '/users/123')
console.log(userMatch?.data?.handler) // 'userRoute'
```

### Trailing Slash Normalization

```typescript
const router = new FastRouter()

// Add route with trailing slash
router.add('GET', '/api/data', { handler: 'data' })

// Both paths work
const withSlash = router.find('GET', '/api/data/')
const withoutSlash = router.find('GET', '/api/data')
console.log(withSlash?.data?.handler) // 'data'
console.log(withoutSlash?.data?.handler) // 'data'
```

### Complex Nested Routes

```typescript
const router = new FastRouter()

// Multiple parameters and wildcards
router.add('GET', '/api/:version/posts/:id/comments', { handler: 'comments' })
const match = router.find('GET', '/api/v1/posts/123/comments')
console.log(match?.params?.version) // 'v1'
console.log(match?.params?.id) // '123'

// Mixed wildcards
router.add('GET', '/data/:id/*/**:rest', { handler: 'mixed' })
const wildMatch = router.find('GET', '/data/123/x/y/z')
console.log(wildMatch?.params?.id) // '123'
console.log(wildMatch?.params?._0) // 'x'
console.log(wildMatch?.params?.rest) // 'y/z'
```

### Disable Parameter Extraction

```typescript
const router = new FastRouter()

// Add route with parameter
router.add('GET', '/users/:id', { handler: 'getUser' })

// Extract parameters (default)
const withParams = router.find('GET', '/users/123')
console.log(withParams?.params?.id) // '123'

// Disable parameter extraction
const withoutParams = router.find('GET', '/users/123', { params: false })
console.log(withoutParams?.params) // undefined
```

### Route Removal

```typescript
const router = new FastRouter()

// Add routes with different methods
router.add('GET', '/users/:id', { handler: 'getUser' })
router.add('PUT', '/users/:id', { handler: 'updateUser' })
router.add('GET', '/posts/*', { handler: 'posts' })

// Remove specific method route
const removed = router.remove('GET', '/users/:id')
console.log(removed) // true

// Verify removal
const getMatch = router.find('GET', '/users/123')
console.log(getMatch) // undefined (route was removed)

// Other method still works
const putMatch = router.find('PUT', '/users/123')
console.log(putMatch?.data?.handler) // 'updateUser'

// Remove wildcard route
router.remove('GET', '/posts/*')
const postMatch = router.find('GET', '/posts/javascript')
console.log(postMatch) // undefined

// Remove non-existent route returns false
const notFound = router.remove('GET', '/nonexistent')
console.log(notFound) // false
```

## API Reference

### `add`

```typescript
router.add(method, path, data?)
```

- `method` `<string>`: HTTP method (GET, POST, PUT, DELETE, etc.). Use empty string.
- `path` `<string>`: The route path pattern (supports `:param`, `*`, `**` wildcards).
- `data` `<T>`: (Optional) Data to associate with the route.
- Returns: `void`
- Description: Add a route to the router with optional data and HTTP method.

**Route Patterns:**

- `:param` - Named parameter (matches a single segment)
- `:param(regex)` - Named parameter with regex validation
- `*` - Wildcard (matches a single segment)
- `**` - Catch-all wildcard (matches remaining segments)
- `**:name` - Named catch-all wildcard

### `find`

```typescript
router.find(method, path, opts?)
```

- `method` `<string>`: HTTP method to match. Use empty string.
- `path` `<string>`: The path to search for.
- `opts` `<object>`: (Optional) Search options.
  - `params` `<boolean>`: (Optional) Whether to extract parameters. Defaults to `true`.
- Returns: `<RouterMatchedRoute<T> | undefined>`
- Description: Find matching route for the given path and HTTP method. Returns undefined if no match is found.

**Return Type:**

```typescript
{
  data: T, // Data associated with the matched route
  params: Record<string, string> | undefined // Extracted route parameters
}
```

### `remove`

```typescript
router.remove(method, path)
```

- `method` `<string>`: HTTP method to remove. Use empty string.
- `path` `<string>`: The route path pattern to remove (supports `:param`, `*`, `**` wildcards).
- Returns: `<boolean>`
- Description: Remove a route from the router. Returns `true` if successfully removed, `false` if not found.

## Testing

Run the test suite:

```bash
deno task test
```

Format and lint:

```bash
deno task check
```

Run the benchmarks:

```bash
deno task bench
```

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
