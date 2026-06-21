const markdownModules = import.meta.glob('./posts/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
})

const assetModules = Object.assign(
  {},
  import.meta.glob('../assets/*.{png,jpg,jpeg,webp,avif,svg,gif}', {
    eager: true,
    import: 'default',
  }),
  import.meta.glob('./posts/**/*.{png,jpg,jpeg,webp,avif,svg,gif}', {
    eager: true,
    import: 'default',
  }),
)

function slugifyText(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function resolveContentAsset(value) {
  if (!value) {
    return ''
  }

  if (/^(https?:)?\/\//i.test(value) || value.startsWith('/')) {
    return value
  }

  const normalizedPath = String(value)
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.?\//, '')
    .replace(/^posts\//, '')
    .split(/[?#]/)[0]

  const assetEntries = Object.entries(assetModules)
  const assetEntry = assetEntries.find(([filePath]) =>
    filePath.replace(/\\/g, '/').endsWith(`/${normalizedPath}`),
  ) ?? assetEntries.find(([filePath]) => {
    const normalizedFilePath = filePath.replace(/\\/g, '/')
    const fileName = normalizedFilePath.split('/').pop()
    return fileName === normalizedPath.split('/').pop()
  })

  return assetEntry?.[1] ?? ''
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

function parsePostFile(filePath, rawMarkdown) {
  const { data, content } = parseFrontmatter(rawMarkdown)
  const fileName = filePath.split('/').pop()?.replace(/\.md$/i, '') || 'untitled'
  const title = String(data.title || fileName).trim()
  const slug = String(data.slug || slugifyText(fileName)).trim()
  const excerpt = String(data.excerpt || '').trim()
  const category = String(data.category || 'Notes').trim()
  const publishedAt = String(data.publishedAt || '').trim()
  const updatedAt = String(data.updatedAt || '').trim()
  const series = String(data.series || '').trim()
  const coverImageUrl = resolveContentAsset(data.coverImage)
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
    coverImageUrl,
    tags,
    draft,
    showToc,
    content,
  }
}

export const posts = Object.entries(markdownModules)
  .map(([filePath, rawMarkdown]) => parsePostFile(filePath, rawMarkdown))
  .filter((post) => !post.draft)
  .sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt))

export const categories = [
  '全部',
  ...new Set(posts.map((post) => post.category)),
]

export const tagGroups = Array.from(
  posts.reduce((groups, post) => {
    post.tags.forEach((tag) => {
      groups.set(tag, (groups.get(tag) || 0) + 1)
    })
    return groups
  }, new Map()),
  ([label, count]) => ({ label, count }),
).sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, 'zh-CN'))

export const seriesGroups = Array.from(
  posts.reduce((groups, post) => {
    if (post.series) {
      groups.set(post.series, (groups.get(post.series) || 0) + 1)
    }
    return groups
  }, new Map()),
  ([label, count]) => ({ label, count }),
).sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, 'zh-CN'))

export const yearGroups = Array.from(
  posts.reduce((groups, post) => {
    const year = String(post.publishedAt || '').slice(0, 4)
    if (year) {
      groups.set(year, (groups.get(year) || 0) + 1)
    }
    return groups
  }, new Map()),
  ([label, count]) => ({ label, count }),
).sort((left, right) => Number(right.label) - Number(left.label))
