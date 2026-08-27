---
title: TensorRT-LLM Hidden States 部署
description: 为什么 hidden_states 无法直接导出，以及如何在多模态 pipeline 里嵌入 LLM 引擎
sidebar:
  order: 1
---

## TL;DR

VLA 的 LLM 主干不接收 text token 输入，而是接收上游视觉编码器的
**hidden states**。TensorRT-LLM 的标准流程不支持这种输入，需要绕过
embedding 层直接喂 KV 层输入。

> <div class="hl-todo">📖 本文为骨架占位，待填充完整实验数据与代码细节。</div>

## Problem

- 标准 LLM 推理流程：tokenizer → embedding → transformer → lm_head
- VLA 场景：vision encoder 输出直接作为 LLM 输入，没有 token 化过程
- TensorRT-LLM 的输入 API 假设了标准流程

## Background

- TensorRT-LLM 的模型构建流程与输入张量约定（TODO：版本说明）
- 多模态 LLM（LLaVA 类）的官方做法 vs 我们的需求差异

## Approach

- 方案对比：
  1. 改 embedding 查表为恒等映射（hack，不可维护）
  2. 从第一层 transformer block 开始构建引擎（选定，TODO：原因）
  3. 写 custom plugin 接收外部张量

## Implementation

- 权重切片：跳过 embedding 参数
- 输入张量 shape 与 plugin 注册（TODO：代码）
- 与视觉编码器引擎的进程间/进程内衔接

## Profiling

- 引擎内部各阶段耗时（TODO：trace）

## Bottleneck Analysis

- hidden states 传输的显存拷贝优化（TODO：分析）

## Experiment

- 方案 2 vs 方案 3 的延迟/工程复杂度对比（TODO）

## Results

- TODO

## What Didn't Work

- 直接导出完整模型再裁剪：parser 阶段失败（TODO：报错与分析）
- 用 PyTorch backend 跑 LLM 主干：延迟不可接受（TODO：数据）

## Lessons Learned

- 推理框架的"标准用法"之外的需求，先读权重布局源码再定方案
- 多模态部署的核心工作是"框架边界的缝合"

## Conclusion

TODO。

## References

- TensorRT-LLM 文档（TODO：链接）
