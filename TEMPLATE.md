# 文章模板

写新文章时复制本文件到 `src/content/docs/<栏目>/`，改文件名和 frontmatter。

> 注意：不要把模板本身放进 `src/content/docs/`，否则会被发布。

```markdown
---
title: 文章标题
description: 一句话摘要（会显示在侧边栏和搜索结果里）
sidebar:
  order: 1
---

## TL;DR

三五行说清结论。读者只看这一段也能带走价值。

## Problem

要解决什么问题，约束是什么。

## Background

需要的背景知识，假设读者是同方向工程师。

## Approach

方案选型与理由（含被否掉的备选）。

## Implementation

关键实现细节、代码、命令。

## Profiling

性能数据、trace、时间分解。

## Bottleneck Analysis

瓶颈在哪，为什么。

## Experiment

实验设置与对比。

## Results

数据表格。

## What Didn't Work

失败路线与原因分析——最有价值的部分。

## Lessons Learned

可迁移的经验。

## Conclusion

## References
```

## Frontmatter 常用字段

| 字段 | 作用 |
| --- | --- |
| `title` | 必填，页面标题 |
| `description` | 强烈建议，用于 SEO 和搜索 |
| `sidebar.order` | 侧边栏排序（数字小的在前） |
| `draft: true` | 草稿模式，构建时不发布（本地 `npm run dev` 仍可预览） |
