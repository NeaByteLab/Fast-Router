import { FastRouter } from '@app/index.ts'

const fastRouter = new FastRouter<{ handler: string; method: string }>()

fastRouter.add('GET', '/', { handler: 'home', method: 'GET' })
fastRouter.add('GET', '/users', { handler: 'listUsers', method: 'GET' })
fastRouter.add('GET', '/users/:id', { handler: 'getUser', method: 'GET' })
fastRouter.add('GET', '/users/:id/posts', { handler: 'getUserPosts', method: 'GET' })
fastRouter.add('GET', '/users/:id/posts/:postId', { handler: 'getPost', method: 'GET' })
fastRouter.add('GET', '/posts/:category/*', { handler: 'posts', method: 'GET' })
fastRouter.add('GET', '/files/**', { handler: 'files', method: 'GET' })
fastRouter.add('GET', '/api/:version/*', { handler: 'api', method: 'GET' })

Deno.bench({
  name: 'Fast-Router: Static route lookup',
  fn: () => {
    fastRouter.find('GET', '/users')
  }
})

Deno.bench({
  name: 'Fast-Router: Named parameter route',
  fn: () => {
    fastRouter.find('GET', '/users/123')
  }
})

Deno.bench({
  name: 'Fast-Router: Nested parameter route',
  fn: () => {
    fastRouter.find('GET', '/users/123/posts/456')
  }
})

Deno.bench({
  name: 'Fast-Router: No match route',
  fn: () => {
    fastRouter.find('GET', '/nonexistent')
  }
})
