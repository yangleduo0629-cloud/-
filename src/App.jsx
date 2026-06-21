import {
  Bell,
  ChatsCircle,
  ClockCountdown,
  Cloud,
  Code,
  FlowerLotus,
  GearSix,
  Handshake,
  Headphones,
  Heart,
  List,
  MagnifyingGlass,
  MoonStars,
  PauseCircle,
  PlayCircle,
  Sparkle,
  Sun,
  Waveform,
} from '@phosphor-icons/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  Children,
  isValidElement,
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  HashRouter,
  Link,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import './App.css'
import lazyGoat from './assets/lazy-goat.jpg'
import {
  articleTemplate,
  publishChecklist,
  publishFlow,
} from './content/guide'
import {
  categories,
  posts,
  resolveContentAsset,
  seriesGroups,
  tagGroups,
  yearGroups,
} from './content/posts'
import {
  albumCollections,
  archiveNodes,
  backgroundOptions,
  favoriteEntries,
  friendEntries,
  guestbookEndpoint,
  guestbookTips,
  momentGroups,
  navItems,
  novelChapters,
  playlist,
  projectEntries,
} from './content/site-data'
import { siteMeta } from './content/site-meta'
import {
  createHeadingIdFactory,
  estimateReadingMinutes,
  extractHeadings,
  formatDate,
  getAdjacentPosts,
  getRelatedPosts,
} from './content'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 11) {
    return '早上也适合慢慢发呆'
  }
  if (hour < 18) {
    return '今天也适合慢慢发呆'
  }
  return '夜里抱着零食偷偷听歌'
}

function formatFriendSite(friend) {
  if (friend.site) {
    return friend.site
  }

  if (!friend.url) {
    return '待填写链接'
  }

  try {
    return new URL(friend.url).hostname.replace(/^www\./i, '')
  } catch {
    return friend.url
  }
}

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

function buildArticleFeed() {
  return posts.map((post, index) => ({
    ...post,
    coverImageUrl:
      post.coverImageUrl || backgroundOptions[index % backgroundOptions.length].image,
    views: 140 + index * 26,
    likes: 18 + index * 7,
    readTime: estimateReadingMinutes(post.content),
  }))
}

const contentExportLinks = [
  {
    label: 'RSS 订阅',
    href: new URL('feed.xml', siteMeta.siteUrl).toString(),
    desc: '适合订阅器抓取最新文章更新。',
  },
  {
    label: '站点地图',
    href: new URL('sitemap.xml', siteMeta.siteUrl).toString(),
    desc: '方便搜索引擎和爬虫发现页面结构。',
  },
  {
    label: '内容索引',
    href: new URL('content-index.json', siteMeta.siteUrl).toString(),
    desc: '供脚本、搜索或二次整理读取文章摘要。',
  },
]

const publicGuestbookConfig = {
  repo: 'yangleduo0629-cloud/-',
  issueTerm: 'lazy-goat-guestbook',
  label: 'guestbook',
  repoUrl: 'https://github.com/yangleduo0629-cloud/-',
}

function articleMatchesKeyword(article, keyword) {
  if (!keyword) {
    return true
  }

  const searchPool = [
    article.title,
    article.excerpt,
    article.category,
    article.series,
    article.tags.join(' '),
    article.content,
  ]
    .filter(Boolean)
    .join('\n')
    .toLowerCase()

  return searchPool.includes(keyword)
}

function resolveCommentTheme() {
  if (typeof document === 'undefined') {
    return 'github-light'
  }

  return document.documentElement.dataset.theme === 'dark'
    ? 'github-dark'
    : 'github-light'
}

function PublicGuestbookWall() {
  const containerRef = useRef(null)
  const [commentTheme, setCommentTheme] = useState(resolveCommentTheme)

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined
    }

    const observer = new MutationObserver(() => {
      setCommentTheme(resolveCommentTheme())
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return undefined
    }

    container.innerHTML = ''
    const script = document.createElement('script')
    script.src = 'https://utteranc.es/client.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    script.setAttribute('repo', publicGuestbookConfig.repo)
    script.setAttribute('issue-term', publicGuestbookConfig.issueTerm)
    script.setAttribute('label', publicGuestbookConfig.label)
    script.setAttribute('theme', commentTheme)
    container.appendChild(script)

    return () => {
      container.innerHTML = ''
    }
  }, [commentTheme])

  return <div className="guestbook-comment-wall" ref={containerRef} />
}

function readStoredTheme() {
  if (typeof window === 'undefined') {
    return 'light'
  }

  const savedTheme = window.localStorage.getItem('lazy-theme')
  return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light'
}

function readStoredBackground() {
  if (typeof window === 'undefined') {
    return 'day'
  }

  const savedBackground = window.localStorage.getItem('lazy-background')
  return savedBackground === 'day' || savedBackground === 'sunset'
    ? savedBackground
    : 'day'
}

function readStoredBlur() {
  if (typeof window === 'undefined') {
    return 18
  }

  const savedBlur = Number(window.localStorage.getItem('lazy-blur'))
  return Number.isFinite(savedBlur)
    ? Math.min(24, Math.max(10, savedBlur))
    : 18
}

function readStoredEffects() {
  if (typeof window === 'undefined') {
    return true
  }

  return window.localStorage.getItem('lazy-effects') !== 'false'
}

function shouldShowWelcome() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.sessionStorage.getItem('lazy-welcome-shown') == null
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="moments" element={<MomentsPage />} />
          <Route path="guestbook" element={<GuestbookPage />} />
          <Route path="novels" element={<NovelsPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="friends" element={<FriendsPage />} />
          <Route path="photos" element={<PhotosPage />} />
          <Route path="archives" element={<ArchivesPage />} />
          <Route path="music" element={<MusicPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="publish" element={<PublishGuidePage />} />
          <Route path="post/:slug" element={<ArticlePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

function SiteLayout() {
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [theme, setTheme] = useState(readStoredTheme)
  const [backgroundKey, setBackgroundKey] = useState(readStoredBackground)
  const [backgroundBlur, setBackgroundBlur] = useState(readStoredBlur)
  const [effectsEnabled, setEffectsEnabled] = useState(readStoredEffects)
  const [welcomeVisible, setWelcomeVisible] = useState(shouldShowWelcome)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('lazy-theme', theme)
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem('lazy-background', backgroundKey)
  }, [backgroundKey])

  useEffect(() => {
    window.localStorage.setItem('lazy-blur', String(backgroundBlur))
  }, [backgroundBlur])

  useEffect(() => {
    window.localStorage.setItem('lazy-effects', String(effectsEnabled))
  }, [effectsEnabled])

  useEffect(() => {
    if (welcomeVisible) {
      window.sessionStorage.setItem('lazy-welcome-shown', 'true')
    }
  }, [welcomeVisible])

  useEffect(() => {
    if (!welcomeVisible) {
      return undefined
    }

    const timer = window.setTimeout(
      () => setWelcomeVisible(false),
      reduceMotion ? 800 : 2600,
    )

    return () => window.clearTimeout(timer)
  }, [welcomeVisible, reduceMotion])

  const currentBackground =
    backgroundOptions.find((item) => item.key === backgroundKey)?.image ||
    backgroundOptions[0].image

  return (
    <div className="dream-app" style={{ '--background-blur': `${backgroundBlur}px` }}>
      <DreamBackground
        image={currentBackground}
        blur={backgroundBlur}
        effectsEnabled={effectsEnabled}
      />
      <SoftCursorEffects enabled={effectsEnabled} reduceMotion={reduceMotion} />

      <AnimatePresence>
        {welcomeVisible && (
          <motion.div
            className="welcome-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.2 : 0.6 }}
          >
            <div className="welcome-overlay__backdrop" />
            <motion.div
              className="welcome-overlay__panel"
              initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: reduceMotion ? 0.2 : 0.55 }}
            >
              <p className="welcome-overlay__eyebrow">Lazy Sheep Dreamland</p>
              <h1 className="welcome-overlay__title">懒羊羊の小窝</h1>
              <p className="welcome-overlay__subtitle">{getGreeting()}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="floating-nav">
        <div className="floating-nav__shell">
          <div className="floating-nav__brand">
            <span className="floating-nav__brand-title">懒羊羊の小窝</span>
            <span className="floating-nav__brand-subtitle">Lazy Sheep Dreamland</span>
          </div>

          <nav className="floating-nav__links" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink key={item.path} className="floating-nav__link" to={item.path} end={item.path === '/'}>
                  {({ isActive }) => (
                    <>
                      <Icon size={18} weight="duotone" />
                      <span>{item.label}</span>
                      {isActive && <motion.span layoutId="nav-dot" className="floating-nav__dot" />}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>

          <div className="floating-nav__actions">
            <button
              className="floating-nav__icon-button"
              type="button"
              onClick={() => setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))}
            >
              {theme === 'light' ? <MoonStars size={18} weight="duotone" /> : <Sun size={18} weight="duotone" />}
            </button>
            <button
              className="floating-nav__icon-button"
              type="button"
              onClick={() => setSettingsOpen((open) => !open)}
            >
              <GearSix size={18} weight="duotone" />
            </button>
            <button
              className="floating-nav__icon-button floating-nav__icon-button--mobile"
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
            >
              <List size={18} weight="duotone" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="floating-nav__mobile"
              initial={reduceMotion ? false : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.24 }}
            >
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    className="floating-nav__mobile-link"
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon size={18} weight="duotone" />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {settingsOpen && (
          <motion.aside
            className="settings-panel"
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: 24 }}
            transition={{ duration: 0.28 }}
          >
            <div className="settings-panel__header">
              <div>
                <p className="soft-eyebrow">小窝偏好</p>
                <h2>小窝设置</h2>
              </div>
              <button
                className="settings-panel__close"
                type="button"
                onClick={() => setSettingsOpen(false)}
              >
                收起
              </button>
            </div>

            <div className="settings-panel__group">
              <span className="settings-panel__label">背景壁纸</span>
              <div className="background-switch">
                {backgroundOptions.map((option) => (
                  <button
                    key={option.key}
                    className={`background-switch__button${backgroundKey === option.key ? ' active' : ''}`}
                    type="button"
                    onClick={() => setBackgroundKey(option.key)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-panel__group">
              <div className="settings-panel__label-row">
                <span className="settings-panel__label">背景模糊度</span>
                <span>{backgroundBlur}px</span>
              </div>
              <input
                className="settings-panel__range"
                type="range"
                min="12"
                max="24"
                step="1"
                value={backgroundBlur}
                onChange={(event) => setBackgroundBlur(Number(event.target.value))}
              />
            </div>

            <div className="settings-panel__group settings-panel__group--toggle">
              <div>
                <span className="settings-panel__label">鼠标特效</span>
                <p>柔软光晕和点击糖屑</p>
              </div>
              <button
                className={`toggle-chip${effectsEnabled ? ' active' : ''}`}
                type="button"
                onClick={() => setEffectsEnabled((enabled) => !enabled)}
              >
                {effectsEnabled ? '已开启' : '已关闭'}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <motion.div
        className="page-frame"
        key={location.pathname}
        initial={reduceMotion ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.2 : 0.45 }}
      >
        <Outlet />
      </motion.div>

      <button
        className="companion-widget"
        type="button"
        onClick={() => setSettingsOpen((open) => !open)}
      >
        <img className="companion-widget__avatar" src={lazyGoat} alt="懒羊羊陪伴挂件" />
        <span className="companion-widget__bubble">困困的设置入口</span>
      </button>
    </div>
  )
}

function DreamBackground({ image, blur, effectsEnabled }) {
  const particleList = Array.from({ length: 12 }, (_, index) => index)

  return (
    <div className="dream-background" aria-hidden="true">
      <div
        className="dream-background__image"
        style={{
          backgroundImage: `url(${image})`,
          filter: `blur(${blur}px)`,
        }}
      />
      <div className="dream-background__wash" />
      {effectsEnabled && (
        <>
          <div className="dream-background__cloud dream-background__cloud--one" />
          <div className="dream-background__cloud dream-background__cloud--two" />
          <div className="dream-background__cloud dream-background__cloud--three" />
          <div className="dream-background__sparkles">
            {particleList.map((particle) => (
              <span
                key={particle}
                className="dream-background__sparkle"
                style={{
                  left: `${6 + particle * 7.4}%`,
                  animationDelay: `${particle * 0.35}s`,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function SoftCursorEffects({ enabled, reduceMotion }) {
  const layerRef = useRef(null)
  const orbRef = useRef(null)
  const auraRef = useRef(null)

  useEffect(() => {
    if (!enabled || reduceMotion) {
      return undefined
    }

    if (!window.matchMedia('(pointer: fine)').matches) {
      return undefined
    }

    const layer = layerRef.current
    const orb = orbRef.current
    const aura = auraRef.current

    if (!layer || !orb || !aura) {
      return undefined
    }

    let pointerX = window.innerWidth / 2
    let pointerY = window.innerHeight / 2
    let orbX = pointerX
    let orbY = pointerY
    let auraX = pointerX
    let auraY = pointerY
    let rafId = 0

    const syncPointer = () => {
      orbX += (pointerX - orbX) * 0.26
      orbY += (pointerY - orbY) * 0.26
      auraX += (pointerX - auraX) * 0.12
      auraY += (pointerY - auraY) * 0.12

      orb.style.left = `${orbX}px`
      orb.style.top = `${orbY}px`
      aura.style.left = `${auraX}px`
      aura.style.top = `${auraY}px`
      rafId = window.requestAnimationFrame(syncPointer)
    }

    const handlePointerMove = (event) => {
      pointerX = event.clientX
      pointerY = event.clientY
      layer.style.setProperty('--sparkle-x', `${event.clientX}px`)
      layer.style.setProperty('--sparkle-y', `${event.clientY}px`)
    }

    const handlePointerDown = (event) => {
      const burst = document.createElement('span')
      burst.className = 'pointer-ripple'
      burst.style.left = `${event.clientX}px`
      burst.style.top = `${event.clientY}px`
      layer.appendChild(burst)

      burst.addEventListener(
        'animationend',
        () => {
          burst.remove()
        },
        { once: true },
      )
    }

    syncPointer()
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown, { passive: true })

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerdown', handlePointerDown)
      layer.querySelectorAll('.pointer-ripple').forEach((node) => node.remove())
    }
  }, [enabled, reduceMotion])

  if (!enabled || reduceMotion) {
    return null
  }

  return (
    <div ref={layerRef} className="pointer-layer" aria-hidden="true">
      <span ref={auraRef} className="pointer-aura" />
      <span ref={orbRef} className="pointer-orb" />
    </div>
  )
}

function updateTiltSurface(event) {
  const card = event.currentTarget
  const bounds = card.getBoundingClientRect()
  const ratioX = (event.clientX - bounds.left) / bounds.width
  const ratioY = (event.clientY - bounds.top) / bounds.height
  const rotateY = (ratioX - 0.5) * 10
  const rotateX = (0.5 - ratioY) * 8

  card.style.setProperty('--pointer-x', `${(ratioX * 100).toFixed(2)}%`)
  card.style.setProperty('--pointer-y', `${(ratioY * 100).toFixed(2)}%`)
  card.style.setProperty('--rotate-x', `${rotateX.toFixed(2)}deg`)
  card.style.setProperty('--rotate-y', `${rotateY.toFixed(2)}deg`)
  card.style.setProperty('--sheen-opacity', '1')
}

function resetTiltSurface(event) {
  const card = event.currentTarget
  card.style.setProperty('--pointer-x', '50%')
  card.style.setProperty('--pointer-y', '50%')
  card.style.setProperty('--rotate-x', '0deg')
  card.style.setProperty('--rotate-y', '0deg')
  card.style.setProperty('--sheen-opacity', '0')
}

function HomePage() {
  const articleFeed = useMemo(() => buildArticleFeed(), [])
  const [searchValue, setSearchValue] = useState('')
  const quickResults = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase()
    if (!keyword) {
      return []
    }

    return articleFeed
      .filter((article) =>
        [article.title, article.excerpt, article.category]
          .join(' ')
          .toLowerCase()
          .includes(keyword),
      )
      .slice(0, 3)
  }, [articleFeed, searchValue])

  return (
    <div className="dashboard">
      <section className="dashboard__search-shell glass-panel">
        <div className="dashboard__search-copy">
          <p className="soft-eyebrow">今日看板</p>
          <h1 className="dashboard__headline">今天想偷懒看点什么</h1>
        </div>
        <label className="dashboard__search" htmlFor="dream-search">
          <MagnifyingGlass size={22} weight="duotone" />
          <input
            id="dream-search"
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="输入暗号进入懒羊羊的小窝..."
          />
        </label>
        {quickResults.length > 0 && (
          <div className="dashboard__suggestions">
            {quickResults.map((article) => (
              <Link
                key={article.title}
                className="dashboard__suggestion"
                to={`/post/${article.slug}`}
              >
                <strong>{article.title}</strong>
                <span>{article.category}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard__grid">
        <motion.article
          className="glass-panel profile-panel"
          whileHover={{ y: -6, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        >
          <div className="profile-panel__avatar-ring">
            <div className="profile-panel__avatar-shell">
              <img src={lazyGoat} alt="懒羊羊风格头像" />
            </div>
          </div>
          <div className="profile-panel__content">
            <p className="soft-eyebrow">窝主名片</p>
            <h2>懒羊羊の小窝</h2>
            <p>在代码、零食和午睡之间慢慢发光。</p>
            <div className="profile-panel__stats">
              <span>文章 {articleFeed.length}</span>
              <span>说说 {momentGroups.flatMap((group) => group.items).length}</span>
              <span>照片 {albumCollections.reduce((count, album) => count + album.count, 0)}</span>
            </div>
            <div className="profile-panel__socials">
              <a href="https://github.com/yangleduo0629-cloud/-" target="_blank" rel="noreferrer">
                <Code size={18} weight="duotone" />
              </a>
              <a href="#/music">
                <Headphones size={18} weight="duotone" />
              </a>
              <a href="#/about">
                <Heart size={18} weight="duotone" />
              </a>
            </div>
          </div>
        </motion.article>

        <MusicPlayerCard />

        <motion.article
          className="glass-panel photo-preview-panel"
          whileHover={{ y: -6, scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        >
          <div className="panel-headline">
            <div>
              <p className="soft-eyebrow">懒懒相册</p>
              <h3>照片墙预览</h3>
            </div>
            <Link to="/photos">查看全部</Link>
          </div>
          <div className="photo-preview-panel__grid">
            {albumCollections[0].images.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className="photo-preview-panel__tile"
                style={{ backgroundImage: `url(${image})` }}
              />
            ))}
          </div>
        </motion.article>

        <motion.article
          className="glass-panel articles-preview-panel"
          whileHover={{ y: -6 }}
          transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        >
          <div className="panel-headline">
            <div>
              <p className="soft-eyebrow">刚写下的</p>
              <h3>最新文章</h3>
            </div>
            <Link to="/articles">进入文章页</Link>
          </div>
          <div className="articles-preview-panel__list">
            {articleFeed.length > 0 ? (
              articleFeed.slice(0, 3).map((article) => (
                <Link
                  className="articles-preview-panel__item articles-preview-panel__item-link"
                  key={article.title}
                  to={`/post/${article.slug}`}
                >
                  <div className="articles-preview-panel__meta">
                    <span>{article.category}</span>
                    <span>{article.readTime} 分钟</span>
                  </div>
                  <strong>{article.title}</strong>
                  <p>{article.excerpt}</p>
                </Link>
              ))
            ) : (
              <div className="empty-state">
                <strong>还没有文章</strong>
                <p>占位文章已经移除了。等你上传第一篇 Markdown，这里就会自动出现。</p>
                <Link className="action-button action-button--secondary" to="/publish">
                  去看发布指南
                </Link>
              </div>
            )}
          </div>
        </motion.article>

        <motion.article
          className="glass-panel moments-preview-panel"
          whileHover={{ y: -6 }}
          transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        >
          <div className="panel-headline">
            <div>
              <p className="soft-eyebrow">碎碎念</p>
              <h3>最新说说</h3>
            </div>
            <Link to="/moments">去看心情墙</Link>
          </div>
          <div className="moments-preview-panel__cards">
            {momentGroups[0].items.map((moment) => (
              <div className="moments-preview-panel__card" key={moment.text}>
                <span>{moment.mood}</span>
                <p>{moment.text}</p>
              </div>
            ))}
          </div>
        </motion.article>

        <motion.article
          className="glass-panel candy-panel"
          whileHover={{ y: -6 }}
          transition={{ type: 'spring', stiffness: 240, damping: 20 }}
        >
          <div className="panel-headline">
            <div>
              <p className="soft-eyebrow">零食口袋</p>
              <h3>趣味小卡片</h3>
            </div>
          </div>
          <div className="candy-panel__chips">
            <span><Sparkle size={16} weight="fill" /> 今日软糖值 88%</span>
            <span><FlowerLotus size={16} weight="fill" /> 草地治愈中</span>
            <span><Bell size={16} weight="fill" /> 铃铛静静响</span>
            <span><Cloud size={16} weight="fill" /> 云朵抱枕模式</span>
          </div>
        </motion.article>

        <UptimePanel />
      </section>
    </div>
  )
}

function ArticlesPage() {
  const articleFeed = useMemo(() => buildArticleFeed(), [])
  const [searchParams, setSearchParams] = useSearchParams()
  const realCategories = posts.length > 0 ? categories : ['全部']
  const activeCategory = searchParams.get('category') || '全部'
  const activeTag = searchParams.get('tag') || '全部'
  const activeYear = searchParams.get('year') || '全部'
  const activeSeries = searchParams.get('series') || '全部'
  const activeKeyword = searchParams.get('q') || ''
  const deferredKeyword = useDeferredValue(activeKeyword.trim().toLowerCase())
  const articleStats = useMemo(
    () => [
      {
        value: articleFeed.length,
        label: '已发布文章',
        note: articleFeed.length > 0 ? '会同步出现在列表、归档和 RSS 里。' : '等你发出第一篇正式文章。',
      },
      {
        value: tagGroups.length,
        label: '标签数量',
        note: '适合把专题和知识点慢慢拆细。',
      },
      {
        value: seriesGroups.length,
        label: '系列分组',
        note: '长线更新的内容可以集中整理。',
      },
      {
        value: yearGroups.length,
        label: '年份索引',
        note: '归档页会按年份自动接入内容。',
      },
    ],
    [articleFeed.length],
  )
  const filteredArticles = useMemo(
    () =>
      articleFeed.filter((article) => {
        const matchesCategory = activeCategory === '全部' || article.category === activeCategory
        const matchesTag = activeTag === '全部' || article.tags.includes(activeTag)
        const matchesYear =
          activeYear === '全部' || String(article.publishedAt || '').startsWith(activeYear)
        const matchesSeries = activeSeries === '全部' || article.series === activeSeries
        const matchesKeyword = articleMatchesKeyword(article, deferredKeyword)

        return matchesCategory && matchesTag && matchesYear && matchesSeries && matchesKeyword
      }),
    [activeCategory, activeTag, activeYear, activeSeries, articleFeed, deferredKeyword],
  )
  const reduceMotion = useReducedMotion()
  const hasFilters =
    activeCategory !== '全部' ||
    activeTag !== '全部' ||
    activeYear !== '全部' ||
    activeSeries !== '全部' ||
    activeKeyword.trim() !== ''

  function updateArticleFilter(key, value) {
    const nextParams = new URLSearchParams(searchParams)
    const normalizedValue = String(value)
    if (normalizedValue === '全部' || normalizedValue.trim() === '') {
      nextParams.delete(key)
    } else {
      nextParams.set(key, normalizedValue)
    }
    setSearchParams(nextParams, { replace: true })
  }

  function resetArticleFilters() {
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  return (
    <section className="page-board">
      <PageHeading
        title="文章"
        subtitle="记录技术、生活和偷懒时刻"
      />
      <article className="glass-panel articles-search-panel">
        <div className="panel-headline">
          <div>
            <p className="soft-eyebrow">内容检索</p>
            <h3>按关键词翻找小窝里的文章</h3>
          </div>
          {hasFilters && (
            <button
              className="action-button action-button--secondary"
              type="button"
              onClick={resetArticleFilters}
            >
              清空筛选
            </button>
          )}
        </div>
        <label className="articles-search-bar">
          <MagnifyingGlass size={20} weight="bold" />
          <input
            type="search"
            value={activeKeyword}
            placeholder="搜索标题、摘要、标签、系列或正文片段..."
            onChange={(event) => {
              const nextKeyword = event.target.value
              startTransition(() => {
                updateArticleFilter('q', nextKeyword)
              })
            }}
          />
        </label>
        <p className="articles-search-panel__hint">
          {activeKeyword.trim()
            ? `当前显示 ${filteredArticles.length} 篇结果，会同时匹配标题、摘要、标签、系列和正文。`
            : '支持直接搜索标题、摘要、标签、系列名，也能查正文里的关键词。'}
        </p>
      </article>
      <div className="content-overview-grid">
        <article className="glass-panel taxonomy-panel">
          <p className="soft-eyebrow">内容总览</p>
          <h3>文章系统的整理进度</h3>
          <div className="overview-stats">
            {articleStats.map((stat) => (
              <div className="overview-stat" key={stat.label}>
                <span>{stat.label}</span>
                <strong>{String(stat.value).padStart(2, '0')}</strong>
                <p>{stat.note}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="glass-panel taxonomy-panel export-panel">
          <p className="soft-eyebrow">订阅导出</p>
          <h3>把内容同步给外部世界</h3>
          <div className="export-link-list">
            {contentExportLinks.map((item) => (
              <a
                className="export-link"
                href={item.href}
                key={item.label}
                rel="noreferrer"
                target="_blank"
              >
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.desc}</p>
                </div>
                <span>打开</span>
              </a>
            ))}
          </div>
        </article>
      </div>
      <div className="pill-row">
        {realCategories.map((category) => (
          <button
            key={category}
            className={`pill-button${activeCategory === category ? ' active' : ''}`}
            type="button"
            onClick={() => updateArticleFilter('category', category)}
          >
            {category}
          </button>
        ))}
      </div>
      {tagGroups.length > 0 && (
        <div className="filter-group">
          <p className="soft-eyebrow">标签筛选</p>
          <div className="tag-row">
            <button
              className={`post-tag${activeTag === '全部' ? ' active' : ''}`}
              type="button"
              onClick={() => updateArticleFilter('tag', '全部')}
            >
              全部标签
            </button>
            {tagGroups.map((tag) => (
              <button
                className={`post-tag${activeTag === tag.label ? ' active' : ''}`}
                key={tag.label}
                type="button"
                onClick={() => updateArticleFilter('tag', tag.label)}
              >
                {tag.label} {tag.count}
              </button>
            ))}
          </div>
        </div>
      )}
      {(yearGroups.length > 0 || seriesGroups.length > 0) && (
        <div className="content-overview-grid">
          {yearGroups.length > 0 && (
            <article className="glass-panel taxonomy-panel">
              <p className="soft-eyebrow">年份浏览</p>
              <h3>按年份查看</h3>
              <div className="tag-row">
                <button
                  className={`post-tag${activeYear === '全部' ? ' active' : ''}`}
                  type="button"
                  onClick={() => updateArticleFilter('year', '全部')}
                >
                  全部年份
                </button>
                {yearGroups.map((year) => (
                  <button
                    className={`post-tag${activeYear === year.label ? ' active' : ''}`}
                    key={year.label}
                    type="button"
                    onClick={() => updateArticleFilter('year', year.label)}
                  >
                    {year.label} {year.count}
                  </button>
                ))}
              </div>
            </article>
          )}
          {seriesGroups.length > 0 && (
            <article className="glass-panel taxonomy-panel">
              <p className="soft-eyebrow">系列浏览</p>
              <h3>按系列查看</h3>
              <div className="tag-row">
                <button
                  className={`post-tag${activeSeries === '全部' ? ' active' : ''}`}
                  type="button"
                  onClick={() => updateArticleFilter('series', '全部')}
                >
                  全部系列
                </button>
                {seriesGroups.map((series) => (
                  <button
                    className={`post-tag${activeSeries === series.label ? ' active' : ''}`}
                    key={series.label}
                    type="button"
                    onClick={() => updateArticleFilter('series', series.label)}
                  >
                    {series.label} {series.count}
                  </button>
                ))}
              </div>
            </article>
          )}
        </div>
      )}
      {filteredArticles.length > 0 ? (
        <div className="article-grid">
          {filteredArticles.map((article) => (
            <motion.article
              key={article.title}
              className="article-cover-card glass-panel"
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              onPointerMove={reduceMotion ? undefined : updateTiltSurface}
              onPointerLeave={reduceMotion ? undefined : resetTiltSurface}
            >
              <div
                className="article-cover-card__cover"
                style={{ backgroundImage: `url(${article.coverImageUrl})` }}
              />
              <div className="article-cover-card__shade" />
              <div className="article-cover-card__content">
                <div className="article-cover-card__meta">
                  <span>{formatDate(article.publishedAt)}</span>
                  <span>{article.readTime} 分钟</span>
                  <span>{article.views} 浏览</span>
                  <span>{article.likes} 喜欢</span>
                </div>
                <Link to={`/post/${article.slug}`}>
                  <h3>{article.title}</h3>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      ) : articleFeed.length > 0 ? (
        <article className="glass-panel empty-state empty-state--large">
          <strong>暂时没有匹配的文章</strong>
          <p>可以换个关键词试试，或者把分类、标签、年份和系列筛选清空后再看看。</p>
          <button
            className="action-button action-button--secondary"
            type="button"
            onClick={resetArticleFilters}
          >
            重置筛选
          </button>
        </article>
      ) : (
        <article className="glass-panel empty-state empty-state--large">
          <strong>文章区暂时空着</strong>
          <p>占位文章已经删除。你把自己的 Markdown 发到仓库后，这里会自动生成列表和详情页。</p>
          <Link className="action-button action-button--primary" to="/publish">
            去看发布方式
          </Link>
        </article>
      )}
    </section>
  )
}

function MomentsPage() {
  return (
    <section className="page-board">
      <PageHeading
        title="说说"
        subtitle="碎碎念的小心情收纳盒"
      />
      <div className="moments-timeline">
        {momentGroups.map((group) => (
          <div className="moments-timeline__group" key={group.date}>
            <div className="moments-timeline__date">
              <strong>{group.date}</strong>
              <span />
            </div>
            <div className="moments-timeline__stream">
              {group.items.map((item) => (
                <motion.article
                  key={item.text}
                  className="moment-card glass-panel"
                  whileHover={{ y: -6, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                >
                  <div className="moment-card__mood">{item.mood}</div>
                  {item.image && (
                    <div
                      className="moment-card__image"
                      style={{ backgroundImage: `url(${item.image})` }}
                    />
                  )}
                  <p>{item.text}</p>
                  <div className="moment-card__footer">
                    <Heart size={16} weight="duotone" />
                    <span>{item.likes}</span>
                    <ChatsCircle size={16} weight="duotone" />
                    <span>{item.comments}</span>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function GuestbookPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    site: '',
    message: '',
  })
  const [submitState, setSubmitState] = useState('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  function updateField(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }))
  }

  async function submitGuestbook(event) {
    event.preventDefault()
    setSubmitState('submitting')
    setSubmitMessage('')

    const body = new FormData()
    body.append('name', formData.name)
    body.append('email', formData.email)
    body.append('site', formData.site)
    body.append('message', formData.message)
    body.append('_subject', '懒羊羊の小窝收到一条新留言')
    body.append('_template', 'table')
    body.append('_captcha', 'false')
    body.append('_url', window.location.href)

    try {
      const response = await fetch(guestbookEndpoint, {
        method: 'POST',
        body,
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      setSubmitState('success')
      setSubmitMessage('留言已经送到小窝邮箱啦。你也可以晚一点回来看看有没有回音。')
      setFormData({
        name: '',
        email: '',
        site: '',
        message: '',
      })
    } catch (error) {
      console.error('留言提交失败:', error)
      setSubmitState('error')
      setSubmitMessage('这次没有顺利送达，请稍后再试一次。')
    }
  }

  return (
    <section className="page-board">
      <PageHeading title="留言" subtitle="像云朵便签一样的来访留言板" />
      <motion.article
        className="glass-panel guestbook-wall-panel"
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      >
        <div className="panel-headline">
          <div>
            <p className="soft-eyebrow">公开留言墙</p>
            <h3>访客可以直接在这里留下公开留言</h3>
          </div>
          <a href={publicGuestbookConfig.repoUrl} rel="noreferrer" target="_blank">
            查看仓库
          </a>
        </div>
        <p className="guestbook-wall-panel__lead">
          这里接入了适合 GitHub Pages 的公开评论墙。访客用 GitHub 登录后，就能直接留言、回复和继续讨论。
        </p>
        <div className="favorite-cloud guestbook-wall-panel__chips">
          <span>公开展示</span>
          <span>支持回复</span>
          <span>适合长期交流</span>
        </div>
        <PublicGuestbookWall />
      </motion.article>
      <div className="guestbook-grid">
        <motion.article
          className="glass-panel guestbook-form-panel"
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        >
          <div className="panel-headline">
            <div>
              <p className="soft-eyebrow">悄悄留言</p>
              <h3>也可以私下发一封小纸条</h3>
            </div>
          </div>

          <form className="guestbook-form" onSubmit={submitGuestbook}>
            <label className="guestbook-field">
              <span>昵称</span>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={updateField}
                placeholder="比如 草地访客"
                required
              />
            </label>

            <label className="guestbook-field">
              <span>邮箱，可选</span>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={updateField}
                placeholder="想收到回复可以留邮箱"
              />
            </label>

            <label className="guestbook-field">
              <span>站点，可选</span>
              <input
                name="site"
                type="url"
                value={formData.site}
                onChange={updateField}
                placeholder="https://your-blog.example"
              />
            </label>

            <label className="guestbook-field">
              <span>留言内容</span>
              <textarea
                name="message"
                value={formData.message}
                onChange={updateField}
                placeholder="今天也欢迎你来这里发呆、提建议、交换友链。"
                rows={6}
                required
              />
            </label>

            <div className="guestbook-form__actions">
              <button
                className="action-button action-button--primary"
                type="submit"
                disabled={submitState === 'submitting'}
              >
                {submitState === 'submitting' ? '正在送出...' : '提交留言'}
              </button>
            </div>

            {submitState !== 'idle' && (
              <p className={`guestbook-status guestbook-status--${submitState}`}>
                {submitMessage}
              </p>
            )}
          </form>
        </motion.article>

        <motion.article
          className="glass-panel guestbook-note-panel"
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        >
          <div className="panel-headline">
            <div>
              <p className="soft-eyebrow">留言说明</p>
              <h3>访客怎么留言</h3>
            </div>
          </div>

          <div className="guestbook-note-list">
            {guestbookTips.map((tip) => (
              <article className="guest-note" key={tip.title}>
                <strong>{tip.title}</strong>
                <p>{tip.text}</p>
              </article>
            ))}
          </div>
        </motion.article>
      </div>
    </section>
  )
}

function NovelsPage() {
  return (
    <section className="page-board">
      <PageHeading title="小说" subtitle="写在云朵和零食之间的小故事草稿箱" />
      <div className="story-list glass-panel">
        {novelChapters.map((chapter) => (
          <div className="story-list__item" key={chapter.title}>
            <div>
              <strong>{chapter.title}</strong>
              <p>{chapter.desc}</p>
            </div>
            <span>{chapter.meta}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function FavoritesPage() {
  return (
    <section className="page-board">
      <PageHeading title="收藏夹" subtitle="把喜欢的东西都装进软软的口袋里" />
      <div className="favorite-cloud glass-panel">
        {favoriteEntries.map((entry) => (
          <span key={entry}>{entry}</span>
        ))}
      </div>
    </section>
  )
}

function ProjectsPage() {
  return (
    <section className="page-board">
      <PageHeading title="项目" subtitle="慢慢发光的小计划和正在酝酿的点子" />
      <div className="project-grid">
        {projectEntries.map((project) => (
          <motion.article
            key={project.title}
            className="glass-panel project-card"
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          >
            <div className="project-card__state">{project.state}</div>
            <h3>{project.title}</h3>
            <p>{project.desc}</p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

function FriendsPage() {
  return (
    <section className="page-board">
      <PageHeading title="友链" subtitle="以后会把温柔又认真写博客的人挂在这里" />
      <div className="friend-grid">
        {friendEntries.map((friend) => {
          const cardContent = (
            <>
              <div className="friend-card__badge">
                <Handshake size={22} weight="duotone" />
                <span>{formatFriendSite(friend)}</span>
              </div>
              <strong>{friend.name}</strong>
              <p>{friend.desc}</p>
              <span className="friend-card__hint">
                {friend.url ? '点击访问' : '把 url 填上后这里就能点开'}
              </span>
            </>
          )

          if (friend.url) {
            return (
              <motion.a
                key={friend.name}
                className="glass-panel friend-card friend-card--link"
                href={friend.url}
                rel="noreferrer"
                target="_blank"
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              >
                {cardContent}
              </motion.a>
            )
          }

          return (
            <motion.article
              key={friend.name}
              className="glass-panel friend-card"
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            >
              {cardContent}
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}

function PhotosPage() {
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)
  const reduceMotion = useReducedMotion()

  const activePhoto =
    selectedAlbum?.images[selectedPhotoIndex] ?? selectedAlbum?.images[0] ?? ''

  function openAlbum(album) {
    setSelectedAlbum(album)
    setSelectedPhotoIndex(0)
  }

  function closeAlbum() {
    setSelectedAlbum(null)
    setSelectedPhotoIndex(0)
  }

  function showNextPhoto() {
    if (!selectedAlbum) {
      return
    }

    setSelectedPhotoIndex((currentIndex) => (
      currentIndex + 1
    ) % selectedAlbum.images.length)
  }

  function showPreviousPhoto() {
    if (!selectedAlbum) {
      return
    }

    setSelectedPhotoIndex((currentIndex) => (
      currentIndex - 1 + selectedAlbum.images.length
    ) % selectedAlbum.images.length)
  }

  return (
    <section className="page-board">
      <PageHeading title="照片墙" subtitle="像零食贴纸本一样的懒羊羊相册" />
      <div className="album-grid">
        {albumCollections.map((album) => (
          <motion.button
            key={album.title}
            className="album-card"
            type="button"
            whileHover={reduceMotion ? undefined : { y: -8, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            onClick={() => openAlbum(album)}
          >
            <div className="album-card__stack">
              {album.stack.map((image, index) => (
                <span
                  key={`${album.title}-${index}`}
                  className={`album-card__photo layer-${index + 1}`}
                  style={{ backgroundImage: `url(${image})` }}
                />
              ))}
            </div>
            <div className="album-card__body">
              <strong>{album.title}</strong>
              <p>{album.caption}</p>
            </div>
            <span className="album-card__badge">{album.count} 张</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedAlbum && (
          <motion.div
            className="lightbox"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
          >
            <button
              className="lightbox__backdrop"
              type="button"
              onClick={closeAlbum}
            />
            <motion.div
              className="lightbox__panel glass-panel"
              initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 18, scale: 0.98 }}
            >
              <div className="lightbox__header">
                <div>
                  <p className="soft-eyebrow">相册展开</p>
                  <h3>{selectedAlbum.title}</h3>
                </div>
                <button type="button" onClick={closeAlbum}>
                  关闭
                </button>
              </div>
              <div className="lightbox__viewer">
                <button className="lightbox__nav" type="button" onClick={showPreviousPhoto}>
                  上一张
                </button>
                <div
                  className="lightbox__hero"
                  style={{ backgroundImage: `url(${activePhoto})` }}
                />
                <button className="lightbox__nav" type="button" onClick={showNextPhoto}>
                  下一张
                </button>
              </div>
              <div className="lightbox__count">
                第 {selectedPhotoIndex + 1} 张 / 共 {selectedAlbum.images.length} 张
              </div>
              <div className="lightbox__grid">
                {selectedAlbum.images.map((image, index) => (
                  <button
                    key={index}
                    className={`lightbox__image${selectedPhotoIndex === index ? ' active' : ''}`}
                    type="button"
                    onClick={() => setSelectedPhotoIndex(index)}
                    style={{ backgroundImage: `url(${image})` }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function ArchivesPage() {
  const dynamicArchiveNodes = useMemo(() => {
    if (posts.length === 0) {
      return []
    }

    return yearGroups.map((year, index) => {
      const yearPosts = posts
        .filter((post) => String(post.publishedAt || '').startsWith(year.label))
        .slice(0, 3)

      return {
        year: year.label,
        title: `${year.count} 篇文章`,
        text: yearPosts.map((post) => post.title).join(' / '),
        align: index % 2 === 0 ? 'top' : 'bottom',
      }
    })
  }, [])

  return (
    <section className="page-board">
      <PageHeading title="归档" subtitle="在草地上的时间河流里翻看慢慢积累的记忆" />
      <ArchiveRiverBoard nodes={dynamicArchiveNodes.length > 0 ? dynamicArchiveNodes : archiveNodes} />
    </section>
  )
}

function MusicPage() {
  return (
    <section className="page-board">
      <PageHeading title="音乐" subtitle="夜里抱着零食偷偷听歌的小小情绪板" />
      <div className="music-board">
        <MusicPlayerCard expanded />
        <div className="glass-panel playlist-panel">
          <div className="panel-headline">
            <div>
              <p className="soft-eyebrow">陪伴歌单</p>
              <h3>糖纸歌单</h3>
            </div>
          </div>
          <div className="playlist-panel__list">
            {playlist.map((track) => (
              <div className="playlist-panel__item" key={track.title}>
                <img src={track.cover} alt={track.title} />
                <div>
                  <strong>{track.title}</strong>
                  <p>{track.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function AboutPage() {
  return (
    <section className="page-board">
      <PageHeading title="关于" subtitle="一个藏在草地和云朵里的梦幻小窝" />
      <div className="about-layout">
        <article className="glass-panel about-card">
          <p className="soft-eyebrow">关于小窝</p>
          <h3>懒羊羊主题的高质感二次元博客</h3>
          <p>
            这里不想做成普通儿童站，也不想只是贴一堆卡通元素。我更想把懒羊羊的柔软、慵懒、治愈和一点点偷懒的浪漫，收成一个能长期写东西的小窝。
          </p>
        </article>
        <article className="glass-panel about-card">
          <p className="soft-eyebrow">最近状态</p>
          <h3>目前状态</h3>
          <p>
            首页、文章、说说、照片墙、归档、音乐和设置面板都已经准备好。等第一篇真实文章上线以后，这个页面会更完整。
          </p>
          <Link className="action-button action-button--secondary" to="/publish">
            去看发文方式
          </Link>
        </article>
      </div>
    </section>
  )
}

function PublishGuidePage() {
  return (
    <section className="page-board">
      <PageHeading
        title="发布指南"
        subtitle="改仓库内容后自动部署，这个小窝会自己更新到 GitHub Pages"
      />
      <div className="guide-grid">
        {publishFlow.map((step) => (
          <article className="glass-panel guide-step" key={step.title}>
            <p className="soft-eyebrow">自动发布流程</p>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>

      <article className="glass-panel publish-panel">
        <div className="panel-headline">
          <div>
            <p className="soft-eyebrow">发文提醒</p>
            <h3>发文前的小提醒</h3>
          </div>
        </div>
        <div className="favorite-cloud publish-panel__chips">
          {publishChecklist.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </article>

      <article className="glass-panel publish-panel">
        <div className="panel-headline">
          <div>
            <p className="soft-eyebrow">订阅与导出</p>
            <h3>构建后会自动更新这些公开文件</h3>
          </div>
          <span className="hero-panel__badge">当前公开文章 {posts.length} 篇</span>
        </div>
        <div className="export-link-list">
          {contentExportLinks.map((item) => (
            <a
              className="export-link"
              href={item.href}
              key={item.label}
              rel="noreferrer"
              target="_blank"
            >
              <div>
                <strong>{item.label}</strong>
                <p>{item.desc}</p>
              </div>
              <span>查看</span>
            </a>
          ))}
        </div>
      </article>

      <article className="glass-panel publish-panel">
        <div className="panel-headline">
          <div>
            <p className="soft-eyebrow">文章模板</p>
            <h3>新文章模板</h3>
          </div>
        </div>
        <pre className="code-panel code-panel--block">
          <code>{articleTemplate}</code>
        </pre>
      </article>
    </section>
  )
}

function ArticlePage() {
  const { slug } = useParams()
  const articleFeed = buildArticleFeed()
  const post = articleFeed.find((item) => item.slug === slug)

  if (!post) {
    return <NotFoundPage />
  }

  const headings = extractHeadings(post.content)
  const { previousPost, nextPost } = getAdjacentPosts(articleFeed, post.slug)
  const relatedPosts = getRelatedPosts(articleFeed, post)
  const createHeadingId = createHeadingIdFactory()
  const readingMinutes = post.readTime || estimateReadingMinutes(post.content)
  const showToc = post.showToc !== false && headings.length > 0

  return (
    <section className="page-board">
      <article className="glass-panel article-detail">
        <div className="article-detail__meta">
          <span>{formatDate(post.publishedAt)}</span>
          {post.updatedAt && post.updatedAt !== post.publishedAt && (
            <span>更新于 {formatDate(post.updatedAt)}</span>
          )}
          <span>{post.category}</span>
          <span>{readingMinutes} 分钟阅读</span>
        </div>
        <h1 className="article-detail__title">{post.title}</h1>
        <p className="article-detail__excerpt">{post.excerpt}</p>
        {(post.series || post.tags.length > 0) && (
          <div className="article-detail__meta-block">
            {post.series && <span className="post-tag">系列：{post.series}</span>}
            {post.tags.length > 0 && (
              <div className="tag-row">
                {post.tags.map((tag) => (
                  <span className="post-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        <div className={`article-detail__layout${showToc ? '' : ' article-detail__layout--single'}`}>
          <div className="article-detail__body markdown-body">
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
                img({ src, alt, title }) {
                  const resolvedSrc =
                    typeof src === 'string' ? resolveContentAsset(src) || src : ''

                  return (
                    <figure className="markdown-figure">
                      <a
                        className="markdown-image-link"
                        href={resolvedSrc}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <img
                          className="markdown-image"
                          src={resolvedSrc}
                          alt={alt || title || '文章插图'}
                          loading="lazy"
                        />
                      </a>
                      {title && <figcaption className="markdown-caption">{title}</figcaption>}
                    </figure>
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
          {showToc && (
            <aside className="article-detail__rail">
              <div className="article-detail__toc glass-panel">
                <p className="soft-eyebrow">Article Guide</p>
                <h3>文章目录</h3>
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
              </div>
            </aside>
          )}
        </div>

        <div className="article-nav-row">
          {previousPost ? (
            <Link className="article-nav-row__item" to={`/post/${previousPost.slug}`}>
              <span>上一篇</span>
              <strong>{previousPost.title}</strong>
            </Link>
          ) : (
            <div className="article-nav-row__item muted">
              <span>上一篇</span>
              <strong>已经是最新一篇了</strong>
            </div>
          )}
          {nextPost ? (
            <Link className="article-nav-row__item" to={`/post/${nextPost.slug}`}>
              <span>下一篇</span>
              <strong>{nextPost.title}</strong>
            </Link>
          ) : (
            <div className="article-nav-row__item muted">
              <span>下一篇</span>
              <strong>已经到底了</strong>
            </div>
          )}
        </div>

        {relatedPosts.length > 0 && (
          <div className="article-related">
            <p className="soft-eyebrow">Related Posts</p>
            <h3>相关文章</h3>
            <div className="article-nav-row">
              {relatedPosts.map((relatedPost) => (
                <Link className="article-nav-row__item" key={relatedPost.slug} to={`/post/${relatedPost.slug}`}>
                  <span>{relatedPost.category}</span>
                  <strong>{relatedPost.title}</strong>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </section>
  )
}

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <section className="page-board">
      <article className="glass-panel not-found-panel">
        <p className="soft-eyebrow">迷路云团</p>
        <h1>这里暂时还没有门牌号</h1>
        <p>像在云朵堆里迷路了一样。先回首页休息一下，或者去发第一篇文章。</p>
        <div className="action-row">
          <button className="action-button action-button--primary" type="button" onClick={() => navigate('/')}>
            回到首页
          </button>
          <Link className="action-button action-button--secondary" to="/publish">
            去看发布指南
          </Link>
        </div>
      </article>
    </section>
  )
}

function ArchiveRiverBoard({ nodes }) {
  const viewportRef = useRef(null)
  const dragStateRef = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
  })

  function handlePointerDown(event) {
    const viewport = viewportRef.current
    if (!viewport) {
      return
    }

    dragStateRef.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: viewport.scrollLeft,
    }
    viewport.dataset.dragging = 'true'
    viewport.setPointerCapture?.(event.pointerId)
  }

  function handlePointerMove(event) {
    const viewport = viewportRef.current
    if (!viewport || !dragStateRef.current.active) {
      return
    }

    const deltaX = event.clientX - dragStateRef.current.startX
    viewport.scrollLeft = dragStateRef.current.scrollLeft - deltaX
  }

  function endDrag(event) {
    const viewport = viewportRef.current
    if (!viewport) {
      return
    }

    dragStateRef.current.active = false
    viewport.dataset.dragging = 'false'
    viewport.releasePointerCapture?.(event.pointerId)
  }

  function handleWheel(event) {
    const viewport = viewportRef.current
    if (!viewport || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return
    }

    viewport.scrollLeft += event.deltaY
  }

  return (
    <div className="archive-river">
      <div className="archive-river__hint">按住拖动时间河流</div>
      <div
        ref={viewportRef}
        className="archive-river__viewport"
        data-dragging="false"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={handleWheel}
      >
        <div className="archive-river__line" />
        <div className="archive-river__track">
          {nodes.map((node) => (
            <div className={`archive-node ${node.align}`} key={node.year}>
              <div className="archive-node__dot" />
              <article className="glass-panel archive-node__card">
                <span>{node.year}</span>
                <strong>{node.title}</strong>
                <p>{node.text}</p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PageHeading({ title, subtitle, eyebrow = '云朵分区' }) {
  return (
    <div className="page-heading">
      <p className="soft-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  )
}

function MusicPlayerCard({ expanded = false }) {
  const reduceMotion = useReducedMotion()
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [trackIndex, setTrackIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [playbackError, setPlaybackError] = useState('')
  const track = playlist[trackIndex]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return undefined
    }

    function syncProgress() {
      setProgress(audio.duration > 0 ? audio.currentTime / audio.duration : 0)
    }

    function handleEnded() {
      setIsPlaying(false)
      setProgress(0)
    }

    function handlePlay() {
      setIsPlaying(true)
      setPlaybackError('')
    }

    function handlePause() {
      setIsPlaying(false)
    }

    function handleError() {
      setPlaybackError('这首歌暂时没有加载出来，请再点一次播放。')
      setIsPlaying(false)
    }

    syncProgress()
    audio.addEventListener('timeupdate', syncProgress)
    audio.addEventListener('loadedmetadata', syncProgress)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', syncProgress)
      audio.removeEventListener('loadedmetadata', syncProgress)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [track.src])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return undefined
    }

    setProgress(0)
    setPlaybackError('')

    if (!isPlaying) {
      return undefined
    }

    async function startPlayback() {
      try {
        await audio.play()
      } catch {
        setPlaybackError('浏览器拦截了这次播放，请再点一次播放按钮。')
        setIsPlaying(false)
      }
    }

    if (audio.readyState >= 2) {
      void startPlayback()
      return undefined
    }

    audio.addEventListener('canplay', startPlayback, { once: true })
    return () => {
      audio.removeEventListener('canplay', startPlayback)
    }
  }, [track.src, isPlaying])

  async function toggleTrack() {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    if (!audio.paused) {
      audio.pause()
      return
    }

    setPlaybackError('')

    try {
      await audio.play()
    } catch {
      setPlaybackError('浏览器拦截了这次播放，请再点一次播放按钮。')
      setIsPlaying(false)
    }
  }

  function nextTrack() {
    setTrackIndex((index) => (index + 1) % playlist.length)
    setProgress(0)
  }

  return (
    <motion.article
      className={`glass-panel music-card${expanded ? ' music-card--expanded' : ''}`}
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 240, damping: 20 }}
    >
      <div className="panel-headline">
        <div>
          <p className="soft-eyebrow">夜里偷听</p>
          <h3>糖果随身听</h3>
        </div>
        <button className="music-card__next" type="button" onClick={nextTrack}>
          下一首
        </button>
      </div>

      <div className="music-card__body">
        <audio
          key={track.src}
          ref={audioRef}
          preload="metadata"
          src={track.src}
        />
        <div
          className="music-card__cover"
          style={{ backgroundImage: `url(${track.cover})` }}
        />
        <div className="music-card__info">
          <strong>{track.title}</strong>
          <p>{track.artist}</p>
          <div className="music-card__progress">
            <span style={{ width: `${progress * 100}%` }} />
          </div>
          <div className="music-card__controls">
            <button type="button" onClick={() => void toggleTrack()}>
              {isPlaying ? (
                <PauseCircle size={34} weight="duotone" />
              ) : (
                <PlayCircle size={34} weight="duotone" />
              )}
            </button>
            <div className="music-card__meta">
              <Waveform size={18} weight="duotone" />
              <span>{isPlaying ? '夜里抱着零食偷偷听歌' : '按下播放，开始发呆'}</span>
            </div>
          </div>
          {playbackError && (
            <p className="music-card__error">{playbackError}</p>
          )}
        </div>
      </div>

      <div className="music-card__lyrics">
        “{track.lyric}”
      </div>
    </motion.article>
  )
}

function UptimePanel() {
  const launchedAt = new Date('2026-06-21T00:00:00Z').getTime()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const elapsed = now - launchedAt
  const days = Math.max(0, Math.floor(elapsed / (1000 * 60 * 60 * 24)))
  const hours = Math.max(0, Math.floor((elapsed / (1000 * 60 * 60)) % 24))
  const minutes = Math.max(0, Math.floor((elapsed / (1000 * 60)) % 60))
  const timeText = new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(now)

  return (
    <motion.article
      className="glass-panel uptime-panel"
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 240, damping: 20 }}
    >
      <div className="uptime-panel__clock">
        <ClockCountdown size={24} weight="duotone" />
        <strong>{timeText}</strong>
      </div>
      <div className="uptime-panel__body">
        <p className="soft-eyebrow">小窝状态</p>
        <h3>站点运行状态</h3>
        <div className="uptime-panel__stats">
          <span>已运行 {days} 天 {hours} 小时 {minutes} 分钟</span>
          <span>ICP备案 软绵绵准备中</span>
          <span>Pages 状态 稳定在线</span>
        </div>
      </div>
    </motion.article>
  )
}
