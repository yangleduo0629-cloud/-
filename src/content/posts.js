const markdownModules = import.meta.glob('./posts/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
})

const assetModules = import.meta.glob('../assets/*.{png,jpg,jpeg,webp,avif,svg}', {
  eager: true,
  import: 'default',
})

function slugifyText(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function resolveCoverImage(value) {
  if (!value) {
    return ''
  }

  if (/^https?:\/\//i.test(value)) {
    return value
  }

  const normalizedName = String(value).split('/').pop()
  const assetEntry = Object.entries(assetModules).find(([filePath]) =>
    filePath.endsWith(`/${normalizedName}`),
  )

  return assetEntry?.[1] ?? ''
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
  const coverImageUrl = resolveCoverImage(data.coverImage)
  const tags = Array.isArray(data.tags)
    ? data.tags.map((item) => String(item).trim()).filter(Boolean)
    : []

  return {
    slug,
    title,
    excerpt,
    category,
    publishedAt,
    coverImageUrl,
    tags,
    content,
  }
}

export const posts = Object.entries(markdownModules)
  .map(([filePath, rawMarkdown]) => parsePostFile(filePath, rawMarkdown))
  .sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt))

export const categories = [
  '全部',
  ...new Set(posts.map((post) => post.category)),
]
