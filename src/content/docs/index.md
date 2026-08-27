---
title: 智驾 AI 系统与端侧智能技术实验室
template: splash
hero:
  tagline: Autonomous Driving × AI Systems × Edge Intelligence
  description: 把真实项目里的模型部署、推理优化与端侧智能经验，沉淀成公开的技术知识库。每一篇文章都来自真实的工程实践——包括那些没走通的路线。
  actions:
    - text: 项目
      link: /projects/
      variant: primary
    - text: 研究方向
      link: /research/
      variant: secondary
    - text: 部署实践
      link: /deployment/
      variant: secondary
    - text: GitHub
      link: https://github.com/hous-lab
      variant: minimal
      icon: github
---

<div class="hl-section">
  <div class="hl-section-title"><span class="hl-index">01</span>Featured Projects</div>
  <div class="hl-section-sub">从代码到车端：端到端 VLA 模型在真实硬件上的部署与优化。</div>
  <div class="hl-grid">
    <a class="hl-card" href="/projects/alpamayo-orin/">
      <div class="hl-card-tag">Edge AI · Jetson Orin</div>
      <div class="hl-card-title">Alpamayo on Jetson Orin</div>
      <div class="hl-card-desc">端到端 VLA 模型在 Orin 上的部署、量化与推理优化。INT4 / INT8 / TensorRT / CUDA 全链路。</div>
      <div class="hl-card-meta">0.66s end-to-end inference</div>
    </a>
    <a class="hl-card" href="/deployment/orin/jetson-orin-vla-deployment/">
      <div class="hl-card-tag">Deployment</div>
      <div class="hl-card-title">Jetson Orin VLA 部署全记录</div>
      <div class="hl-card-desc">视觉编码器 + LLM 主干 + Action Expert 三段式模型的端侧落地：从 PyTorch 到 TensorRT 引擎。</div>
      <div class="hl-card-meta">vision encoder · LLM · action expert</div>
    </a>
  </div>
</div>

<div class="hl-section">
  <div class="hl-section-title"><span class="hl-index">02</span>Latest Research</div>
  <div class="hl-section-sub">推理效率、视觉 Token 与世界模型。</div>
  <div class="hl-grid">
    <a class="hl-card" href="/research/skip-cot/">
      <div class="hl-card-tag hl-tag-orange">Research</div>
      <div class="hl-card-title">Skip-CoT</div>
      <div class="hl-card-desc">在推理时绕过自回归链式推理，同时保持动作性能——训练时学推理，部署时跳过推理。</div>
      <div class="hl-card-meta">bypassing autoregressive reasoning at inference time</div>
    </a>
  </div>
</div>

<div class="hl-section">
  <div class="hl-section-title"><span class="hl-index">03</span>Engineering Notes</div>
  <div class="hl-section-sub">踩坑记录与瓶颈分析，工程师真正想看的那部分。</div>
  <div class="hl-grid">
    <a class="hl-card" href="/engineering/profiling/why-llm-generation-bandwidth-bound/">
      <div class="hl-card-tag">Profiling</div>
      <div class="hl-card-title">为什么 LLM 生成在 Orin 上是带宽受限的</div>
      <div class="hl-card-desc">GEMM 只占 7%——用 Roofline 模型解释 INT4 之后瓶颈为什么从算力转向了内存带宽。</div>
      <div class="hl-card-meta">roofline · arithmetic intensity · memory bound</div>
    </a>
    <a class="hl-card" href="/deployment/tensorrt-llm/hidden-states-deployment/">
      <div class="hl-card-tag">TensorRT-LLM</div>
      <div class="hl-card-title">TensorRT-LLM Hidden States 部署</div>
      <div class="hl-card-desc">为什么 hidden_states 无法直接导出，以及如何绕过输入层把 LLM 主干嵌进多模态 pipeline。</div>
      <div class="hl-card-meta">hidden states · engine api · plugin</div>
    </a>
    <a class="hl-card" href="/deployment/qnn/qualcomm-qnn-custom-op/">
      <div class="hl-card-tag">Qualcomm QNN</div>
      <div class="hl-card-title">QNN Custom Op 部署</div>
      <div class="hl-card-desc">AI Hub 支持了模型，却不支持我们的 custom op——在 QNN 上手写 kernel 的完整过程。</div>
      <div class="hl-card-meta">ai hub · custom kernel · fallback graph</div>
    </a>
  </div>
</div>
