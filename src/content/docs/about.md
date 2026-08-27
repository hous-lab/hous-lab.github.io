---
title: 关于 Hous Lab
description: Hous Lab 是什么，这里记录什么内容
---

Hous Lab 是我的个人技术知识库的公开层，方向是：

> **Autonomous Driving × AI Systems × Edge Intelligence**

## 这里记录什么

- **部署实践** — TensorRT / TensorRT-LLM / CUDA / Jetson Orin / Qualcomm QNN 上的真实部署经验
- **模型量化** — INT4 / INT8、AWQ、SmoothQuant，以及"为什么没用"的路线
- **性能分析** — Nsight、Roofline、瓶颈定位方法论
- **研究工作** — VLA、Skip-CoT、视觉 Token、世界模型

## 写作原则

1. **只写真实做过的事。** 每个结论都有实验数据或 profiling 结果支撑。
2. **保留失败的路线。** "为什么 INT8 lm_head 不行"往往比"最终用了 INT4"更有价值。
3. **文章模板统一。** TL;DR → Problem → Approach → What Didn't Work → Lessons Learned。

## 内容从哪来

所有文章都来自真实项目——模型部署、推理优化、研究实验。项目的代码沉淀在
[GitHub](https://github.com/hous-lab)，工程经验和踩坑记录沉淀在这里。

## 联系

- GitHub: [github.com/hous-lab](https://github.com/hous-lab)
