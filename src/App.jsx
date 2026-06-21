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

const topLinks = [
  { to: '/', label: '首页' },
  { to: '/publish', label: '发布指南' },
]

const siteNotes = [
  '文章已清空，准备重新开始。',
  '发文方式为 Markdown 加 GitHub Pages。',
  '后续会以 CTF 学习记录为主线。',
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
    <div className="shell">
      <header className="topbar">
        <div className="topbar__inner">
          <span className="topbar__brand">LeDuo Blog</span>
          <nav className="topbar__nav" aria-label="Top navigation">
            {topLinks.map((item) => (
              <NavLink key={item.to} className="topbar__link" to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <section className="blog-header">
        <div className="blog-header__inner">
          <div>
            <p className="blog-header__eyebrow">Study Notes</p>
            <Link className="blog-header__title" to="/">
              懒羊羊学习小窝
            </Link>
            <p className="blog-header__subtitle">
              一个准备重新开始写内容的个人学习博客，先把前端整理成更像中文技术博客的样子。
            </p>
          </div>
          <div className="blog-header__status">
            <span>GitHub Pages 在线</span>
            <span>Markdown 发文已就绪</span>
          </div>
        </div>
      </section>

      <div className="layout">
        <main className="main-column">{children}</main>
        <aside className="sidebar">
          <section className="widget widget--profile">
            <div className="widget__profile-visual">
              <img className="widget__avatar" src={lazyGoat} alt="懒羊羊头像" />
            </div>
            <div className="widget__body">
              <h2 className="widget__title">关于我</h2>
              <p className="widget__text">
                这里以后会继续写 reverse、crypto、pwn 和学习复盘。现在先清空旧文章，把博客整理成一个更适合长期写作的起点。
              </p>
            </div>
          </section>

          <section className="widget">
            <h2 className="widget__title">公告</h2>
            <p className="widget__text">
              示例文章已经清空。接下来发布的内容会直接代表这座博客真正的方向。
            </p>
          </section>

          <section className="widget">
            <h2 className="widget__title">当前状态</h2>
            <ul className="widget__list">
              {siteNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="widget">
            <h2 className="widget__title">文章归档</h2>
            {posts.length > 0 ? (
              <ul className="widget__list">
                {posts.map((post) => (
                  <li key={post.slug}>
                    <Link className="widget__link" to={`/post/${post.slug}`}>
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="widget__text">暂时还没有可归档的文章。</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')
  const hasPosts = posts.length > 0

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
    <div className="content-stack">
      <article className="post-card post-card--notice">
        <div className="post-card__meta">
          <span>{formatDate(new Date().toISOString())}</span>
          <span>置顶公告</span>
          <span>博客调整中</span>
        </div>
        <h1 className="post-card__headline">旧文章已经清空，前端也准备按更正式的博客风格重新开始。</h1>
        <p className="post-card__excerpt">
          这个站点现在更像一个认真写作的起点。发布入口、自动部署和文章结构都已经准备好了，接下来只差你写下第一篇真正想留下来的内容。
        </p>
        <div className="post-card__actions">
          <Link className="action-button action-button--primary" to="/publish">
            查看发文方式
          </Link>
          <a
            className="action-button action-button--secondary"
            href="https://github.com/yangleduo0629-cloud/-"
            target="_blank"
            rel="noreferrer"
          >
            打开仓库
          </a>
        </div>
      </article>

      <div className="content-grid">
        <article className="panel">
          <h2 className="panel__title">开始写第一篇文章</h2>
          <p className="panel__text">
            现在最方便的发文方式是先生成 Markdown 模板，然后直接填标题、摘要和正文。
          </p>
          <pre className="code-panel code-panel--block">
            <code>npm run new-post -- "这里写文章标题"</code>
          </pre>
        </article>

        <article className="panel">
          <h2 className="panel__title">重新开始的方向</h2>
          <p className="panel__text">
            未来这里会继续围绕 CTF 学习记录展开，但不再保留示例文章。空站状态也应该看起来像一个完整博客，而不是临时占位页。
          </p>
        </article>
      </div>

      {hasPosts ? (
        <>
          <section className="search-box">
            <div className="search-box__top">
              <div>
                <h2 className="panel__title">文章检索</h2>
                <p className="panel__text">可以按标题、分类、正文关键字和标签筛选。</p>
              </div>
              <span className="search-box__count">当前 {filteredPosts.length} 篇</span>
            </div>
            <div className="search-box__controls">
              <input
                className="search-box__input"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="搜索文章标题、分类或关键字"
              />
              <div className="search-box__tags" aria-label="Category filters">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`tag-button${activeCategory === category ? ' active' : ''}`}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="post-list">
            {filteredPosts.map((post) => (
              <article className="post-card" key={post.slug}>
                <div className="post-card__meta">
                  <span>{formatDate(post.publishedAt)}</span>
                  <span>{post.category}</span>
                  <span>{estimateReadingMinutes(post.content)} 分钟阅读</span>
                </div>
                <h2 className="post-card__title">
                  <Link className="post-card__title-link" to={`/post/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>
                <p className="post-card__excerpt">{post.excerpt}</p>
                {post.tags.length > 0 && (
                  <div className="post-card__tags">
                    {post.tags.map((tag) => (
                      <span className="post-tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </section>
        </>
      ) : (
        <article className="post-card post-card--empty">
          <div className="post-card__meta">
            <span>当前文章数 0</span>
            <span>等待新内容</span>
          </div>
          <h2 className="post-card__title">暂时还没有发布文章。</h2>
          <p className="post-card__excerpt">
            这是现在最重要的空状态。等你发布第一篇 Markdown 文章后，这里会自动变成真正的文章列表。
          </p>
          <ol className="steps-list">
            {publishFlow.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </li>
            ))}
          </ol>
        </article>
      )}
    </div>
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
    <div className="reading-layout">
      <article className="article-page">
        <div className="article-page__header">
          <Link className="back-link" to="/">
            返回首页
          </Link>
          <div className="post-card__meta">
            <span>{formatDate(post.publishedAt)}</span>
            <span>{post.category}</span>
            <span>{estimateReadingMinutes(post.content)} 分钟阅读</span>
          </div>
          <h1 className="article-page__title">{post.title}</h1>
          <p className="article-page__excerpt">{post.excerpt}</p>
          {post.tags.length > 0 && (
            <div className="post-card__tags">
              {post.tags.map((tag) => (
                <span className="post-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {post.coverImageUrl && (
          <div className="article-page__cover">
            <img className="article-page__image" src={post.coverImageUrl} alt={post.title} />
          </div>
        )}

        <div className="markdown-body article-page__body">
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
              code({ className, children }) {
                const codeText = String(children).replace(/\n$/, '')
                const isBlock = Boolean(className)

                if (!isBlock) {
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

        <section className="article-page__nav">
          {previousPost ? (
            <Link className="article-nav-card" to={`/post/${previousPost.slug}`}>
              <span>上一篇</span>
              <strong>{previousPost.title}</strong>
            </Link>
          ) : (
            <div className="article-nav-card article-nav-card--muted">
              <span>上一篇</span>
              <strong>已经是最新一篇了</strong>
            </div>
          )}

          {nextPost ? (
            <Link className="article-nav-card" to={`/post/${nextPost.slug}`}>
              <span>下一篇</span>
              <strong>{nextPost.title}</strong>
            </Link>
          ) : (
            <div className="article-nav-card article-nav-card--muted">
              <span>下一篇</span>
              <strong>已经到底了</strong>
            </div>
          )}
        </section>
      </article>

      <aside className="reading-rail">
        <section className="widget">
          <h2 className="widget__title">文章目录</h2>
          {headings.length > 0 ? (
            <ul className="toc-list">
              {headings.map((heading) => (
                <li className={`toc-list__item depth-${heading.depth}`} key={heading.id}>
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
            <p className="widget__text">这篇文章还没有分节标题。</p>
          )}
        </section>

        <section className="widget">
          <h2 className="widget__title">阅读信息</h2>
          <ul className="widget__list">
            <li>发布时间：{formatDate(post.publishedAt)}</li>
            <li>预计阅读：{estimateReadingMinutes(post.content)} 分钟</li>
            <li>标签数量：{post.tags.length}</li>
          </ul>
        </section>
      </aside>
    </div>
  )
}

function PublishGuidePage() {
  return (
    <article className="article-page">
      <div className="article-page__header">
        <div className="post-card__meta">
          <span>发布指南</span>
          <span>GitHub Pages</span>
        </div>
        <h1 className="article-page__title">改 Markdown 文件，再让 GitHub Pages 自动更新</h1>
        <p className="article-page__excerpt">
          现在站点已经清空文章，正适合从第一篇正式内容开始。发文流程很轻，而且和现在的静态博客结构是完全配套的。
        </p>
      </div>

      <section className="guide-block">
        <h2 className="panel__title">快速开始</h2>
        <pre className="code-panel code-panel--block">
          <code>npm run new-post -- "这里写文章标题"</code>
        </pre>
      </section>

      <section className="guide-grid">
        {publishFlow.map((item) => (
          <article className="guide-card" key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="guide-block">
        <h2 className="panel__title">发文检查</h2>
        <ul className="steps-list">
          {publishChecklist.map((item) => (
            <li key={item}>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="guide-block">
        <h2 className="panel__title">文章模板</h2>
        <pre className="code-panel code-panel--block">
          <code>{articleTemplate}</code>
        </pre>
      </section>
    </article>
  )
}

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <article className="post-card post-card--empty">
      <div className="post-card__meta">
        <span>404</span>
        <span>页面未找到</span>
      </div>
      <h1 className="post-card__headline">这个页面暂时没有找到。</h1>
      <p className="post-card__excerpt">
        旧文章已经清空了，所以如果你是从旧链接点进来的，现在更适合回到首页或直接去发布第一篇新文章。
      </p>
      <div className="post-card__actions">
        <button className="action-button action-button--primary" type="button" onClick={() => navigate('/')}>
          回到首页
        </button>
        <Link className="action-button action-button--secondary" to="/publish">
          查看发布方法
        </Link>
      </div>
    </article>
  )
}

export default App
