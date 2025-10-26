import { assertEquals, assertExists } from '@std/assert'
import { FastRouter } from '@app/index.ts'

Deno.test({
  name: 'Should add routes with named parameters',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/users/:id', { handler: 'userById' })
    const result = router.find('GET', '/users/123')
    assertExists(result)
    assertEquals(result.data.handler, 'userById')
    assertEquals(result.params?.id, '123')
  }
})

Deno.test({
  name: 'Should add routes with wildcard parameters',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/posts/*', { handler: 'posts' })
    const result = router.find('GET', '/posts/javascript')
    assertExists(result)
    assertEquals(result.data.handler, 'posts')
  }
})

Deno.test({
  name: 'Should add routes with catch-all wildcard',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/files/**', { handler: 'files' })
    const result = router.find('GET', '/files/a/b/c')
    assertExists(result)
    assertEquals(result.data.handler, 'files')
  }
})

Deno.test({
  name: 'Should handle multiple parameters',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/users/:id/posts/:postId', { handler: 'multi' })
    const result = router.find('GET', '/users/123/posts/456')
    assertExists(result)
    assertEquals(result.data.handler, 'multi')
    assertEquals(result.params?.id, '123')
    assertEquals(result.params?.postId, '456')
  }
})

Deno.test({
  name: 'Should return undefined for non-existent routes',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/users/:id', { handler: 'user' })
    const result = router.find('GET', '/nonexistent')
    assertEquals(result, undefined)
  }
})

Deno.test({
  name: 'Should handle empty path',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/', { handler: 'root' })
    const result = router.find('GET', '/')
    assertExists(result)
    assertEquals(result.data.handler, 'root')
  }
})

Deno.test({
  name: 'Should handle trailing slash normalization',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/trail', { handler: 'trail' })
    const result1 = router.find('GET', '/trail/')
    const result2 = router.find('GET', '/trail')
    assertExists(result1)
    assertExists(result2)
    assertEquals(result1.data.handler, 'trail')
    assertEquals(result2.data.handler, 'trail')
  }
})

Deno.test({
  name: 'Should handle method-specific routes',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/users/:id', { handler: 'getUser' })
    router.add('PUT', '/users/:id', { handler: 'updateUser' })
    const getResult = router.find('GET', '/users/123')
    const putResult = router.find('PUT', '/users/123')
    assertExists(getResult)
    assertExists(putResult)
    assertEquals(getResult.data.handler, 'getUser')
    assertEquals(putResult.data.handler, 'updateUser')
  }
})

Deno.test({
  name: 'Should add path without leading slash',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', 'relative', { handler: 'relative' })
    const result = router.find('GET', '/relative')
    assertExists(result)
    assertEquals(result.data.handler, 'relative')
  }
})

Deno.test({
  name: 'Should extract parameters for wildcard route',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/files/**:name', { handler: 'file' })
    const result = router.find('GET', '/files/path/to/file.txt')
    assertExists(result)
    assertExists(result.params?.name)
    assertEquals(result.params?.name, 'path/to/file.txt')
  }
})
