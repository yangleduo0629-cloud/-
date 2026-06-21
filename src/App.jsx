import { Children, isValidElement, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { HashRouter, Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import './App.css'
import lazyGoat from './assets/lazy-goat.jpg'
import {
  articleTemplate,
  publishChecklist,
  publishFlow,
} from './content/guide'
import { categories, posts } from './content/posts'
import {
  createHeadingIdFactory,
  estimateReadingMinutes,
  extractHeadings,
  formatDate,
  getAdjacentPosts,
} from './content'

const moodMoments = [
  '把题解写成自己以后也愿意回看的文章。',
  '记录思路，比只记录答案更重要。',
  '学累了的时候，允许自己像懒羊羊一样慢一点。',
]

const sideLinks = [
  { to: '/', label: '首页' },
  { to: '/publish', label: '发布指南' },
]

function getTextContent(children) {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return String(child)
      }

      if (isValidElement(child)) {
        return getTextContent(child.props.children)
      }

      return ''
    })
    .join('')
}

function scrollToHeading(id) {
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <SiteLayout>
              <HomePage />
            </SiteLayout>
          }
        />
        <Route
          path="/post/:slug"
          element={
            <SiteLayout>
              <ArticlePage />
            </SiteLayout>
          }
        />
        <Route
          path="/publish"
          element={
            <SiteLayout>
              <PublishGuidePage />
            </SiteLayout>
          }
        />
        <Route
          path="*"
          element={
            <SiteLayout>
              <NotFoundPage />
            </SiteLayout>
          }
        />
      </Routes>
    </HashRouter>
  )
}

function SiteLayout({ children }) {
  return (
    <div className="page-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <div>
            <p className="site-header__eyebrow">Lazy Coding Club</p>
            <Link className="site-header__title" to="/">
              懒羊羊学习小窝
            </Link>
          </div>
          <p className="site-header__meta">静态博客 · GitHub Pages 自动发布</p>
        </div>
      </header>

      <div className="layout-grid">
        <aside className="sidebar">
          <section className="profile-card">
            <img
              className="profile-card__avatar"
              src={lazyGoat}
              alt="懒羊羊头像"
            />
            <div className="profile-card__body">
              <p className="sidebar-card__title">博主简介</p>
              <h1 className="profile-card__title">把 CTF 笔记认真写成博客的人</h1>
              <p className="profile-card__text">
                这里记录 reverse、crypto、pwn 和一些随手复盘。页面参考中文技术博客的干净阅读感，但保留了懒羊羊主题。
              </p>
            </div>
          </section>

          <nav className="side-nav" aria-label="Sidebar navigation">
            {sideLinks.map((item) => (
              <NavLink key={item.to} className="side-nav__link" to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <section className="sidebar-card">
            <p className="sidebar-card__title">写作习惯</p>
            <ul className="sidebar-list">
              {moodMoments.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="sidebar-card">
            <p className="sidebar-card__title">专题归档</p>
            <ul className="sidebar-list">
              {posts.map((post) => (
                <li key={post.slug}>
                  <Link className="inline-link" to={`/post/${post.slug}`}>
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <div className="content-column">{children}</div>
      </div>
    </div>
  )
}

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      activeCategory === '全部' || post.category === activeCategory
    const haystack = [
      post.title,
      post.excerpt,
      post.content,
      post.category,
      post.tags.join(' '),
    ]
      .join(' ')
      .toLowerCase()

    const matchesQuery =
      normalizedQuery.length === 0 || haystack.includes(normalizedQuery)

    return matchesCategory && matchesQuery
  })

  return (
    <main className="page-content">
      <section className="intro-panel">
        <h2 className="intro-panel__title">一起学习的 CTF 笔记站</h2>
        <p className="intro-panel__text">
          现在发文只需要写 Markdown 文件。文章页会自动生成目录，首页也支持搜索和分类筛选，适合继续长期积累。
        </p>
      </section>

      <section className="content-card search-panel">
        <div className="search-panel__top">
          <div>
            <h3>查找想看的文章</h3>
            <p>可以按标题、分类、正文关键字和标签筛选。</p>
          </div>
          <span className="results-meta">当前 {filteredPosts.length} 篇</span>
        </div>

        <div className="filter-bar">
          <input
            className="filter-input"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索文章标题、分类或关键字"
          />
          <div className="category-pills" aria-label="Category filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-pill${activeCategory === category ? ' active' : ''}`}
                type="button"
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="article-stream">
        <div className="stream-header">
          <h2 className="stream-header__title">最近整理好的几篇题解与复盘</h2>
        </div>

        <div className="article-list">
          {filteredPosts.map((post) => (
            <article className="article-card" key={post.slug}>
              <div className="article-card__meta">
                <span>{formatDate(post.publishedAt)}</span>
                <span>{post.category}</span>
                <span>{estimateReadingMinutes(post.content)} 分钟阅读</span>
              </div>
              <h3 className="article-card__title">
                <Link className="article-card__link" to={`/post/${post.slug}`}>
                  {post.title}
                </Link>
              </h3>
              <p className="article-card__excerpt">{post.excerpt}</p>
              {post.tags.length > 0 && (
                <div className="article-card__tags">
                  {post.tags.map((tag) => (
                    <span className="tag-chip" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <Link className="article-card__readmore" to={`/post/${post.slug}`}>
                阅读全文
              </Link>
            </article>
          ))}

          {filteredPosts.length === 0 && (
            <div className="empty-panel">
              <h3 className="content-card__title">暂时没有匹配的文章</h3>
              <p>可以换个关键词，或者先切回“全部”分类看看。</p>
            </div>
          )}
        </div>
      </section>

      <section className="article-grid">
        <article className="content-card">
          <h3>发文门槛更低</h3>
          <p>
            现在每篇文章都是独立 Markdown 文件，也支持一键生成模板。你不用再改 JS 数组，写作体验会更接近真正的博客系统。
          </p>
        </article>
        <article className="content-card">
          <h3>长文阅读更顺</h3>
          <p>
            文章页支持目录、代码块、引用、表格和上一篇下一篇导航，读者打开后更容易一路看下去。
          </p>
        </article>
      </section>
    </main>
  )
}

function ArticlePage() {
  const { slug } = useParams()
  const post = posts.find((item) => item.slug === slug)

  if (!post) {
    return <NotFoundPage />
  }

  const headings = extractHeadings(post.content)
  const { previousPost, nextPost } = getAdjacentPosts(posts, post.slug)
  const createHeadingId = createHeadingIdFactory()

  return (
    <main className="page-content">
      <div className="reading-layout">
        <article className="post-panel">
          <div className="post-panel__header">
            <Link className="back-link" to="/">
              返回首页
            </Link>
            <div className="article-card__meta">
              <span>{formatDate(post.publishedAt)}</span>
              <span>{post.category}</span>
              <span>{estimateReadingMinutes(post.content)} 分钟阅读</span>
            </div>
            <h2 className="post-panel__title">{post.title}</h2>
            <p className="post-panel__excerpt">{post.excerpt}</p>
            {post.tags.length > 0 && (
              <div className="article-card__tags">
                {post.tags.map((tag) => (
                  <span className="tag-chip" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {post.coverImageUrl && (
            <div className="post-cover-wrap">
              <img className="post-cover" src={post.coverImageUrl} alt={post.title} />
            </div>
          )}

          <div className="post-body markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2({ children }) {
                  const text = getTextContent(children)
                  const id = createHeadingId(text)
                  return <h2 id={id}>{children}</h2>
                },
                h3({ children }) {
                  const text = getTextContent(children)
                  const id = createHeadingId(text)
                  return <h3 id={id}>{children}</h3>
                },
                a({ href, children }) {
                  const isExternal = typeof href === 'string' && /^https?:\/\//i.test(href)
                  return (
                    <a
                      className="markdown-link"
                      href={href}
                      rel={isExternal ? 'noreferrer' : undefined}
                      target={isExternal ? '_blank' : undefined}
                    >
                      {children}
                    </a>
                  )
                },
                blockquote({ children }) {
                  return <blockquote className="markdown-quote">{children}</blockquote>
                },
                code({ inline, children }) {
                  const codeText = String(children).replace(/\n$/, '')
                  if (inline) {
                    return <code className="inline-code">{codeText}</code>
                  }

                  return (
                    <pre className="code-panel code-panel--block">
                      <code>{codeText}</code>
                    </pre>
                  )
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          <section className="post-nav-grid">
            {previousPost ? (
              <Link className="post-nav-card" to={`/post/${previousPost.slug}`}>
                <span className="post-nav-card__label">上一篇</span>
                <strong>{previousPost.title}</strong>
              </Link>
            ) : (
              <div className="post-nav-card post-nav-card--muted">
                <span className="post-nav-card__label">上一篇</span>
                <strong>已经是最新一篇了</strong>
              </div>
            )}

            {nextPost ? (
              <Link className="post-nav-card" to={`/post/${nextPost.slug}`}>
                <span className="post-nav-card__label">下一篇</span>
                <strong>{nextPost.title}</strong>
              </Link>
            ) : (
              <div className="post-nav-card post-nav-card--muted">
                <span className="post-nav-card__label">下一篇</span>
                <strong>已经到底了</strong>
              </div>
            )}
          </section>
        </article>

        <aside className="reading-rail">
          <section className="sidebar-card toc-card">
            <p className="sidebar-card__title">文章目录</p>
            {headings.length > 0 ? (
              <ul className="toc-list">
                {headings.map((heading) => (
                  <li
                    className={`toc-list__item depth-${heading.depth}`}
                    key={heading.id}
                  >
                    <button
                      className="toc-button"
                      type="button"
                      onClick={() => scrollToHeading(heading.id)}
                    >
                      {heading.text}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="toc-empty">这篇文章还没有分节标题。</p>
            )}
          </section>

          <section className="sidebar-card toc-card">
            <p className="sidebar-card__title">阅读信息</p>
            <ul className="sidebar-list">
              <li>发布时间：{formatDate(post.publishedAt)}</li>
              <li>预计阅读：{estimateReadingMinutes(post.content)} 分钟</li>
              <li>标签数量：{post.tags.length}</li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
  )
}

function PublishGuidePage() {
  return (
    <main className="page-content">
      <article className="post-panel">
        <div className="post-panel__header">
          <h2 className="post-panel__title">改 Markdown 文件，再让 GitHub Pages 自动更新</h2>
          <p className="post-panel__excerpt">
            这套博客没有在线后台，而是用更稳定的静态发布方式。现在还多了自动生成文章模板的脚本，发文会更轻松。
          </p>
        </div>

        <section className="guide-section">
          <h3>快速开始</h3>
          <pre className="code-panel code-panel--block">
            <code>npm run new-post -- "这里写文章标题"</code>
          </pre>
        </section>

        <section className="guide-section">
          <h3>发布流程</h3>
          <div className="guide-list-grid">
            {publishFlow.map((item) => (
              <article className="guide-note" key={item.title}>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="guide-section">
          <h3>发文检查</h3>
          <ul className="guide-bullets">
            {publishChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="guide-section">
          <h3>文章模板</h3>
          <pre className="code-panel code-panel--block">
            <code>{articleTemplate}</code>
          </pre>
        </section>
      </article>
    </main>
  )
}

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <main className="page-content">
      <article className="post-panel">
        <div className="empty-panel">
          <h2 className="post-panel__title">这个页面暂时没有找到</h2>
          <p className="post-panel__excerpt">
            可能是链接写错了，也可能这篇文章还没有被加入内容文件。
          </p>
          <button className="back-button" type="button" onClick={() => navigate('/')}>
            回到首页
          </button>
        </div>
      </article>
    </main>
  )
}

export default App
