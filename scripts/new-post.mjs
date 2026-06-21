import { access, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function slugify(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

const rawTitle = process.argv.slice(2).join(' ').trim()
if (!rawTitle) {
  console.error('Usage: npm run new-post -- "这里写文章标题"')
  process.exit(1)
}

const slug = slugify(rawTitle) || `post-${Date.now()}`
const currentFilePath = fileURLToPath(import.meta.url)
const currentDirectory = path.dirname(currentFilePath)
const postsDirectory = path.resolve(currentDirectory, '../src/content/posts')
const filePath = path.join(postsDirectory, `${today()}-${slug}.md`)

await mkdir(postsDirectory, { recursive: true })

try {
  await access(filePath)
  console.error(`File already exists: ${filePath}`)
  process.exit(1)
} catch {
  const template = `---
title: ${rawTitle}
slug: ${slug}
excerpt: 请在这里写摘要。
category: Notes
publishedAt: ${today()}
coverImage:
tags:
  - notes
---

## 先写一个小标题
这里开始写正文。

### 如果还想继续拆分
- 可以先写要点
- 再补细节

\`\`\`text
这里可以放代码块或命令记录
\`\`\`
`

  await writeFile(filePath, template, 'utf8')
  console.log(`Created new post: ${filePath}`)
}
