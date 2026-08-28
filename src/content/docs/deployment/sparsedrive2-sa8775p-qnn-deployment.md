---
title: 地平线开源模型 SparseDriveV2 在高通 AI Hub 8775P 平台的量化部署
description: SparseDriveV2 在 SA8775P 上的 INT8 量化部署全过程：backbone 20.1ms、head 从 1253ms 优化到 716.2ms 的调参记录，以及一个理论验证通过、等待真机验证的融合算子。
sidebar:
  order: 1

---

- 模型: [SparseDriveV2](https://github.com/swc-17/SparseDriveV2) (Bench2Drive, MIT)
- 平台: Qualcomm SA8775P ADP (AI Hub 云端设备)
- 结果: **backbone** 20.1 ms; **head** **716.2 ms** / 峰值内存 21-32 MB
- 代码: [hous-lab/sparsedrive2-sa8775p-qnn](https://github.com/hous-lab/sparsedrive2-sa8775p-qnn)

## 1. 背景

SparseDriveV2 是地平线开源的端到端自动驾驶模型，我们此前已经完成了它在 NVIDIA AGX Orin 64GB 上的TensorRT部署，端到端延迟 49.2ms@int8。*关于Orin平台的部署细节等过段时间空闲了再具体介绍下。*

这次要做的是高通的平台，直接使用高通官方提供的云端 [AI Hub](https://aihub.qualcomm.com)。这里云端托管了一批真实设备，包括智驾领域的SA8775P。通过它，我们可以在没有硬件的情况下完成这个模型在高通芯片上的量化、编译和推理测试，把整条技术链路的基本流程走一遍。

模型的两个子网络最终都完成了量化部署：backbone（ResNet-34，纯卷积）**20.1 ms**，head（含 Deformable Aggregation 采样链）**716.2 ms**。backbone没啥好说的的纯卷积平台算子支持度最高，一切顺利。问题是具有Transformer及复杂算子的head，主要是摸清楚平台的算子支持度、底层资源分配等，最直接的就是Profiling分析，在TRT生态也是这一套。

## 2. 平台的最小闭环

用 AI Hub 做部署只需要三步。

配置账号凭证：

```bash
pip install qai-hub
qai-hub configure   # 写入 ~/.qai_hub/client.ini
```

确认目标设备在线：

```python
import qai_hub as hub
hub.get_devices("SA8775P ADP")
# [Device(name='SA8775P ADP', attributes=[..., 'chipset:qualcomm-sa8775p',
#         'hexagon:v73', 'htp-supports-fp16:true', 'framework:qnn'])]
```

提交 compile + profile 任务：

```python
cj, pj = hub.submit_compile_and_profile_jobs(model, device=dev, compile_options="...")
cj.wait()   # 编译
pj.wait()   # 推理测量, 完成后 download_profile() 拿结果
```

整个流程和本地跑 SNPE/QNN 工具链没有本质区别，差别只是编译和测量发生在云端的真实设备上。对一个没有开发板的团队来说，这基本解决了"先有数据再决定买不买板子"的问题。

## 3. Backbone: 纯卷积模型的标准路径

先说简单的那个。Backbone 是 ResNet-34 结构，纯卷积，没有自定义算子。它的部署一次走通，正好作为参照，说明"不需要动手术"的模型在这个平台上是什么体验。

| 步骤 | 配置 | 延迟 | Estimated Peak Memory |
|------|------|------|----------------------|
| v0 | fp32 (TFLite 路径) | 157.5 ms | 132-677 MB |
| v1 | INT8 PTQ (64 帧真实驾驶数据校准) | 67.0 ms | 131-517 MB |
| v2 | QNN 原生 DLC + O=3 | 57.2 ms | 19-389 MB |
| v3 | + `--quantize_io` (context binary) | **20.1 ms** | **5-14 MB** |

> 口径说明: 表中的内存是 AI Hub 网页显示的 Estimated Peak Memory Usage，即推理期间模型内存占用的估计范围（下限-上限），直观含义是"跑这个模型，设备上要为它预留多少内存"。AI Hub 的 API 另有一个独立的单值估计 (estimated_inference_peak_memory)，两者是不同的估算路径、没有固定换算关系（我们实测比值从 0.5x 到 8x 不等）。全文统一使用网页显示口径；横向对比趋势足够，绝对值以真机为准。

整个过程没有意外：云端 PTQ 直接可用，INT8 精度 cosim = 0.9967 几乎无损；O=3 正常编译（纯卷积图里没有高维中间张量——这个条件在后文的 head 上并不成立）。内存那一列值得看一眼：v2 到 v3 降了约 25 倍——v2 的输入还是 fp32，DEQUANTIZE 和布局转换会在 HTP 上产生大的 fp32 中间张量；`--quantize_io` 让 uint8 输入直接进网络后这些全部消失。backbone 的耗时也主要集中在输入侧（INT8 profile 里 DEQUANTIZE + MaxPool 占 97%），所以 `--quantize_io` 拿到了 -65%。

backbone 还给出一个后来反复验证的判断：优化手段要对症负载的分布。同一个 `--quantize_io`，backbone 上 -65%，head 上只有 -2.8%（见 §6）——原因在 §6.3 分析。

## 4. Head 第一版: 先提交, 再说话

head 的情况复杂一些。它的核心是 Deformable Aggregation——一个自定义 CUDA 算子（`DeformableAggregationPlugin`），AI Hub 和 QNN 转换器都不接受。第一步是图手术：把每个插件等价展开成纯 ONNX 子图（GridSample + 逐组加权 + 跨相机归约，共 24 个 GridSample），采样语义与训练时的 CUDA kernel 逐行对齐。展开后的模型与上游 ground truth 的余弦相似度为 1.0。

做完这个前置处理，我们提交了第一版编译。第一版的目的不是拿好成绩，而是回答两个问题：这条路通不通；如果通，时间花在哪里。

答案都拿到了。head 全图 INT8、O=2 优化等级下跑出 **1253 ms**；更重要的是 AI Hub 返回了逐算子的执行数据，堵点一目了然：

![第一版 profile 结果页 (1253.1 ms, NPU 2801 个算子)](/assets/deployment/sparsedrive2-head-v0-profile.jpg)

按算子聚合执行数据，采样链的占比一目了然：

| 组件 | cycles | 占比 |
|------|--------|------|
| Deformable Aggregation 采样链 | 1.23 B | **55.4%** |
| —— 其中 GridSample ×24 | 470 M | 21% |
| —— 其中 Mul ×48 | 370 M | 17% |
| 检测头其余 (MatMul 等) | 822 M | 37% |
| 其他 | 160 M | 7% |

Deformable Aggregation 的采样链占了 55%，后续所有工作都是围绕这 55% 展开的。

顺带记录一个技巧：context binary 的 profile 里 `execution_time` 字段全是 0，但 `execution_cycles` 是有的。按算子聚合 cycles 就能得到上面这张表。

## 5. 瓶颈的对策: 自定义融合算子 (理论验证)

采样链慢的原因可以从数据流直接看出来。展开后的子图每处理一个采样点，都要把 GridSample 的结果写回内存、读出来做加权、再写回去做归约。24 个 GridSample 输出，每个 72 MB (fp32)，一来一回就是 1.7 GB 的中间流量。这是一个典型的 memory-bound 负载。

对策是把它融合成一个算子：采样、加权、归约在寄存器里一口气做完，中间结果零落盘。我们对这条链做了 memory traffic 的理论下界分析——融合后可以消除 **97%** 的流量；并实现了完整的 C++ 参考实现，与上游 CUDA kernel 数值对齐到 cos=1.0；CPU 版的 QNN op package 在 x86 上跑通了端到端验证；HTP 版 (hexagon-v75) 也编译通过。

到这里为止一切顺利。坏消息是最后一步：把包含自定义算子的 DLC 提交到 AI Hub 时，设备端 compose 失败 (`MODEL_GRAPH_ERROR`)。换 context binary、DLC、precompiled QNN ONNX 几种载体全部一样——问题不在格式，在于云端运行时根本不加载第三方算子包。

由于手头没有 SA8775P 实物，这个算子停留在理论验证阶段：有效性的证明是完备的（97% traffic 下界 + 数值一致性），缺的是真机上的实测数字。这部分源码在仓库里，如果你有板子可以直接接上验证，这也是我们开源它的原因之一。

## 6. 标准算子框架内的调参

自定义算子走不通之后，剩下的空间只在标准算子和编译参数里。这一节是我们实际测过的参数组合，摆在一起方便对比。所有实验控制单一变量。

### 6.1 归约布局: point_first → cams_first (-38%)

Deformable Aggregation 内部的归约维度顺序可以重排。point_first 布局下归约链的张量搬运量是 2380M 元素；改成 cams_first 后降到 1603M (-33%)。HTP 上 Reshape/Transpose/搬移是实打实的开销，而 QNN 编译器并不会自动做这种调整。

1253 ms → 777.7 ms，单个改动 -38%，也是全程收益最大的一步。

### 6.2 输入通道维度: channellast (-5%)

加上 `--force_channel_last_input feat_0,feat_1,feat_2,feat_3` 把输入转成 NHWC，777.7 → 737.1 ms。收益不大，但等于白拿。

### 6.3 `--quantize_io`: 延迟小降, 内存大降

让输入输出直接用 uint8 传递，省掉 fp32 ↔ uint8 的边界转换。延迟 737.1 → 716.2 ms (-2.8%)。真正的收益在内存：AI Hub 页面的 Estimated Peak Memory Usage 从 126-137 MB 降到 **21-32 MB**，幅度约 -75%（另一项峰值统计口径为 339 → 136 MB，结论一致）。对需要多模型共存的车载场景，后者可能比延迟更有价值。

同样的选项在 §3 的 backbone 上是完全不同的故事：57.2 → 20.1 ms (-65%)。区别在于 backbone 的耗时主要在输入侧，而 head 的耗时集中在中间张量——quantize_io 只优化 IO，动不了中间。选择优化手段之前先看数据的分布在哪。

### 6.4 试过但被否掉的路线

| 路线 | 结果 | 原因 |
|------|------|------|
| float (HTP fp16 路径) | 938.9 ms (+27% vs 同配置 INT8 737.1) | memory-bound 链路上，fp16 的存储体积抵不过 int8；与 LLM 类负载上 fp16 赢的结论相反 |
| w8a16 (AIMET 本地量化) | 编译失败 | AIMET 插入的 QDQ 触发 HTP rank-6 校验错误；云端量化器的 QDQ 则没问题 |
| O=3 | 编译失败/超时 | 同样是 rank-6: HTP 张量最高支持 5 维，检测头 attention 展开出 6D 中间张量 |
| 手工插 fp16 Cast | 编译失败 | 转换器会把用户 Cast 重写成 Transpose 并丢弃精度变更 |

四条路三个根因指向同一个地方 (rank-6)。其中最反直觉的是第一条——如果凭直觉选精度路线大概率会选 fp16，实测在这里比同配置 INT8 慢 27%。教训是先看负载是 memory-bound 还是 compute-bound，再谈精度策略。

## 7. 最终结果

两个子网的最终部署配置与结果：

| 子网 | 配置 | 延迟 | Estimated Peak Memory | INT8 精度 |
|------|------|------|----------------------|----------|
| backbone | INT8 PTQ + quantize_io + qnn_dlc + O=3 | **20.1 ms** | **5-14 MB** | cosim 0.9967 |
| head 第一版 | INT8 PTQ, O=2 | 1253.1 ms | 124-134 MB | det_reg cosim ≈ 0.62 |
| **head 最终** | **INT8 PTQ + quantize_io + channel-last + O=2** | **716.2 ms** | **21-32 MB** | 同上 |

head 从第一版到最终版 -43% 延迟、-75% 内存，已到标准算子的极限；进一步的空间在 fused op（§5），等待真机验证。

![最终配置的 profile 结果页 (716.2 ms)，输入规格已是 uint8 + NHWC](/assets/deployment/sparsedrive2-head-final-profile.jpg)

对比两张截图还有一个直观的变化：第一版的输入规格是 float32[6,256,96,176] (NCHW)，最终版是 uint8[6,96,176,256] (NHWC)——6.3 节的两项优化最终都体现在了模型接口上。

## 8. 部署建议

写给要在同类平台上做同样事情的人：

- 先提交一版拿到 per-op 分布，再动手优化。没有 cycle 分布，后面所有的决策都是在猜。
- 区分 memory-bound 和 compute-bound，再选精度。前者省存储 (int8 赢)，后者用原生半精度 (fp16 赢)，两者结论相反。
- 编译器不做布局优化。归约维度顺序这类结构性调整要自己动手，这里面藏着最大的单项收益。
- `--quantize_io` 无脑加，尤其在意内存的时候；但要对延迟收益有正确预期——取决于输入占多大比例。
- middle-ground 精度路线 (w8a16) 目前不可靠：本地 AIMET 的 QDQ 和云端量化器行为不一致，含 6D 张量的图会被前者卡死。
- 自定义算子上不了 AI Hub 云端，不是格式问题也不是能绕过的限制；有这个需求需要在本地备一台真机。

## 附: 开源仓库
当前的部署项目已经开源，follow指引可以直接复现：[hous-lab/sparsedrive2-sa8775p-qnn](https://github.com/hous-lab/sparsedrive2-sa8775p-qnn)

模型的权重请从上游仓库获取 ([swc-17/SparseDriveV2](https://github.com/swc-17/SparseDriveV2))，本仓库不含权重与校准数据。

后续计划：
- 当前没有做 map / motion_plan 的部署，不过可以复用同一套逻辑；
- fused op 需要等待真机验证，暂时挂起吧；
- 挖坑：在 Orin/TRT 侧的部署文章和开源。
