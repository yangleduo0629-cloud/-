import {
  Archive,
  Bell,
  BookOpen,
  BookmarkSimple,
  ChatsCircle,
  ClockCountdown,
  Cloud,
  Code,
  FlowerLotus,
  GearSix,
  Handshake,
  Headphones,
  Heart,
  House,
  ImagesSquare,
  List,
  MagnifyingGlass,
  MoonStars,
  MusicNotes,
  NotePencil,
  PaperPlaneTilt,
  PauseCircle,
  PlayCircle,
  Sparkle,
  Sun,
  User,
  Waveform,
} from '@phosphor-icons/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  Children,
  isValidElement,
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
} from 'react-router-dom'
import './App.css'
import dreamBgDay from './assets/dream-bg-day.webp'
import dreamBgSunset from './assets/dream-bg-sunset.webp'
import lazyGoat from './assets/lazy-goat.jpg'
import everybodyHappyGoat from './assets/everybody-happy-goat.mp3'
import littleJumpFrog from './assets/little-jump-frog.mp3'
import stillAliveJerk from './assets/still-alive-jerk.mp3'
import {
  articleTemplate,
  publishChecklist,
  publishFlow,
} from './content/guide'
import { categories, posts, resolveContentAsset } from './content/posts'
import {
  createHeadingIdFactory,
  estimateReadingMinutes,
  extractHeadings,
  formatDate,
  getAdjacentPosts,
} from './content'

const navItems = [
  { path: '/', label: '首页', icon: House },
  { path: '/articles', label: '文章', icon: BookOpen },
  { path: '/moments', label: '说说', icon: ChatsCircle },
  { path: '/guestbook', label: '留言', icon: PaperPlaneTilt },
  { path: '/novels', label: '小说', icon: NotePencil },
  { path: '/favorites', label: '收藏夹', icon: BookmarkSimple },
  { path: '/projects', label: '项目', icon: Code },
  { path: '/friends', label: '友链', icon: Handshake },
  { path: '/photos', label: '照片墙', icon: ImagesSquare },
  { path: '/archives', label: '归档', icon: Archive },
  { path: '/music', label: '音乐', icon: MusicNotes },
  { path: '/about', label: '关于', icon: User },
]

const backgroundOptions = [
  { key: 'day', label: '午后草地', image: dreamBgDay },
  { key: 'sunset', label: '云朵黄昏', image: dreamBgSunset },
]

const momentGroups = [
  {
    date: '2026.06.21',
    items: [
      {
        mood: '懒洋洋',
        text: '今天先把首页收拾得像一个真正可以住进去的小窝，再慢慢把内容填满。',
        likes: 14,
        comments: 3,
        image: dreamBgDay,
      },
      {
        mood: '奶油云',
        text: '夜里抱着零食听歌的时候，最适合决定博客的新配色和背景。',
        likes: 8,
        comments: 2,
      },
    ],
  },
  {
    date: '2026.06.20',
    items: [
      {
        mood: '草地风',
        text: '有时候页面先漂亮起来，写作的欲望也会跟着回来。',
        likes: 11,
        comments: 1,
        image: dreamBgSunset,
      },
    ],
  },
]

const albumCollections = [
  {
    title: '午睡收纳盒',
    count: 12,
    caption: '软垫、云朵、甜点和懒羊羊的一小段午后。',
    stack: [dreamBgDay, lazyGoat, dreamBgSunset],
    images: [dreamBgDay, lazyGoat, dreamBgSunset, dreamBgDay],
  },
  {
    title: '零食云层',
    count: 8,
    caption: '像把饼干盒、铃铛和草地阳光一起夹进相册里。',
    stack: [dreamBgSunset, dreamBgDay, lazyGoat],
    images: [dreamBgSunset, dreamBgDay, lazyGoat, dreamBgSunset],
  },
  {
    title: '慢慢发光',
    count: 10,
    caption: '适合用来收藏那些看一眼就会变得柔软的画面。',
    stack: [lazyGoat, dreamBgDay, dreamBgSunset],
    images: [lazyGoat, dreamBgDay, dreamBgSunset, lazyGoat],
  },
]

const archiveNodes = [
  { year: '2026', title: '现在', text: '博客正在重新整理，第一篇真正的文章会从这里开始。', align: 'top' },
  { year: '2025', title: '想法', text: '把学习记录、说说和照片都慢慢装进同一个梦境里。', align: 'bottom' },
  { year: '2024', title: '种子', text: '最初只是想做一个能让自己舒服停留的页面。', align: 'top' },
  { year: '2023', title: '微光', text: '草地、零食、晚风和一点点想写东西的心情。', align: 'bottom' },
]

const guestbookTips = [
  {
    title: '自由留言',
    text: '想打招呼、提建议、交换友链，或者单纯留下一句今天的心情，都可以直接写在这里。',
  },
  {
    title: '回复方式',
    text: '如果你愿意收到回信，可以顺手留下邮箱。没有邮箱也可以直接提交。',
  },
  {
    title: '第一次启用',
    text: '第一次有人提交时，站长邮箱可能会收到一封激活确认邮件，确认后后续留言就会正常送达。',
  },
]

const novelChapters = [
  { title: '第一卷 · 午睡之前', meta: '预定章节 08', desc: '像在云朵里写下的慢节奏故事，目前还在草稿期。' },
  { title: '第二卷 · 零食口袋', meta: '预定章节 05', desc: '以后会收纳一些带剧情感的小短篇和梦境片段。' },
]

const favoriteEntries = [
  '奶油吐司和热牛奶',
  '蓝天、草地和午睡垫',
  '旧番、轻小说和慢节奏歌单',
  '把技术笔记写成像日记一样的东西',
]

const projectEntries = [
  {
    title: 'Lazy Shell',
    desc: '一个准备用来收纳个人脚本、片段和碎碎念的小工具仓库。',
    state: '规划中',
  },
  {
    title: 'Dream Notes',
    desc: '未来会继续把 CTF 学习记录整理成更完整的专题内容。',
    state: '缓慢施工',
  },
]

const friendEntries = [
  {
    name: '摁湿chen7chen',
    url: 'https://heliumsenbrg.github.io/ctf-writeup-blog/',
    site: 'heliumsenbrg.github.io/ctf-writeup-blog',
    desc: 'MISSION_BRIEFING，专注 CTF WriteUp 和 Web Security Writeups。',
  },
  {
    name: '草地搭子',
    url: '',
    site: '比如 https://example.com',
    desc: '如果你也在认真写博客，这里会预留一个温柔的位置。',
  },
]

const playlist = [
  {
    title: '大家一起喜羊羊',
    artist: '周笔畅',
    cover: dreamBgDay,
    src: everybodyHappyGoat,
    lyric: '把草地、铃铛和快乐都装进播放器里，一按下就像整个小窝一起热闹起来。',
  },
  {
    title: '小跳蛙',
    artist: '青蛙乐队',
    cover: dreamBgSunset,
    src: littleJumpFrog,
    lyric: '适合一边整理博客一边轻轻摇头晃脑，像在午后草地上慢慢蹦两下。',
  },
  {
    title: '又活了一天 (Jerk版)',
    artist: '庄东茹',
    cover: lazyGoat,
    src: stillAliveJerk,
    lyric: '夜里困困的时候最适合放这一首，像抱着枕头把今天慢慢听完。',
  },
]

const guestbookEndpoint = 'https://formsubmit.co/ajax/yangleduo0629@gmail.com'

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
  const realCategories = posts.length > 0 ? categories : ['全部']
  const [activeCategory, setActiveCategory] = useState('全部')
  const filteredArticles = articleFeed.filter(
    (article) => activeCategory === '全部' || article.category === activeCategory,
  )
  const reduceMotion = useReducedMotion()

  return (
    <section className="page-board">
      <PageHeading
        title="文章"
        subtitle="记录技术、生活和偷懒时刻"
      />
      <div className="pill-row">
        {realCategories.map((category) => (
          <button
            key={category}
            className={`pill-button${activeCategory === category ? ' active' : ''}`}
            type="button"
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
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
      <div className="guestbook-grid">
        <motion.article
          className="glass-panel guestbook-form-panel"
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        >
          <div className="panel-headline">
            <div>
              <p className="soft-eyebrow">自由留言</p>
              <h3>给小窝留一句话</h3>
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
  return (
    <section className="page-board">
      <PageHeading title="归档" subtitle="在草地上的时间河流里翻看慢慢积累的记忆" />
      <ArchiveRiverBoard />
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
  const createHeadingId = createHeadingIdFactory()
  const readingMinutes = post.readTime || estimateReadingMinutes(post.content)

  return (
    <section className="page-board">
      <article className="glass-panel article-detail">
        <div className="article-detail__meta">
          <span>{formatDate(post.publishedAt)}</span>
          <span>{post.category}</span>
          <span>{readingMinutes} 分钟阅读</span>
        </div>
        <h1 className="article-detail__title">{post.title}</h1>
        <p className="article-detail__excerpt">{post.excerpt}</p>
        <div className="article-detail__layout">
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
          <aside className="article-detail__rail">
            <div className="article-detail__toc glass-panel">
              <p className="soft-eyebrow">Article Guide</p>
              
              <h3>文章目录</h3>
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
                <p className="sidebar-text">这篇文章还没有分节标题。</p>
              )}
            </div>
          </aside>
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

function ArchiveRiverBoard() {
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
          {archiveNodes.map((node) => (
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
