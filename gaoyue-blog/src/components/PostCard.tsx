import { Link } from 'react-router-dom'
import type { Post } from '../lib/posts'
import { formatDate } from '../lib/posts'

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="post-card">
      <div className="post-card__meta">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span className="dot" aria-hidden="true" />
        <span>{post.readingMinutes} 分钟阅读</span>
      </div>

      <h3 className="post-card__title">
        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
      </h3>

      <p className="post-card__desc">{post.description}</p>

      <div className="post-card__footer">
        <div className="tag-list">
          {post.tags.map((tag) => (
            <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`} className="tag">
              {tag}
            </Link>
          ))}
        </div>
        <Link className="read-more" to={`/blog/${post.slug}`}>
          阅读全文 <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}
