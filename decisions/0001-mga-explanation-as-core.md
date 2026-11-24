# ADR-0001: 讲清 MGA 作为核心交付，视频作为载体

- 日期：2026-11-24
- 状态：superseded by [ADR-0002](0002-ai-native-pipeline-as-core.md)
- 决策人：Gillian

## Y-Statement

In the context of 用科普视频展示对 AI 技术的理解, facing 观众会追问 MGA 是什么、为什么做数据增强, we decided 把「讲清 MGA」作为核心交付 over 以视频数量 / 画面效果为核心, to achieve 可被追问验证的技术理解, accepting 视频制作投入相对降低。

## Context

项目素材来自 MGA（Massive Genre-Audience Reformulation，ICLR 2026）。单看视频只能证明会用工具；能解释素材背后的方法，才证明技术认知。

## Decision

核心交付是对 MGA 的清晰讲解：预训练数据为什么不够、按体裁 × 受众改写如何扩充数据、这与模型能力的关系。视频服务于这条讲解线。

## Consequences

- 正向：作品经得起技术追问；讲解内容可复用到其他场合。
- 负向：需先投入时间读懂论文，视频产出推后。
- 后续可能触发的 ADR：MGA 数据集核验结果若推翻素材假设，需重定剧本来源。

## Sources

- 论文：https://arxiv.org/abs/2502.04235
- 立项讨论：2026-11-24 会话
