# AgenticTechStudio

一个文科生用 AI Agent 做技术科普视频的公开实验。

从读论文、写剧本到出成片，每一步都交给多个大模型分工完成，我负责定方向、做判断、验收结果。过程全部公开在这个仓库里。

## 我在做什么

用一组面向小白、有趣的短视频，讲清楚一个 AI 技术问题：**大模型的训练数据不够用了，怎么办？**

素材来自字节跳动 Seed 团队的 MGA（Massive Genre-Audience Reformulation）。它把教育类网页按不同的「体裁 × 受众」改写成多个版本，用来扩充预训练语料。这个方法本身就是一种“把知识换个讲法”，正好拿来做科普的素材和主题。

这个项目的核心不是视频数量，而是能把下面三件事讲明白（决策记录见 [ADR-0001](decisions/0001-mga-explanation-as-core.md)）：

1. 预训练数据为什么会不够；
2. 按体裁和受众改写，怎样扩充数据；
3. 这跟模型能力有什么关系。

## 我做了什么

| 日期 | 进展 |
|---|---|
| 2026-11-24 | 立项；确定「讲清 MGA」为核心交付，视频为载体 |
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
