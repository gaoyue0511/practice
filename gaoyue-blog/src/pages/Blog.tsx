import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import PostCard from '../components/PostCard'
import { allTags, posts } from '../lib/posts'

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTag = searchParams.get('tag')
  const activeTag = requestedTag && allTags.includes(requestedTag) ? requestedTag : null

  const visiblePosts = useMemo(
    () => (activeTag ? posts.filter((post) => post.tags.includes(activeTag)) : posts),
    [activeTag],
  )

  const selectTag = (tag: string | null) => {
    setSearchParams(tag ? { tag } : {})
  }

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">ARCHIVE</p>
        <h1>所有文章</h1>
        <p>关于代码、阅读与生活的记录，共 {posts.length} 篇。</p>
      </header>

      <div className="filter-bar" role="group" aria-label="按标签筛选">
        <button
          type="button"
          className={activeTag === null ? 'filter is-active' : 'filter'}
          onClick={() => selectTag(null)}
        >
          全部
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={activeTag === tag ? 'filter is-active' : 'filter'}
            onClick={() => selectTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {visiblePosts.length > 0 ? (
        <div className="post-grid">
          {visiblePosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="empty-state">这个标签下还没有文章。</p>
      )}
    </>
  )
}
