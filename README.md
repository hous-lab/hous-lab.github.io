# hous-lab.github.io

> **Hous Lab** — Autonomous Driving × AI Systems × Edge Intelligence

个人技术知识库的公开层：模型部署、推理优化、量化、profiling 与研究笔记。

**线上地址**: <https://hous-lab.github.io>

## 技术栈

- [Astro](https://astro.build) + [Starlight](https://starlight.astro.build)
- GitHub Actions 自动部署到 GitHub Pages
- 推送到 `main` 分支即自动发布

## 写作与发布流程

**所有文章经作者确认后才会发布。** 只有 `main` 分支的内容会上线。

1. 复制 `TEMPLATE.md` 到 `src/content/docs/<栏目>/`，重命名，开始写作
2. 本地预览：`npm run dev` → <http://localhost:4321>
3. 确认发布：commit 并 push 到 `main`，约 40 秒后自动上线
4. 暂不发布：frontmatter 加 `draft: true`，或留在本地 / 其他分支不合并

在 `astro.config.mjs` 的 `sidebar` 里为文章加一行即可出现在侧边栏：

```js
{ label: '文章标题', link: '/deployment/你的文章/' },
```

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 构建到 dist/
```

## 目录结构

```text
TEMPLATE.md          # 文章模板（不会发布）
src/content/docs/
├── index.md         # 首页
├── projects/        # 项目
├── deployment/      # 部署实践（可按平台建子目录，如 orin/、quantization/）
├── research/        # 研究
├── engineering/     # 工程方法
├── notes/           # 技术笔记
└── about.md         # 关于
```
