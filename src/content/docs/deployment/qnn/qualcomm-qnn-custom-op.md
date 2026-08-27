---
title: Qualcomm QNN Custom Op 部署
description: AI Hub 支持了模型却不支持 custom op——在 QNN 上手写 kernel 的完整过程
sidebar:
  order: 1
---

## TL;DR

在 Qualcomm 平台（QNN）部署模型时，AI Hub 验证了主干网络的可行性，
但项目里的 custom op 不在支持列表里——最终选择手写 QNN kernel。

> <div class="hl-todo">📖 本文为骨架占位，待填充完整实验数据与代码细节。</div>

## Problem

- 模型含自定义算子（TODO：说明算子功能）
- AI Hub 的导出流程遇到 custom op 直接失败
- CPU fallback 会让整图性能崩掉

## Background

- Qualcomm AI 生态：AI Hub / QNN SDK / 后端（HTP vs CPU）的关系（TODO：梳理）
- QNN 的图构建与算子注册机制

## Approach

- 三条路线对比：
  1. 用已有算子组合改写 custom op（图等价变换）
  2. CPU fallback + 子图切分
  3. 手写 QNN custom kernel（选定场景，TODO：判断标准）

## Implementation

- QNN custom kernel 的 C++ 实现骨架（TODO：代码）
- 注册、构建、集成到 context 的流程（TODO：命令）
- 精度对齐：与 PyTorch 参考实现的逐元素对比

## Profiling

- custom op 在 HTP vs CPU fallback 的耗时对比（TODO：数据）

## Experiment

- 端到端延迟与精度验证（TODO：表）

## Results

- TODO

## What Didn't Work

- 尝试用算子组合模拟：算子支持矩阵不全（TODO：缺哪些）
- AI Hub 的自动转换路径：silent fallback 到 CPU（TODO：定位过程）

## Lessons Learned

- 边缘平台选型时，先查算子支持矩阵，再验证 custom op 逃生通道
- "支持这个模型"和"支持到能上 HTP"是两回事

## Conclusion

TODO。

## References

- QNN SDK 文档（TODO：链接）
