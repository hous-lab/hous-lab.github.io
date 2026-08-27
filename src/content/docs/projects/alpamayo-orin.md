---
title: Alpamayo on Jetson Orin
description: 端到端 VLA 模型在 NVIDIA Orin 上的部署与优化：INT4/INT8、TensorRT/TensorRT-LLM、CUDA Profiling
---

**Alpamayo** 是一个端到端 VLA（Vision-Language-Action）模型部署项目，目标平台
NVIDIA Jetson Orin。整个模型分三段：

```text
视觉编码器（多摄像头 + 导航指令）
  ↓ visual tokens
LLM 主干（推理 + 动作生成）
  ↓ hidden states
Action Expert（输出连续控制量）
```

## 关键结果

- 端到端推理延迟 **0.66s**（Orin，含前后处理）
- LLM 主干 **INT4 AWQ**，lm_head 保持高精度
- 视觉编码器 **INT8 SmoothQuant**
- Action Expert 单步输出（一步蒸馏）

## 文章索引

| 主题 | 文章 |
| --- | --- |
| 整体部署 | [Jetson Orin VLA 部署全记录](/deployment/orin/jetson-orin-vla-deployment/) |
| LLM 量化 | [Alpamayo INT4 AWQ 部署](/deployment/quantization/alpamayo-int4-awq/) |
| 视觉量化 | [Vision Encoder INT8 SmoothQuant](/deployment/quantization/vision-encoder-int8-smoothquant/) |
| LLM 引擎 | [TensorRT-LLM Hidden States 部署](/deployment/tensorrt-llm/hidden-states-deployment/) |
| 动作专家 | [Action Expert 一步蒸馏](/engineering/distillation/action-expert-one-step-distillation/) |
| 性能分析 | [为什么 LLM 生成是带宽受限的](/engineering/profiling/why-llm-generation-bandwidth-bound/) |

## 相关研究

- [Skip-CoT](/research/skip-cot/) — 部署时跳过自回归推理，与本项目 Action Expert 路线互补
