import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const currentFilePath = fileURLToPath(import.meta.url)
const currentDirectory = path.dirname(currentFilePath)
const rootDirectory = path.resolve(currentDirectory, '..')
const postsDirectory = path.resolve(rootDirectory, 'src/content/posts')
const publicDirectory = path.resolve(rootDirectory, 'public')

async function loadSiteMeta() {
  const modulePath = path.resolve(rootDirectory, 'src/content/site-meta.js')
  const siteModule = await import(pathToFileURL(modulePath).href)
  return siteModule.siteMeta
}

function slugifyText(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function parseBooleanLike(value, fallback = false) {
  if (typeof value !== 'string') {
    return fallback
  }

  const normalized = value.trim().toLowerCase()
  if (normalized === 'true') {
    return true
  }

  if (normalized === 'false') {
    return false
  }

  return fallback
}

function parseFrontmatter(rawMarkdown) {
  const normalized = rawMarkdown.replace(/\r\n/g, '\n')
  if (!normalized.startsWith('---\n')) {
    return {
      data: {},
      content: normalized.trim(),
    }
  }

  const closingIndex = normalized.indexOf('\n---\n', 4)
  if (closingIndex === -1) {
    return {
      data: {},
      content: normalized.trim(),
    }
  }

  const data = {}
  const headerLines = normalized.slice(4, closingIndex).split('\n')
  let activeListKey = null

  for (const rawLine of headerLines) {
    const line = rawLine.trimEnd()
    if (!line) {
      continue
    }

    if (line.trimStart().startsWith('- ') && activeListKey) {
      data[activeListKey].push(line.trim().slice(2).trim())
      continue
    }

    const separatorIndex = line.indexOf(':')
    if (separatorIndex === -1) {
      activeListKey = null
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()
    if (!key) {
      activeListKey = null
      continue
    }

    if (value === '') {
      data[key] = []
      activeListKey = key
      continue
    }

    data[key] = value
    activeListKey = null
  }

  return {
    data,
    content: normalized.slice(closingIndex + 5).trim(),
  }
}

function stripMarkdown(markdown) {
  return String(markdown)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/\r?\n+/g, ' ')
    .trim()
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function collectMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const targetPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        return collectMarkdownFiles(targetPath)
      }

      if (entry.isFile() && entry.name.endsWith('.md')) {
        return [targetPath]
      }

      return []
    }),
  )

  return files.flat()
}

function parsePostFile(filePath, rawMarkdown) {
  const { data, content } = parseFrontmatter(rawMarkdown)
  const fileName = path.basename(filePath, '.md')
  const title = String(data.title || fileName).trim()
  const slug = String(data.slug || slugifyText(fileName)).trim()
  const excerpt = String(data.excerpt || '').trim()
  const category = String(data.category || 'Notes').trim()
  const publishedAt = String(data.publishedAt || '').trim()
  const updatedAt = String(data.updatedAt || '').trim()
  const series = String(data.series || '').trim()
  const tags = Array.isArray(data.tags)
    ? data.tags.map((item) => String(item).trim()).filter(Boolean)
    : []
  const draft = parseBooleanLike(data.draft, false)
  const showToc = parseBooleanLike(data.showToc, true)

  return {
    slug,
    title,
    excerpt,
    category,
    publishedAt,
    updatedAt,
    series,
    tags,
    draft,
    showToc,
    content,
  }
}

function buildFeedXml(siteMeta, posts) {
  const items = posts.map((post) => {
    const link = `${siteMeta.siteUrl}#/post/${post.slug}`
    const description = escapeXml(post.excerpt || stripMarkdown(post.content).slice(0, 160))
    const pubDate = new Date(post.updatedAt || post.publishedAt || Date.now()).toUTCString()

    return [
      '    <item>',
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${escapeXml(link)}</link>`,
      `      <guid>${escapeXml(link)}</guid>`,
      `      <pubDate>${escapeXml(pubDate)}</pubDate>`,
      `      <description>${description}</description>`,
      '    </item>',
    ].join('\n')
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    `    <title>${escapeXml(siteMeta.title)}</title>`,
    `    <link>${escapeXml(siteMeta.siteUrl)}</link>`,
    `    <description>${escapeXml(siteMeta.description)}</description>`,
    `    <language>${escapeXml(siteMeta.language)}</language>`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')
}

function buildSitemapXml(siteMeta, posts) {
  const urls = [
    siteMeta.siteUrl,
    `${siteMeta.siteUrl}#/articles`,
    `${siteMeta.siteUrl}#/moments`,
    `${siteMeta.siteUrl}#/guestbook`,
    `${siteMeta.siteUrl}#/photos`,
    `${siteMeta.siteUrl}#/archives`,
    `${siteMeta.siteUrl}#/music`,
    `${siteMeta.siteUrl}#/about`,
    ...posts.map((post) => `${siteMeta.siteUrl}#/post/${post.slug}`),
  ]

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n')
}

function buildContentIndex(siteMeta, posts) {
  return JSON.stringify(
    {
      site: {
        title: siteMeta.title,
        description: siteMeta.description,
        siteUrl: siteMeta.siteUrl,
      },
      generatedAt: new Date().toISOString(),
      posts: posts.map((post) => ({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
        series: post.series,
        tags: post.tags,
        showToc: post.showToc,
      })),
    },
    null,
    2,
  )
}

await mkdir(publicDirectory, { recursive: true })
const siteMeta = await loadSiteMeta()
const markdownFiles = await collectMarkdownFiles(postsDirectory)
const posts = (
  await Promise.all(
    markdownFiles.map(async (filePath) => {
      const rawMarkdown = await readFile(filePath, 'utf8')
      return parsePostFile(filePath, rawMarkdown)
    }),
  )
)
  .filter((post) => !post.draft)
  .sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt))

await writeFile(path.join(publicDirectory, 'feed.xml'), buildFeedXml(siteMeta, posts), 'utf8')
await writeFile(path.join(publicDirectory, 'sitemap.xml'), buildSitemapXml(siteMeta, posts), 'utf8')
await writeFile(path.join(publicDirectory, 'content-index.json'), buildContentIndex(siteMeta, posts), 'utf8')

console.log(`Generated site files for ${posts.length} published post(s).`)
