# AgenticTechStudio

拿开源数据集里的现成故事当剧本，让 AI 从剧本一路做到成片，产出一组面向小白、有趣的 AI / 计算机科普短视频。主打一个全 AI Native 流程的跑通（决策记录见 [ADR-0002](decisions/0002-ai-native-pipeline-as-core.md)）。

## 在做什么

字节跳动 Seed 开源的 MGA 数据集里，有大量把技术知识改写成冒险故事的文本。比如「主人公闯进电脑内部，每一层内存就是一道关卡」。

我把这些故事当作现成剧本，交给多个前沿大模型分工：改写剧本、设计画面、生成视频、配音合成。我只负责定方向和验收。过程全部公开在这个仓库里。

## 顺带摸清的事

为了把流程跑通，过程中顺带弄明白了这些：

- **素材从哪来**：MGA 为什么要把同一篇文章改写成故事、问答、教案等多种版本（一种给大模型扩充训练数据的方法）。[调研](research/mga-dataset.md)
- **素材能不能用**：从 24 万行里筛出 1,021 条 AI / 计算机主题的故事，并核清了许可证要求。故事模板化，要重写才能当剧本。[筛选](research/mga-story-samples.md)
- **模型怎么分工**：哪些画面交给视频模型直接生成，哪些让模型写代码渲染，各家的价格和能力差异。结论是代码渲染为主、视频模型点缀。[调研](research/video-generation-paths.md)
- **环境怎么搭**：自己在服务器上搭一条加密隧道，弄懂网络路由和加密的原理。（进行中）

## 做了什么

| 日期 | 进展 |
|---|---|
| 2026-11-24 | 立项 |
| 2026-11-24 | 核对 MGA 数据集：可作选题和剧本素材，不能直接当成稿（[调研](research/mga-dataset.md)） |
| 2026-11-24 | 调研视频生成路线：选「代码渲染为主、原生视频点缀」（[调研](research/video-generation-paths.md)） |
| 2026-11-24 | 在 24 万行中筛出 1,021 条 AI/CS 故事体样本，选定「插入排序」做首条样片（[筛选](research/mga-story-samples.md)） |

正在进行：

- [ ] 跑通第一条样片「插入排序」：Claude 与 GPT-6.2 写 Manim / HTML 动画的效果对比
- [ ] 技术练习：自己在服务器上搭一条加密隧道，弄懂路由与加密原理
- [ ] 速通补齐必要的技术基础

## 想自己做一遍，可以怎么做

流程跑通后，这里会写成可复现的步骤（使用的模型、提示词、工具链、踩过的坑）。目前可以先从这些资料开始：

- 论文：[Reformulation for Pretraining Data Augmentation](https://arxiv.org/abs/2502.04235)（ICLR 2026）
- 数据集：[ByteDance-Seed/mga-fineweb-edu](https://huggingface.co/datasets/ByteDance-Seed/mga-fineweb-edu)（原名 MAGACorpus，ODC-By 许可）
- 筛选故事样本：`pip install pyarrow`，从数据集下载 parquet 分片，运行 `python scripts/filter_mga_stories.py <分片>.parquet --out picks.jsonl`

## 数据署名

本仓库引用的样本取自 MGA-FineWeb-Edu（ByteDance-Seed），上游为 FineWeb-Edu 与 Common Crawl，依 [ODC-By 1.0](https://opendatacommons.org/licenses/by/1-0/) 授权。引用内容经转述，原网页版权归各原作者所有；如原作者要求移除，请提 Issue。

## 仓库结构

```text
README.md        项目说明（本文件）
decisions/       关键决策记录（ADR）
research/        调研结论
scripts/         数据筛选等脚本
```

后续按需增加 `output/`（成片）。
