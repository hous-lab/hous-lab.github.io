---
title: Alpamayo INT4 AWQ 部署
description: 为什么选 AWQ、哪些层不能量化、INT4 后瓶颈如何转移
sidebar:
  order: 1
---

## TL;DR

LLM 主干用 INT4 AWQ 部署到 TensorRT-LLM。关键决策：**lm_head 不量化**，
Action Expert 单独处理。

> <div class="hl-todo">📖 本文为骨架占位，待填充完整实验数据与代码细节。</div>

## Problem

- LLM 主干 FP16 显存放不下 / 带宽吃不满
- 需要在 INT4 方案里选：GPTQ vs AWQ vs GGUF（TODO：对比表）

## Background

- AWQ 的核心思想：激活感知的 per-channel 缩放，保护显著性权重
- 与 SmoothQuant 的区别（一个作用于权重，一个把激活异常值搬到权重）

## Approach

- AWQ 校准集的构造：用驾驶场景的真实 prompt 分布，不用通用语料
- 逐层 sensitivity 分析决定哪些层保持高精度（TODO：方法）

## Implementation

- AWQ 量化流程与关键超参（TODO：w_bit / group_size / zero_point）
- 导出 TensorRT-LLM checkpoint 的坑（TODO）

## Profiling

- INT4 前后 decode 阶段的带宽占用对比（TODO：数据）
- GEMM 占比从 X% 降到 Y%

## Bottleneck Analysis

- INT4 之后瓶颈从权重加载转向：KV cache 读写 / kernel launch / 非 GEMM 算子
- 详见[为什么 LLM 生成是带宽受限的](/engineering/profiling/why-llm-generation-bandwidth-bound/)

## Experiment

- 精度评测：驾驶任务动作误差 + 语言评测（TODO：表格）
- 延迟对比：FP16 vs INT8 vs INT4（TODO：表格）

## Results

- TODO：最终部署配置与指标

## What Didn't Work

- INT8 lm_head：动作精度明显掉（TODO：数据与原因分析）
- 对 Action Expert 做同样量化：没有收益（TODO：分析）

## Lessons Learned

- 量化决策要跟着精度敏感度走，而不是跟着"更低比特"走
- 校准集分布贴近真实部署分布，比量化算法本身影响更大

## Conclusion

TODO。

## References

- AWQ: Activation-aware Weight Quantization (TODO：补全引用)
