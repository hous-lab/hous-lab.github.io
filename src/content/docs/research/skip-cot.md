---
title: Skip-CoT：推理时跳过自回归推理
description: 训练时保留链式推理能力，推理时绕过自回归推理过程，同时保持动作性能
sidebar:
  order: 1
---

## TL;DR

**Skip-CoT**：VLA 模型训练时保留 CoT（链式推理）token 的生成能力，
但推理时直接跳过自回归推理段——在保持动作性能的前提下砍掉推理延迟。

> <div class="hl-todo">📖 本文为骨架占位，待填充完整实验数据与代码细节。</div>

## Problem

- CoT 提升 VLA 的规划质量，但每个推理 token 都是一次全模型前向
- 部署时 CoT 段的延迟占比过高（TODO：占比数据）

## Background

- CoT 在 VLA 中的作用机制：什么信息真正流向了动作输出（TODO：分析）
- 相关工作：推理跳过 / early exit / latent reasoning（TODO：文献对比）

## Approach

- 核心假设：CoT 的价值在**训练时的中间监督**，而非推理时的显式生成
- 训练：正常带 CoT 监督
- 推理：跳过 CoT 段生成，直接从隐藏状态进入动作生成（TODO：示意图）

## Implementation

- 跳过机制的实现：输入拼接方式与 KV cache 处理（TODO：代码）

## Experiment

- 三组对比：无 CoT 训练 / CoT 训练+CoT 推理 / CoT 训练+跳过推理（TODO：表）
- 评测：驾驶任务成功率 + 语言评测 + 延迟（TODO：数据）

## Results

- 动作性能保持（TODO：数据）
- 推理延迟显著下降（TODO：数据）

## What Didn't Work

- 直接从无 CoT 数据训练：规划能力上不来（TODO：数据）
- 部分跳过（截断 CoT 长度）：性能不稳定（TODO：分析）

## Lessons Learned

- "训练时学、推理时跳"是延迟-能力权衡的一个通用模式
- 消融实验要能区分"CoT 有用"和"CoT 生成过程有用"

## Conclusion

TODO。

## References

- TODO
