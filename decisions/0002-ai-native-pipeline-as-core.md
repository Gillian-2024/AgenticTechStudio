# ADR-0002: 跑通 AI Native 视频流程作为核心，MGA 作为素材来源

- 日期：2026-11-24
- 状态：accepted（取代 [ADR-0001](0001-mga-explanation-as-core.md)）
- 决策人：Gillian

## Y-Statement

In the context of 用 AI 制作面向小白的 AI / 计算机科普视频, facing ADR-0001 把主线定成了「给观众讲清 MGA」、偏离了项目本意, we decided 以「跑通从剧本到成片的全 AI Native 流程」为核心、MGA 故事文本作为现成剧本来源 over 以讲解 MGA 方法为核心, to achieve 一套可复现的端到端制作流程和一组有趣的科普视频, accepting MGA 方法本身降为过程中顺带的认知。

## Context

项目本意是拿 MGA 数据集里的冒险故事式改写当现成剧本，让多个前沿大模型分工产出视频。调研中弄清 MGA 的方法、许可、模型分工、网络环境，是为跑通流程服务的副产品。

## Decision

- 核心交付：跑通「剧本 → 画面 → 配音 → 成片」的全 AI Native 流程，产出科普视频。
- MGA：剧本素材来源；方法原理作为「顺带摸清的事」记录，不作为视频主题。
- 措辞用「从剧本一路做到成片」，不写「直接生成视频」：调研结论是故事需重写、画面主体由模型写代码渲染。

## Consequences

- 正向：项目定位与本意一致；README 与调研结论不冲突。
- 负向：ADR-0001 的讲解主线不再是交付要求。
- 后续可能触发的 ADR：首条样片若证明代码渲染路线不可行，需重定画面方案。

## Sources

- 调研：[video-generation-paths.md](../research/video-generation-paths.md)、[mga-story-samples.md](../research/mga-story-samples.md)
- 立项调整讨论：2026-11-24 会话
