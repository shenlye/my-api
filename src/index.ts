import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { posts } from './db/schema';

const db = drizzle(process.env.DB_FILE_NAME!)

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/posts/:slug', async (c) => {
  const slug = c.req.param('slug')

  // TODO: Fetch post from the database using Drizzle ORM
})

app.get('/posts', async (c) => {
  const limit = 10
  const page = Number(c.req.query('page') || '1')

  // TODO: Fetch paginated posts from the database using Drizzle ORM
})

app.post('/posts', async (c) => {
  const { title, content, slug } = await c.req.json()

  const result = await db.insert(posts).values({
    title: title,
    content: content,
    slug: slug,
  }).returning()

  return c.json({
    message: '文章发布成功',
    data: result[0],
  }, 201)
})
export default app
