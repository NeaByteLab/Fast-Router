import { assertEquals, assertExists } from '@std/assert'
import { FastRouter } from '@app/index.ts'

Deno.test({
  name: 'Should handle multiple regex groups in parameter',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/user/:id(\\d+)', { handler: 'user' })
    const result = router.find('GET', '/user/12345')
    assertExists(result)
    assertEquals(result.data.handler, 'user')
    assertEquals(result.params?.id, '12345')
  }
})

Deno.test({
  name: 'Should handle regex parameter validation with custom pattern',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/user/:email([a-z]+@[a-z]+\\.[a-z]+)', { handler: 'emailCheck' })
    const valid = router.find('GET', '/user/test@example.com')
    assertExists(valid)
    assertEquals(valid.data.handler, 'emailCheck')
    assertEquals(valid.params?.email, 'test@example.com')
    const invalid = router.find('GET', '/user/invalid')
    assertEquals(invalid, undefined)
  }
})

Deno.test({
  name: 'Should handle catch-all with multiple levels',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/api/**', { handler: 'api' })
    const result = router.find('GET', '/api/v1/users/123/posts')
    assertExists(result)
    assertEquals(result.data.handler, 'api')
    assertExists(result.params)
  }
})

Deno.test({
  name: 'Should handle optional parameter fallback when no exact match',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/test/*', { handler: 'testWithSlug' })
    router.add('GET', '/test', { handler: 'testWithoutSlug' })
    const withSlug = router.find('GET', '/test/slug')
    assertExists(withSlug)
    assertEquals(withSlug.data.handler, 'testWithSlug')
    const withoutSlug = router.find('GET', '/test')
    assertExists(withoutSlug)
    assertEquals(withoutSlug.data.handler, 'testWithoutSlug')
  }
})

Deno.test({
  name: 'Should handle method fallback when specific method not found',
  fn(): void {
    const router = new FastRouter()
    router.add('', '/test', { handler: 'anyMethod' })
    const postResult = router.find('POST', '/test')
    const getResult = router.find('GET', '/test')
    assertExists(postResult)
    assertExists(getResult)
    assertEquals(postResult.data.handler, 'anyMethod')
    assertEquals(getResult.data.handler, 'anyMethod')
  }
})

Deno.test({
  name: 'Should return undefined when regex validation fails',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/number/:id(\\d+)', { handler: 'number' })
    router.add('GET', '/number/:id(\\d+)', { handler: 'number2' })
    const result = router.find('GET', '/number/123')
    assertExists(result)
    assertEquals(result.data.handler, 'number2')
    const invalid = router.find('GET', '/number/abc')
    assertEquals(invalid, undefined)
  }
})

Deno.test({
  name: 'Should handle empty string in paramsMap',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/test/:id(\\d+)/*', { handler: 'test' })
    const result = router.find('GET', '/test/123/extra')
    assertExists(result)
    assertEquals(result.params?.id, '123')
    assertEquals(result.params?.['_0'], 'extra')
  }
})

Deno.test({
  name: 'Should extract multiple parameters with different types',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/users/:id/posts/:postId(\\d+)/comments', { handler: 'comments' })
    const result = router.find('GET', '/users/alice/posts/12345/comments')
    assertExists(result)
    assertEquals(result.data.handler, 'comments')
    assertEquals(result.params?.id, 'alice')
    assertEquals(result.params?.postId, '12345')
  }
})

Deno.test({
  name: 'Should handle alternation pattern in regex',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/type/:category(^electronics$|^clothing$|^books$)', { handler: 'category' })
    const valid1 = router.find('GET', '/type/electronics')
    const valid2 = router.find('GET', '/type/clothing')
    const invalid = router.find('GET', '/type/food')
    assertExists(valid1)
    assertExists(valid2)
    assertEquals(invalid, undefined)
    assertEquals(valid1.data.handler, 'category')
    assertEquals(valid2.data.handler, 'category')
  }
})

Deno.test({
  name: 'Should handle UUID pattern validation',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/uuid/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})', {
      handler: 'uuid'
    })
    const valid = router.find('GET', '/uuid/550e8400-e29b-41d4-a716-446655440000')
    const invalid = router.find('GET', '/uuid/not-a-uuid')
    assertExists(valid)
    assertEquals(invalid, undefined)
    assertEquals(valid.data.handler, 'uuid')
  }
})

Deno.test({
  name: 'Should handle date format validation (YYYY-MM-DD)',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/date/:date(\\d{4}-\\d{2}-\\d{2})', { handler: 'date' })
    const valid = router.find('GET', '/date/2025-10-26')
    const invalid = router.find('GET', '/date/25-10-26')
    assertExists(valid)
    assertEquals(invalid, undefined)
    assertEquals(valid.data.handler, 'date')
    assertEquals(valid.params?.date, '2025-10-26')
  }
})

Deno.test({
  name: 'Should handle hex color pattern with optional prefix',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/color/:hex(#?[0-9a-fA-F]{6})', { handler: 'color' })
    const valid1 = router.find('GET', '/color/ff0000')
    const valid2 = router.find('GET', '/color/#00ff00')
    const invalid = router.find('GET', '/color/nothex')
    assertExists(valid1)
    assertExists(valid2)
    assertEquals(invalid, undefined)
    assertEquals(valid1.data.handler, 'color')
    assertEquals(valid2.data.handler, 'color')
  }
})

Deno.test({
  name: 'Should handle length constraints in regex',
  fn(): void {
    const router = new FastRouter()
    router.add('GET', '/slug/:name([a-z0-9]{3,10})', { handler: 'slug' })
    const valid = router.find('GET', '/slug/abc123')
    const tooShort = router.find('GET', '/slug/ab')
    const tooLong = router.find('GET', '/slug/thisistoolongtoolong')
    assertExists(valid)
    assertEquals(tooShort, undefined)
    assertEquals(tooLong, undefined)
    assertEquals(valid.data.handler, 'slug')
    assertEquals(valid.params?.name, 'abc123')
  }
})
