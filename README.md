# 懒羊羊学习博客

这是一个适合部署在 GitHub Pages 的静态博客：

- 前台：公开展示学习文章
- 内容来源：`src/content/posts/*.md`
- 部署方式：GitHub Actions 自动发布到 GitHub Pages
- 前端：React + Vite

整体视觉延续了懒羊羊主题，同时把阅读体验收成了更接近中文技术博客的样子。

## 现在的改进

- 每篇文章独立成一个 Markdown 文件
- 支持 `npm run new-post -- "标题"` 一键生成新文章模板
- 首页支持搜索和分类筛选
- 文章页支持 Markdown 渲染、目录、代码块、表格和上一篇下一篇导航
- GitHub Actions 自动部署到 Pages

## 本地启动

```bash
npm install
npm run dev
```

默认本地地址：

- `http://localhost:5173`

## 发文方式

### 1. 一键生成文章模板

```bash
npm run new-post -- "这里写文章标题"
```

脚本会自动在 `src/content/posts/` 下创建一个新的 Markdown 文件。

### 2. 编辑文章内容

每篇文章都带 frontmatter，例如：

```md
---
title: 这里写文章标题
slug: my-new-post
excerpt: 这里写一段 1 到 2 句的摘要。
category: Reverse
publishedAt: 2026-06-21
coverImage:
tags:
  - reverse
  - 复盘
---
```

正文支持：

- `##` 和 `###` 标题
- 无序列表
- 引用块
- GFM 表格
- 代码块

### 3. 提交并推送

```bash
git add .
git commit -m "publish: add new post"
git push
```

推送完成后，GitHub Actions 会自动重新构建并发布。

## GitHub Pages 部署

### 1. 推送到 GitHub 仓库

把整个项目推到你的仓库里，推荐使用默认分支 `main`。

### 2. 启用 GitHub Pages

仓库设置里把 Pages 的来源切到 `GitHub Actions`。

### 3. 自动部署工作流

项目已经内置：

- `.github/workflows/deploy-pages.yml`

只要你 push 到 `main`，它就会自动构建并部署。

## 路由说明

为了兼容 GitHub Pages 这种纯静态托管，项目使用了哈希路由，所以文章页地址会是：

```text
https://your-name.github.io/your-repo/#/post/reverse-night-notes
```

这样即使直接刷新文章页，也不会因为静态托管缺少服务端路由而 404。

## 后续可继续扩展

- 增加归档页和标签页
- 接更完整的 Markdown 语法高亮
- 接 GitHub Discussions 做评论
- 接简易 CMS 或者自动生成脚本
