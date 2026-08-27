---
title: 为什么 LLM 生成在 Orin 上是带宽受限的
description: 用 Roofline 模型解释：模型参数减半，延迟为什么没有减半
sidebar:
  order: 1
---

## TL;DR

在 Orin 上 profile LLM decode 阶段，发现 **GEMM 只占约 7%** 时间。
模型从 FP16 砍到 INT4，参数量降到 1/4，延迟却远没有降到 1/4——
因为 decode 的本质是**内存带宽受限**，而瓶颈在量化后转移到了
KV cache 读写和非 GEMM 算子。

> <div class="hl-todo">📖 本文为骨架占位，待填充完整实验数据与代码细节。</div>

## Problem

- 直觉：参数减半 → 显存占用减半 → 延迟减半
- 现实：INT4 相对 FP16 的延迟收益远低于 4x（TODO：实测数据）
- 需要一套能解释现象、指导下一步优化的分析框架

## Background

- Roofline 模型：算术强度（FLOPs/Byte）决定 compute-bound vs memory-bound
- LLM decode 的 batch=1 生成：每 token 只做一次 GEMV，算术强度极低
- Orin 的理论算力 vs 带宽比值（TODO：具体参数）

## Approach

- 用 Roofline 定位每类算子的运行区间（TODO：画图）

## Implementation

- Nsight Compute / trtprof 采集带宽与 SM 利用率（TODO：命令）

## Profiling

- decode 阶段时间分解：GEMM / KV cache 读写 / elementwise / norm / launch 开销
- 关键数据：GEMM ≈ 7%（TODO：完整分解表）

## Bottleneck Analysis

- 为什么 GEMV 的算术强度低：每个权重字节只参与一次乘加
- 量化后权重读取消耗下降 → 瓶颈转移到 KV cache 与激活读写
- prefill vs decode 的 bound 切换（TODO：分析）

## Experiment

- INT4 vs FP16 的带宽占用与延迟对比（TODO：数据）
- 增大 batch 对 bound 的影响（TODO：数据）

## Results

- 结论：单请求场景继续压权重比特数收益递增递减，方向应是 KV cache 与调度

## What Didn't Work

- 以为继续压到更低比特能线性加速（TODO：数据证明不行）
- speculative decoding 在带宽受限场景的收益分析（TODO：为什么最终没采用）

## Lessons Learned

- 先 Roofline 后优化：算力/带宽哪个是天花板决定了所有优化优先级
- "GEMM 只占 7%"这类反直觉数字是重新审视系统的起点

## Conclusion

TODO。

## References

- Roofline model (TODO：引用)
