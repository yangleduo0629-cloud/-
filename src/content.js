export function formatDate(value) {
  if (!value) {
    return '未发布'
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value))
}

export function estimateReadingMinutes(content) {
  return Math.max(1, Math.ceil(content.length / 320))
}

export function slugifyText(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function createHeadingIdFactory() {
  const counts = new Map()

  return (text) => {
    const baseId = slugifyText(text) || 'section'
    const currentCount = counts.get(baseId) || 0
    counts.set(baseId, currentCount + 1)
    return currentCount === 0 ? baseId : `${baseId}-${currentCount}`
  }
}

export function extractHeadings(content) {
  const createHeadingId = createHeadingIdFactory()

  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('## ') || line.startsWith('### '))
    .map((line) => {
      const depth = line.startsWith('### ') ? 3 : 2
      const text = line.slice(depth + 1).trim()

      return {
        depth,
        text,
        id: createHeadingId(text),
      }
    })
}

export function getAdjacentPosts(posts, slug) {
  const currentIndex = posts.findIndex((post) => post.slug === slug)
  if (currentIndex === -1) {
    return {
      previousPost: null,
      nextPost: null,
    }
  }

  return {
    previousPost: posts[currentIndex - 1] ?? null,
    nextPost: posts[currentIndex + 1] ?? null,
  }
}

export function getRelatedPosts(posts, currentPost, limit = 2) {
  return posts
    .filter((post) => post.slug !== currentPost.slug)
    .map((post) => {
      const sharedTags = post.tags.filter((tag) => currentPost.tags.includes(tag)).length
      const sameCategory = post.category === currentPost.category ? 1 : 0
      return {
        post,
        score: sharedTags * 3 + sameCategory,
      }
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((entry) => entry.post)
}
