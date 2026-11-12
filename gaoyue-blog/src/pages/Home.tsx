import { Link } from 'react-router-dom'
import PostCard from '../components/PostCard'
import { allTags, posts } from '../lib/posts'
import { site } from '../site.config'

export default function Home() {
  const latestPosts = posts.slice(0, 3)
  const latestMonth = latestPosts[0]?.date.slice(0, 7) ?? '—'

  return (
    <>
      <section className="hero">
        <div className="hero__text">
          <p className="eyebrow">WELCOME TO MY CORNER</p>
          <h1>
            你好，我是{site.author}
            <span className="hero__mark">。</span>
          </h1>
          <p className="hero__lead">{site.intro}</p>

          <div className="hero__actions">
            <Link to="/blog" className="btn btn--primary">
              开始阅读
            </Link>
            <Link to="/about" className="btn btn--ghost">
              了解我
            </Link>
          </div>

          <div className="hero__stats">
            <div>
              <strong>{posts.length}</strong>
              <span>篇文章</span>
            </div>
            <div>
              <strong>{allTags.length}</strong>
              <span>个标签</span>
            </div>
            <div>
              <strong>{latestMonth}</strong>
              <span>最近更新</span>
            </div>
          </div>
        </div>

        <div className="hero__visual" aria-hidden="true">
          <div className="blob blob--one" />
          <div className="blob blob--two" />
          <div className="avatar-card">
            <div className="avatar">{site.initials}</div>
            <p className="avatar-card__name">{site.author}</p>
            <p className="avatar-card__role">{site.role}</p>
            <div className="avatar-card__line" />
            <p className="avatar-card__motto">慢慢写，认真生活</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>最新文章</h2>
          <Link className="section__link" to="/blog">
            全部文章 <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="post-grid">
          {latestPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>常写的主题</h2>
        </div>
        <div className="topic-list">
          {allTags.map((tag) => (
            <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`} className="topic">
              {tag}
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
