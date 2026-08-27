---
title: 技术笔记
description: CUDA、Transformer、Attention、RoPE、推理优化的基础笔记
---

基础技术笔记：把容易忘记的原理和细节写成可以随时查阅的参考。

## 计划中的主题

- **CUDA** — 内存层次、warp 调度、shared memory 使用模式
- **Transformer** — attention 的计算图与显存占用分析
- **RoPE** — 旋转位置编码的实现细节与外推
- **推理** — KV cache、continuous batching、speculative decoding

> 笔记强调"能推导、能手写、能讲清楚"，而不是概念罗列。
