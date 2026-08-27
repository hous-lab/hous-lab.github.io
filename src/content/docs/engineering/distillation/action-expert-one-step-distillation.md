---
title: Action Expert 一步蒸馏
description: 把自回归动作 token 蒸馏成单步输出，推理时跳过多步生成
sidebar:
  order: 1
---

## TL;DR

Action Expert 原本逐 token 自回归输出动作序列。通过一步蒸馏
（one-step distillation）改成单步直接回归连续动作，推理延迟大幅下降，
动作性能基本保持。

> <div class="hl-todo">📖 本文为骨架占位，待填充完整实验数据与代码细节。</div>

## Problem

- 动作 token 逐个生成的延迟无法接受（每 token 一次全模型前向）
- 动作输出是低维连续量，自回归的必要性存疑

## Background

- AR 动作生成 vs 直接回归：各自的表达能力假设（TODO：文献梳理）
- 蒸馏作为分布匹配工具：teacher 的 soft target 信息

## Approach

- teacher：原始自回归 Action Expert（冻结）
- student：单步回归头（TODO：结构）
- 蒸馏 loss：动作空间回归 loss + teacher 隐层匹配（TODO：loss 设计）

## Implementation

- 训练数据构造：teacher rollout 还是数据集回放（TODO：选择与原因）
- 训练稳定性技巧（TODO：loss 权重、warmup）

## Experiment

- 消融：纯回归 vs 蒸馏 vs 蒸馏+隐层匹配（TODO：表）
- 端到端驾驶指标对比（TODO：表）

## Results

- 延迟：N 步自回归 → 1 步（TODO：数据）
- 性能：动作误差指标基本持平（TODO：数据）

## What Didn't Work

- 直接从头训练单步头（不用蒸馏）：性能掉（TODO：数据）
- 对 Action Expert 做 INT4 量化：没有收益，分析见 [AWQ 部署](/deployment/quantization/alpamayo-int4-awq/)

## Lessons Learned

- "生成范式"的选择要跟输出空间的性质匹配，不是所有输出都值得 AR
- 蒸馏的真正价值在 soft target 里的多峰信息

## Conclusion

TODO。

## References

- 相关蒸馏文献（TODO）
- 与 [Skip-CoT](/research/skip-cot/) 的思路关联：训练时保留能力，推理时跳过过程
