import { assertEquals, assertExists } from '@std/assert'
import { FastRouter } from '@app/index.ts'

Deno.test({
  name: 'Should handle nested static routes',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/api/v1/users', { handler: 'apiUsers' })
    router.add('GET', '/api/v2/users', { handler: 'apiUsersV2' })
    const result1 = router.find('GET', '/api/v1/users')
    const result2 = router.find('GET', '/api/v2/users')
    assertExists(result1)
    assertExists(result2)
    assertEquals(result1.data.handler, 'apiUsers')
    assertEquals(result2.data.handler, 'apiUsersV2')
  }
})

Deno.test({
  name: 'Should handle mixed static and param routes',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/users/:id', { handler: 'userById' })
    router.add('GET', '/users/admin', { handler: 'admin' })
    const result1 = router.find('GET', '/users/123')
    const result2 = router.find('GET', '/users/admin')
    assertExists(result1)
    assertExists(result2)
    assertEquals(result1.data.handler, 'userById')
    assertEquals(result2.data.handler, 'admin')
  }
})

Deno.test({
  name: 'Should handle optional params with false option',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/users/:id', { handler: 'user' })
    const result = router.find('GET', '/users/123', { params: false })
    assertExists(result)
    assertEquals(result.data.handler, 'user')
    assertEquals(result.params, undefined)
  }
})

Deno.test({
  name: 'Should handle wildcard after parameter',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/users/:id/*', { handler: 'userPath' })
    const result = router.find('GET', '/users/123/posts')
    assertExists(result)
    assertEquals(result.data.handler, 'userPath')
    assertEquals(result.params?.id, '123')
  }
})

Deno.test({
  name: 'Should handle conflicting static vs param routes',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/test/', { handler: 'testStatic' })
    router.add('GET', '/test/:id', { handler: 'testParam' })
    const staticResult = router.find('GET', '/test/')
    const paramResult = router.find('GET', '/test/123')
    assertExists(staticResult)
    assertExists(paramResult)
    assertEquals(staticResult.data.handler, 'testStatic')
    assertEquals(paramResult.data.handler, 'testParam')
  }
})

Deno.test({
  name: 'Should handle empty method parameter',
  fn(): void {
    const router = new FastRouter()
    router.add('', '/test', { handler: 'anyMethod' })
    const result = router.find('POST', '/test')
    assertExists(result)
    assertEquals(result.data.handler, 'anyMethod')
  }
})

Deno.test({
  name: 'Should handle duplicate route registration',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/test', { handler: 'first' })
    router.add('GET', '/test', { handler: 'second' })
    const result = router.find('GET', '/test')
    assertExists(result)
    assertEquals(result.data.handler, 'second')
  }
})

Deno.test({
  name: 'Should handle complex nested routes',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/api/:version/posts/:id/comments', { handler: 'comments' })
    const result = router.find('GET', '/api/v1/posts/123/comments')
    assertExists(result)
    assertEquals(result.data.handler, 'comments')
    assertEquals(result.params?.version, 'v1')
    assertEquals(result.params?.id, '123')
  }
})

Deno.test({
  name: 'Should validate regex parameters',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/user/:id(\\d+)', { handler: 'numericId' })
    router.add('GET', '/phone/:number(\\d{3}-\\d{3}-\\d{4})', { handler: 'phoneFormat' })
    const validId = router.find('GET', '/user/123')
    assertExists(validId)
    assertEquals(validId.data.handler, 'numericId')
    const invalidId = router.find('GET', '/user/abc')
    assertEquals(invalidId, undefined)
    const validPhone = router.find('GET', '/phone/123-456-7890')
    assertExists(validPhone)
    assertEquals(validPhone.data.handler, 'phoneFormat')
    assertEquals(validPhone.params?.number, '123-456-7890')
    const invalidPhone = router.find('GET', '/phone/12345')
    assertEquals(invalidPhone, undefined)
  }
})

Deno.test({
  name: 'Should extract unnamed wildcard parameters',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/tags/*', { handler: 'tags' })
    router.add('GET', '/posts/*/*', { handler: 'nestedPosts' })
    const result1 = router.find('GET', '/tags/javascript')
    assertExists(result1)
    assertEquals(result1.data.handler, 'tags')
    assertEquals(result1.params?.['_0'], 'javascript')
    const result2 = router.find('GET', '/posts/2025/123')
    assertExists(result2)
    assertEquals(result2.data.handler, 'nestedPosts')
    assertEquals(result2.params?.['_0'], '2025')
    assertEquals(result2.params?.['_1'], '123')
  }
})

Deno.test({
  name: 'Should handle multiple mixed wildcards',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/data/:id/*/**:rest', { handler: 'mixedWildcards' })
    const result = router.find('GET', '/data/123/x/y/z')
    assertExists(result)
    assertEquals(result.data.handler, 'mixedWildcards')
    assertEquals(result.params?.id, '123')
    assertEquals(result.params?.['_0'], 'x')
    assertEquals(result.params?.rest, 'y/z')
  }
})

Deno.test({
  name: 'Should handle optional wildcard segments',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/test/*', { handler: 'optionalWildcard' })
    router.add('GET', '/files/**', { handler: 'optionalCatchAll' })
    const withSegment = router.find('GET', '/test/something')
    assertExists(withSegment)
    assertEquals(withSegment.data.handler, 'optionalWildcard')
    const withoutSegment = router.find('GET', '/test')
    assertExists(withoutSegment)
    assertEquals(withoutSegment.data.handler, 'optionalWildcard')
    const withPath = router.find('GET', '/files/a/b/c')
    assertExists(withPath)
    assertEquals(withPath.data.handler, 'optionalCatchAll')
    const withoutPath = router.find('GET', '/files')
    assertExists(withoutPath)
    assertEquals(withoutPath.data.handler, 'optionalCatchAll')
  }
})
