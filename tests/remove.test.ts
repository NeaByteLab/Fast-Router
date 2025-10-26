import { assert, assertEquals, assertExists } from '@std/assert'
import { FastRouter } from '@app/index.ts'

interface TestData {
  handler: string
}

Deno.test({
  name: 'Should remove static route',
  fn(): void {
    const router = new FastRouter<TestData>()
    router.add('GET', '/test', { handler: 'test' })
    assertEquals(router.find('GET', '/test')?.data.handler, 'test')
    const removed = router.remove('GET', '/test')
    assert(removed)
    assertEquals(router.find('GET', '/test'), undefined)
  }
})

Deno.test({
  name: 'Should remove parameterized route',
  fn(): void {
    const router = new FastRouter<TestData>()
    router.add('GET', '/users/:id', { handler: 'user' })
    assertEquals(router.find('GET', '/users/123')?.data.handler, 'user')
    const removed = router.remove('GET', '/users/:id')
    assert(removed)
    assertEquals(router.find('GET', '/users/123'), undefined)
  }
})

Deno.test({
  name: 'Should remove specific method and keep others',
  fn(): void {
    const router = new FastRouter<TestData>()
    router.add('GET', '/users/:id', { handler: 'getUser' })
    router.add('PUT', '/users/:id', { handler: 'updateUser' })
    assertEquals(router.find('GET', '/users/123')?.data.handler, 'getUser')
    assertEquals(router.find('PUT', '/users/123')?.data.handler, 'updateUser')
    const removed = router.remove('GET', '/users/:id')
    assert(removed)
    assertEquals(router.find('GET', '/users/123'), undefined)
    assertEquals(router.find('PUT', '/users/123')?.data.handler, 'updateUser')
  }
})

Deno.test({
  name: 'Should return false when removing non-existent route',
  fn(): void {
    const router = new FastRouter<TestData>()
    router.add('GET', '/test', { handler: 'test' })
    const wasRemoved = router.remove('GET', '/nonexistent')
    assert(!wasRemoved)
    assertExists(router.find('GET', '/test'))
  }
})

Deno.test({
  name: 'Should remove wildcard route',
  fn(): void {
    const router = new FastRouter<TestData>()
    router.add('GET', '/posts/*', { handler: 'posts' })
    assertEquals(router.find('GET', '/posts/javascript')?.data.handler, 'posts')
    const removed = router.remove('GET', '/posts/*')
    assert(removed)
    assertEquals(router.find('GET', '/posts/javascript'), undefined)
  }
})

Deno.test({
  name: 'Should remove catch-all route',
  fn(): void {
    const router = new FastRouter<TestData>()
    router.add('GET', '/files/**', { handler: 'files' })
    assertEquals(router.find('GET', '/files/a/b/c')?.data.handler, 'files')
    const removed = router.remove('GET', '/files/**')
    assert(removed)
    assertEquals(router.find('GET', '/files/a/b/c'), undefined)
  }
})

Deno.test({
  name: 'Should handle path without leading slash',
  fn(): void {
    const router = new FastRouter<TestData>()
    router.add('GET', 'relative', { handler: 'relative' })
    assertExists(router.find('GET', '/relative'))
    const removed = router.remove('GET', 'relative')
    assert(removed)
    assertEquals(router.find('GET', '/relative'), undefined)
  }
})

Deno.test({
  name: 'Should handle empty method',
  fn(): void {
    const router = new FastRouter<TestData>()
    router.add('', '/test', { handler: 'test' })
    assertExists(router.find('GET', '/test'))
    const removed = router.remove('', '/test')
    assert(removed)
    assertEquals(router.find('GET', '/test'), undefined)
  }
})

Deno.test({
  name: 'Should not remove route with different method',
  fn(): void {
    const router = new FastRouter<TestData>()
    router.add('GET', '/users/:id', { handler: 'getUser' })
    router.add('PUT', '/users/:id', { handler: 'updateUser' })
    const wasRemoved = router.remove('DELETE', '/users/:id')
    assert(!wasRemoved)
    assertExists(router.find('GET', '/users/123'))
    assertExists(router.find('PUT', '/users/123'))
  }
})

Deno.test({
  name: 'Should remove route with regex parameter',
  fn(): void {
    const router = new FastRouter<TestData>()
    router.add('GET', '/user/:id(\\d+)', { handler: 'user' })
    assertExists(router.find('GET', '/user/123'))
    const removed = router.remove('GET', '/user/:id(\\d+)')
    assert(removed)
    assertEquals(router.find('GET', '/user/123'), undefined)
  }
})

Deno.test({
  name: 'Should handle mixed static and parameter routes removal',
  fn(): void {
    const router = new FastRouter<TestData>()
    router.add('GET', '/users/:id', { handler: 'userById' })
    router.add('GET', '/users/admin', { handler: 'admin' })
    assertExists(router.find('GET', '/users/123'))
    assertExists(router.find('GET', '/users/admin'))
    router.remove('GET', '/users/:id')
    assertEquals(router.find('GET', '/users/123'), undefined)
    assertExists(router.find('GET', '/users/admin'))
  }
})

Deno.test({
  name: 'Should remove from static cache',
  fn(): void {
    const router = new FastRouter<TestData>()
    router.add('GET', '/api/users', { handler: 'users' })
    assertExists(router.find('GET', '/api/users'))
    router.remove('GET', '/api/users')
    assertEquals(router.find('GET', '/api/users'), undefined)
  }
})

Deno.test({
  name: 'Should handle nested routes removal',
  fn(): void {
    const router = new FastRouter<TestData>()
    router.add('GET', '/api/v1/users', { handler: 'v1' })
    router.add('GET', '/api/v2/users', { handler: 'v2' })
    assertExists(router.find('GET', '/api/v1/users'))
    assertExists(router.find('GET', '/api/v2/users'))
    router.remove('GET', '/api/v1/users')
    assertEquals(router.find('GET', '/api/v1/users'), undefined)
    assertExists(router.find('GET', '/api/v2/users'))
  }
})
