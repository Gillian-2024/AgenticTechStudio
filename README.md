# agentic-tech-studio｜Agent 视频工作室

面向小白的 AI / 计算机科普视频项目。多模型 Agent 分工协作，全流程 AI Native，用作求职作品：证明文科背景也有真实的技术认知。

## 目标

- 核心交付：讲清 MGA 本身——预训练数据为什么不够、改写如何扩充数据、与模型能力的关系（见 [ADR-0001](decisions/0001-mga-explanation-as-core.md)）。
- 载体：一组有趣的科普视频，剧本素材参考 MGA 数据集的改写文本。
- 沉淀一份可复现的 AI Native 制作流程。

## 状态

2026-11-24 立项，尚未开工。

## 前置任务

1. 硬件环境：研究服务器自建 VPN（先确认是否必要与合规；备选：自建 API 中转 / 模型网关）。
2. 软件认知：调研前沿基模的能力与实现路径，定分工方案；速通课补基础。
3. 素材核验：MGA 数据集的体裁 / 受众字段与许可证。

## 待确认

- 验收标准：视频条数、时长、发布平台、是否配技术复盘文档。
- 截止时间：对应哪一轮求职。
- 假设（未验证）：MGA 不是剧本库，而是把教育网页按「体裁 × 受众」改写的语料，可能直接充当「技术知识 → 小白叙事」素材。待核对 HuggingFace 字段与许可证，结论落 `research/mga-dataset.md`。
- 「GPT-6.2 擅长三维视频」尚未查证，不作为前提。

## 参考资料

- 论文：Reformulation for Pretraining Data Augmentation（ICLR 2026）https://arxiv.org/abs/2502.04235
- MGACorpus：https://huggingface.co/datasets/bytedance-research/MAGACorpus
- MGA-FineWeb-Edu：https://huggingface.co/datasets/ByteDance-Seed/mga-fineweb-edu

## 公开发布

- 目标仓库：https://github.com/Gillian-2024/AgenticTechStudio
- 提交身份：仓库级 `git config user.email linj42520@gmail.com`，不改全局配置。
- 脱敏：不含任何前雇主 / 公司内部信息，push 前全文自查。
- 公开版 README 回答三件事：在做什么、做了什么、想复现怎么做。

## 工作流约定

目录按需新建，不预建空目录。开工后再定子目录（如 research/、scripts/、output/）。
