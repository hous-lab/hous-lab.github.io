---
title: 部署实践
description: 模型部署与推理优化的工程经验
---

把模型从训练环境搬到车端芯片，中间隔着：格式转换、精度校准、算子支持、
延迟优化、显存管理。这里记录每一步的真实经验。

## 计划覆盖的主题

- 推理引擎与模型格式转换
- 量化（PTQ / QAT / 权重量化）与精度分析
- 车端平台部署
- Profiling 与瓶颈优化

## 部署的通用流程

```text
PyTorch 模型
  ↓ ONNX 导出（dynamic shape / opset 版本坑）
  ↓ 精度分析（每层 sensitivity）
  ↓ 量化（PTQ / QAT）
  ↓ 引擎构建（workspace / tactic 选择）
  ↓ Profiling
  ↓ 瓶颈优化（kernel / pipeline / 精度回退）
  ↓ 端到端集成
```

> 文章经作者确认后才会发布，敬请期待。
