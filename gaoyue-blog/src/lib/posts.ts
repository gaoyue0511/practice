export interface Post {
  slug: string
  title: string
  date: string
  tags: string[]
  description: string
  content: string
  readingMinutes: number
}

const rawFiles = import.meta.glob('../content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function parseFrontmatter(raw: string): { data: Record<string, string>; content: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!match) return { data: {}, content: raw }

  const data: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':')
    if (separator === -1) continue
    const key = line.slice(0, separator).trim()
    const value = line.slice(separator + 1).trim()
    if (key) data[key] = value
  }

  return { data, content: raw.slice(match[0].length) }
}

function parseTags(value?: string): string[] {
  if (!value) return []
  return value
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean)
}

function estimateReadingMinutes(content: string): number {
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) ?? []).length
  const words = (content.match(/[A-Za-z0-9]+/g) ?? []).length
  return Math.max(1, Math.round((chineseChars + words * 2) / 400))
}

export const posts: Post[] = Object.entries(rawFiles)
  .map(([path, raw]) => {
    const slug = path.split('/').pop()?.replace(/\.md$/, '') ?? path
    const { data, content } = parseFrontmatter(raw)
    return {
      slug,
      title: data.title ?? slug,
      date: data.date ?? '',
      tags: parseTags(data.tags),
      description: data.description ?? '',
      content,
      readingMinutes: estimateReadingMinutes(content),
    }
  })
  .sort((a, b) => b.date.localeCompare(a.date))

export function getPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug)
}

export const allTags = [...new Set(posts.flatMap((post) => post.tags))]

export function getAdjacentPosts(slug: string) {
  const index = posts.findIndex((post) => post.slug === slug)
  return {
    prev: index > 0 ? posts[index - 1] : undefined,
    next: index !== -1 && index < posts.length - 1 ? posts[index + 1] : undefined,
  }
}

export function formatDate(date: string): string {
  if (!date) return ''
  const [year, month, day] = date.split('-')
  return `${year} 年 ${Number(month)} 月 ${Number(day)} 日`
}
