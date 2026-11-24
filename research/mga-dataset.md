# MGA 数据集核对（2026-11-24）

## 结论

- MGA 的数据**能当选题和剧本素材的来源，但不能直接当成稿**。
- 数据里真的有「冒险故事」：例如把「计算机内存层次」写成主人公闯关的儿童故事（见下方样例）。
- 但它是通用教育语料：粗估约 18% 是故事体，AI/CS 主题只占很小一部分，需要筛选。
- 改写由 3.3B 小模型完成，允许增删信息，**事实必须对照原文 `raw_text` 再核**。

## 方法（讲解主线的素材）

| 问题 | 答案 | 出处 |
|---|---|---|
| 为什么要做 | 大模型继续变大，受限于数据稀缺；同一份数据重复训练太多次，效果会变差 | arXiv 摘要 |
| 改写什么 | FineWeb-Edu（去重版）里的教育网页 | 论文 §2–3 |
| 怎么改写 | 两步：① 为每篇文档生成 5 组「体裁 × 受众」；② 按每组改写一遍 | §3.1–3.2 |
| 谁来改写 | 大模型负责标注打分，3.3B 的小模型（MoE，量化）负责批量改写 | §1、§3 |
| 规模 | 每篇扩成 5 篇，token 从 195B 变为 770B（3.9 倍） | §1、Figure 1 |
| 效果 | 在数据受限场景下，比「重复原数据」或「上采样」效果好，验证到 13B 参数 | 摘要、§1 |
| 注意 | 讨论了合成数据坍塌：prompt 工程能缓解；validation loss 不适合用来检测坍塌 | §3.3（只读到开头） |

发表：ICLR 2026（OpenReview 收录，2026-01-26 发布）。

## 数据集

- 两个链接是**同一个数据集**：`bytedance-research/MAGACorpus` 已改名并重定向到 `ByteDance-Seed/mga-fineweb-edu`（已核实）。
- 许可证：**ODC-By**（已核实）。
- 规模：约 8.46 亿行；只有一个配置 `default`、一个切分 `train`。只有英文。
- 字段（已核实）：
  - `content_split`：改写后的正文。
  - `meta`：含 `genre`、`audience`、`raw_text`（原文）、`docid`、`chunk_id`、`source`、`split`、`meta_extra`（JSON，含原文 URL）。
- `genre` 和 `audience` 是**中文自由文本**，不是枚举，筛选要靠关键词匹配。
  - genre 举例：「科普故事体裁…」「历史传记故事体裁」「问答式科普文」「教学教案体裁」。
  - audience 举例：「中小学生，10-15 岁…开始接触计算机基础知识」「老年人 65 岁以上」。

## 样例

**第 3 行：CS 主题的儿童冒险故事（已核实）**

- genre：故事体裁，将计算机内存层次结构的知识融入到一个有趣的冒险故事中，主人公进入计算机内部，每个内存层次都像一个关卡。
- audience：中小学生，10-15 岁，开始接触计算机基础知识。
- 原文：Computer memory is an essential component that functions similarly to a human brain…
- 改写：Once upon a time, in a world full of magic and wonder, there was a young adventurer named Lily. One day, Lily found a strange portal that led her into a mysterious world inside a computer!…

## 怎么用到本项目

1. 筛选：`genre` 含「故事 / 科普」，`audience` 含「中小学生 / 青少年」，正文或 URL 含 CS/AI 关键词。全量很大，要流式读取。
2. 核实：对照 `raw_text` 和原网页核对事实。
3. 二次创作：改写成中文、去掉模板化开头（大量以 "Once upon a time" 开场），不要逐字搬运。
4. 署名：视频简介和 README 写明 MGACorpus（ByteDance-Seed）、论文 arXiv 2502.04235、ODC-By 许可，以及上游 FineWeb-Edu / Common Crawl。

## 许可证风险

- ODC-By 的核心义务是署名。
- 它只覆盖数据库层面的权利，**不覆盖原网页文本的版权**。逐字摘录原文有风险；用改写文本加自己的二次创作，风险更低。
- 未核对：FineWeb-Edu 自身数据卡的具体条款。

## 待验证

- 故事体比例（18%）和 AI/CS 占比来自前 100 行的粗估，需扩大样本。
- 论文 §3.3 之后的消融细节未读。

## 来源

| 来源 | 状态 |
|---|---|
| [arXiv 2502.04235](https://arxiv.org/abs/2502.04235) | 已读摘要，HTML 读到 §3.3 开头 |
| [OpenReview（ICLR 2026）](https://openreview.net/forum?id=dIOYpj9K8P) | 搜索结果确认收录 |
| [HF 数据集 ByteDance-Seed/mga-fineweb-edu](https://huggingface.co/datasets/ByteDance-Seed/mga-fineweb-edu) | API 与 datasets-server 已核实 |
| [HF bytedance-research/MAGACorpus](https://huggingface.co/datasets/bytedance-research/MAGACorpus) | 重定向到上一条 |
