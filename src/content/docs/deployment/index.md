---
title: 部署实践
description: TensorRT / TensorRT-LLM / Jetson Orin / Qualcomm QNN 上的模型部署经验
---

把模型从 PyTorch 训练环境搬到车端芯片，中间隔着：格式转换、精度校准、算子支持、
延迟优化、显存管理。这里记录每一步的真实经验。

## 分类

| 分类 | 内容 |
| --- | --- |
| [Jetson Orin](/deployment/orin/jetson-orin-vla-deployment/) | NVIDIA 车端平台部署：TensorRT 引擎、多模态 pipeline、延迟预算 |
| [模型量化](/deployment/quantization/alpamayo-int4-awq/) | INT4 AWQ / INT8 SmoothQuant，权重与激活量化的取舍 |
| [TensorRT-LLM](/deployment/tensorrt-llm/hidden-states-deployment/) | LLM 推理框架：hidden states 输入、KV cache、plugin |
| [Qualcomm QNN](/deployment/qnn/qualcomm-qnn-custom-op/) | 高通平台：AI Hub、QNN custom kernel、fallback graph |

## 部署的通用流程

```text
PyTorch 模型
  ↓ ONNX 导出（dynamic shape / opset 版本坑）
  ↓ 精度分析（每层 sensitivity）
  ↓ 量化（PTQ / QAT / AWQ）
  ↓ 引擎构建（workspace / tactic 选择）
  ↓ Profiling（Nsight / trtexec）
  ↓ 瓶颈优化（kernel / pipeline / 精度回退）
  ↓ 端到端集成
```

每一步都可能踩坑，每个坑都值得写一篇文章。
