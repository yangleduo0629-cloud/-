import {
  Archive,
  BookOpen,
  BookmarkSimple,
  ChatsCircle,
  Code,
  Handshake,
  House,
  ImagesSquare,
  MusicNotes,
  NotePencil,
  PaperPlaneTilt,
  User,
} from '@phosphor-icons/react'
import dreamBgDay from '../assets/dream-bg-day.webp'
import dreamBgSunset from '../assets/dream-bg-sunset.webp'
import lazyGoat from '../assets/lazy-goat.jpg'
import everybodyHappyGoat from '../assets/everybody-happy-goat.mp3'
import littleJumpFrog from '../assets/little-jump-frog.mp3'
import stillAliveJerk from '../assets/still-alive-jerk.mp3'

export const navItems = [
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

export const backgroundOptions = [
  { key: 'day', label: '午后草地', image: dreamBgDay },
  { key: 'sunset', label: '云朵黄昏', image: dreamBgSunset },
]

export const momentGroups = [
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

export const albumCollections = [
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

export const archiveNodes = [
  { year: '2026', title: '现在', text: '博客正在重新整理，第一篇真正的文章会从这里开始。', align: 'top' },
  { year: '2025', title: '想法', text: '把学习记录、说说和照片都慢慢装进同一个梦境里。', align: 'bottom' },
  { year: '2024', title: '种子', text: '最初只是想做一个能让自己舒服停留的页面。', align: 'top' },
  { year: '2023', title: '微光', text: '草地、零食、晚风和一点点想写东西的心情。', align: 'bottom' },
]

export const guestbookTips = [
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

export const novelChapters = [
  { title: '第一卷 · 午睡之前', meta: '预定章节 08', desc: '像在云朵里写下的慢节奏故事，目前还在草稿期。' },
  { title: '第二卷 · 零食口袋', meta: '预定章节 05', desc: '以后会收纳一些带剧情感的小短篇和梦境片段。' },
]

export const favoriteEntries = [
  '奶油吐司和热牛奶',
  '蓝天、草地和午睡垫',
  '旧番、轻小说和慢节奏歌单',
  '把技术笔记写成像日记一样的东西',
]

export const projectEntries = [
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

export const friendEntries = [
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

export const playlist = [
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

export const guestbookEndpoint = 'https://formsubmit.co/ajax/yangleduo0629@gmail.com'
