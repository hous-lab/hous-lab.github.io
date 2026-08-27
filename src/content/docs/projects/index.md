---
title: 项目
description: Hous Lab 的主要项目：端到端 VLA 模型部署、边缘 AI 与自动驾驶研究
---

这里是从代码仓库到公开文章的入口。每个项目是一个完整的工程闭环：
**模型 → 部署 → 优化 → 踩坑 → 文章沉淀**。

<div class="hl-grid">
  <a class="hl-card" href="/projects/alpamayo-orin/">
    <div class="hl-card-tag">VLA · Edge Deployment</div>
    <div class="hl-card-title">Alpamayo on Jetson Orin</div>
    <div class="hl-card-desc">端到端 VLA 模型（视觉编码器 + LLM 主干 + Action Expert）在 NVIDIA Orin 上的完整部署与优化。</div>
    <div class="hl-card-meta">INT4 / INT8 / TensorRT / TensorRT-LLM / CUDA</div>
  </a>
</div>

## 后续计划

- Qualcomm 平台的 VLA 部署（QNN / AI Hub）
- 世界模型相关的推理加速实验
- 更多 CUDA kernel 优化记录
