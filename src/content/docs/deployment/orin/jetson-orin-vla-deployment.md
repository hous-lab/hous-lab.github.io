---
title: Jetson Orin 上的端到端 VLA 部署
description: 视觉编码器 + LLM 主干 + Action Expert 三段式模型的 Orin 落地全记录
sidebar:
  order: 1
---

## TL;DR

在 Jetson Orin 上部署三段式 VLA 模型，端到端延迟 0.66s。核心结论：
**三段模型要用三套不同的优化策略**——视觉编码器吃 INT8，LLM 主干吃 INT4，
Action Expert 几乎不吃量化收益。

> <div class="hl-todo">📖 本文为骨架占位，待填充完整实验数据与代码细节。</div>

## Problem

- 多摄像头输入 + LLM 主干 + Action Expert，单卡 Orin 上延迟预算极其有限
- 三段模型的精度敏感度完全不同，不能用一套量化策略
- LLM 部分需要 KV cache 与批处理策略，与视觉部分的静态图优化冲突

## Background

- Orin 的算力/带宽参数，与桌面 GPU 的关键差异
- VLA 模型的三段结构与各段计算特征（TODO：补充各段 FLOPs / 显存占用表）

## Approach

- 视觉编码器 → TensorRT FP16/INT8
- LLM 主干 → TensorRT-LLM（INT4 AWQ，详见 [AWQ 部署](/deployment/quantization/alpamayo-int4-awq/)）
- Action Expert → 保持低比特收益分析后选定精度（详见[一步蒸馏](/engineering/distillation/action-expert-one-step-distillation/)）

## Implementation

- 多摄像头前处理 pipeline（NVMM 零拷贝，TODO：细节）
- 三段之间的 hidden states 传递与显存复用
- 线程模型：预处理 / 推理 / 后处理流水线

## Profiling

- Nsight Systems 全链路 trace（TODO：贴 timeline 图）
- 各段耗时分解：preprocess / vision / LLM prefill / LLM decode / action head

## Bottleneck Analysis

- decode 阶段是带宽受限（详见[带宽分析](/engineering/profiling/why-llm-generation-bandwidth-bound/)）
- 视觉编码器在 INT8 后接近算力受限

## Experiment

- TODO：延迟/精度对比表（FP16 基线 vs INT8 vs INT4 组合）

## Results

- 端到端 0.66s（TODO：分解数据）

## What Didn't Work

- Action Expert 量化没有收益（原因分析 TODO）
- speculative decoding 最终没有采用（原因分析 TODO）

## Lessons Learned

- 三段式模型的优化必须分段看瓶颈，全局直觉会误导
- 精度敏感度：lm_head > action expert > LLM body > vision encoder（TODO：验证）

## Conclusion

TODO。

## References

- TODO
