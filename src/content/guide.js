export const publishFlow = [
  {
    title: '1. 生成新文章文件',
    text: '运行 npm run new-post -- "你的标题"，脚本会自动在 src/content/posts 下创建 Markdown 模板。',
  },
  {
    title: '2. 补全 frontmatter',
    text: '填写标题、slug、摘要、分类、发布日期和标签，封面可填本地图片文件名；如果有系列或更新时间，也可以一起补上。',
  },
  {
    title: '3. 用 Markdown 写正文',
    text: '正文支持标题、列表、引用、表格、代码块和图片，长文会自动生成目录。',
  },
  {
    title: '4. 提交并推送',
    text: 'git add、commit、push 之后，GitHub Actions 会自动重新构建并发布 Pages。',
  },
]

export const publishChecklist = [
  'slug 建议只用小写字母、数字和连字符，避免空格。',
  'frontmatter 的日期使用 YYYY-MM-DD，排序会更稳定。',
  '可以选填 updatedAt、series、draft、showToc 这些字段，分别表示更新时间、系列名、是否草稿和是否显示目录。',
  '封面图如果放本地，直接写文件名，比如 lazy-goat.jpg。',
  '正文插图可以写 `![说明](文件名.png)`，图片放到 src/assets 或文章同目录都能识别。',
  '尽量使用 ## 和 ### 分层，文章页会自动生成目录。',
  '代码示例请用三个反引号包起来，阅读体验会更好。',
]

export const articleTemplate = `---
title: 这里写文章标题
slug: my-new-post
excerpt: 这里写一段 1 到 2 句的摘要。
category: Reverse
publishedAt: 2026-06-21
updatedAt:
series:
coverImage:
draft: false
showToc: true
tags:
  - reverse
  - 复盘
---

## 先写一个小标题
这里开始写正文。

### 如果还想继续拆分
- 可以先写要点
- 再补细节

![这里写图片说明](lazy-goat.jpg "这是一张示例插图")

\`\`\`text
这里可以放代码块或命令记录
\`\`\`
`
