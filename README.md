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

正在进行：

- [ ] 核对 MGA 数据集：有哪些体裁 / 受众字段、改写样例长什么样、许可证允许怎么用
- [ ] 调研前沿大模型在脚本、画面、视频生成上的实际能力，定分工方案
- [ ] 搭建稳定访问海外模型的网络与 API 环境
- [ ] 速通补齐必要的技术基础

待验证的假设（不作为前提）：

- MGA 的改写文本可以直接当作「技术知识 → 小白叙事」的剧本素材；
- 不同模型各有所长（如审美、三维画面），适合分工协作。

## 想自己做一遍，可以怎么做

流程跑通后，这里会写成可复现的步骤（使用的模型、提示词、工具链、踩过的坑）。目前可以先从这些资料开始：

- 论文：[Reformulation for Pretraining Data Augmentation](https://arxiv.org/abs/2502.04235)（ICLR 2026）
- 数据集：[MGACorpus](https://huggingface.co/datasets/bytedance-research/MAGACorpus)
- 示例子集：[MGA-FineWeb-Edu](https://huggingface.co/datasets/ByteDance-Seed/mga-fineweb-edu)

## 仓库结构

```text
README.md        项目说明（本文件）
decisions/       关键决策记录（ADR）
```

后续按需增加 `research/`（调研结论）、`scripts/`（剧本与提示词）、`output/`（成片）。
