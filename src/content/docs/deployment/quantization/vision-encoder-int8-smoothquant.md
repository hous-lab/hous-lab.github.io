---
title: Vision Encoder INT8 SmoothQuant
description: 视觉编码器的激活异常值处理与 INT8 部署
sidebar:
  order: 2
---

## TL;DR

视觉编码器用 INT8 SmoothQuant 部署。视觉模型的激活分布与 LLM 不同，
异常值处理是核心问题。

> <div class="hl-todo">📖 本文为骨架占位，待填充完整实验数据与代码细节。</div>

## Problem

- 视觉编码器 FP16 占整体延迟过高
- 直接 PTQ INT8 掉点严重：激活里有大幅值异常通道

## Background

- 视觉 Transformer 激活异常值的来源（LayerStat/attention logits，TODO：分析）
- SmoothQuant 的迁移公式与 alpha 参数调节

## Approach

- per-channel scaling 迁移：激活 → 权重
- alpha 校准实验（TODO：alpha 扫描结果）

## Implementation

- ONNX 导出与 QDQ 插入位置（TODO：insert position 的坑）
- TensorRT calibration 数据集构造

## Profiling

- INT8 后视觉段耗时变化（TODO：数据）
- 剩余瓶颈分析

## Experiment

- 下游任务精度：检测/分割代理任务 + 端到端驾驶指标（TODO：表）

## Results

- TODO

## What Didn't Work

- 量化 attention 前的 softmax：精度崩（TODO：分析）
- 部分层强制 INT8 无收益（TODO：层列表）

## Lessons Learned

- 视觉编码器对量化友好度 >> LLM，但异常通道必须处理
- QDQ 位置比校准算法更容易出错

## Conclusion

TODO。

## References

- SmoothQuant (TODO：补全引用)
