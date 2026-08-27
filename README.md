# hous-lab.github.io

> **Hous Lab** — Autonomous Driving × AI Systems × Edge Intelligence

个人技术知识库的公开层：模型部署（TensorRT / TensorRT-LLM / Jetson Orin / Qualcomm QNN）、
推理优化（INT4/INT8 量化、CUDA kernel、profiling）与研究工作（VLA / Skip-CoT / 世界模型）。

**线上地址**: <https://hous-lab.github.io>

## 技术栈

- [Astro](https://astro.build) + [Starlight](https://starlight.astro.build)
- GitHub Actions 自动部署到 GitHub Pages
- 推送到 `main` 分支即自动发布

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 构建到 dist/
```

## 写新文章

1. 在 `src/content/docs/` 对应栏目目录下新建 `.md` 文件
2. frontmatter 至少包含 `title` 和 `description`
3. 文章模板：TL;DR → Problem → Background → Approach → Implementation →
   Profiling → Bottleneck Analysis → Experiment → Results →
   **What Didn't Work** → Lessons Learned → Conclusion → References
4. `git push` 后自动发布

## 目录结构

```text
src/content/docs/
├── index.md          # 首页（splash）
├── projects/         # 项目
├── deployment/       # 部署实践（orin / quantization / tensorrt-llm / qnn）
├── research/         # 研究
├── engineering/      # 工程方法（profiling / distillation）
├── notes/            # 技术笔记
└── about.md          # 关于
```
