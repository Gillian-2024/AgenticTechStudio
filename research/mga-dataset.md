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
| 注意 | 讨论了合成数据坍塌：prompt 工程能缓解；validation loss 不适合用来检测坍塌 | §3.3、§4.3 |

发表：ICLR 2026（OpenReview 收录，2026-01-26 发布）。

## 实验结果（论文 v2 §4）

| 场景 | 对照 | MGA | 出处 |
|---|---|---|---|
| 13B 模型，50B 高质量数据要撑满 500B 训练预算 | 多收真数据（195B）：+0.11 分 | 50B 原数据 + 200B 改写：+3.46 分 | §4.2、Figure 3（500B 步） |
| 377M→13B，500B 混合数据撑满 700B | 高质量部分上采样 5 倍：+0.89→+1.41，随规模基本不变 | +1.46→+3.73，**模型越大提升越多** | §4.2、Figure 3 |
| 1.7B 模型，混合训练 1T | 10 项基准平均 41.15 | 43.40；TriviaQA 4.95→20.42 | Table 3 |
| 377M 模型，对比其他合成数据（300B） | Cosmopedia 35.57 | 37.28；但 Nemotron 的 QA 数据 40.72 更高 | Table 4 |

不利结果：1.7B 下 CSQA（42.59→41.11）、OpenBookQA（45.6→42.8）反而下降（Table 3）。

## 模型坍塌：改写尺度怎么拿捏（§3.3、§4.3）

模型如果主要吃 AI 生成的数据，内容会越来越单一，能力退化。论文用三种提示词训练改写模型：

| 提示词 | 改写质量 ≥4 分 | ≤2 分 | 训练结果 |
|---|---|---|---|
| 宽松（可大幅偏离原文） | 13.63% | 60.19% | 明显坍塌 |
| 严格（紧贴原文） | 78.37% | 4.86% | 后期像重复数据一样退化 |
| 有限一致性（居中，最终采用） | 71.06% | 6.65% | 最好 |

为什么验证损失会误导：用 MGA 训练后基准分更高，但在真实数据上的验证损失反而升高。作者发现损失变差集中在文档后段，推断模型更偏重学可泛化的规律、少记具体序列（作者解读，未直接证明）。

作者自述的局限（§6）：改写模型是早期版本；只验证到 13B 参数、1T token；数据重复的实验只是初步探索。OpenReview 审稿意见未能读取（遇到验证页）。

## 讲解用的类比（自拟，非论文内容）

1. **同一个知识点讲给不同的人听**：给小学生讲故事、给工程师写手册、给老人做问答，信息没变，学习角度变多了。
2. **复印件再复印**：越印越模糊就是坍塌。提示词太松等于改了原稿，太严等于原样再印一遍。
3. **背课文和理解课文**：默写分高（验证损失低）不等于会做应用题（基准分高）。

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

## 许可证（以下不构成法律意见）

- 视频里用到改写摘录，属于 ODC-By 的 "Produced Work"，按 §4.3 要注明内容来自该数据库并采用该许可。仓库里放数据行，按 §4.2 要附许可证链接。
- ODC-By §2.4 写明，许可**不覆盖数据库里单条内容的版权**。原网页版权归原作者，改写文本是否延续原网页版权没有定论。Common Crawl 使用条款也要求使用者尊重第三方版权、自担风险。

可以做：

- 用自己的话转述事实，引用短片段并附原始 URL。
- 仓库只放少量样例（几条到几十条，保留 URL），或只放筛选脚本、不放数据。
- 视频简介和 README 都放署名块。

不要做：

- 整段朗读或照搬长文。
- 把完整的 `raw_text` 批量提交到公开仓库。
- 删掉许可声明，或把内容说成原创。

署名块（可直接粘贴）：

```text
Contains information from MGA-FineWeb-Edu (ByteDance-Seed/mga-fineweb-edu),
derived from FineWeb-Edu-Dedup (HuggingFaceTB/smollm-corpus) and
FineWeb-Edu (HuggingFaceFW/fineweb-edu), built on Common Crawl.
Made available under the ODC Attribution License v1.0:
https://opendatacommons.org/licenses/by/1-0/
Paper: Hao et al., "Reformulation for Pretraining Data Augmentation", arXiv:2502.04235.
Excerpts are paraphrased; original web pages remain the property of their authors.

本内容部分文本取自 MGA-FineWeb-Edu（ByteDance-Seed/mga-fineweb-edu），
其上游为 SmolLM-Corpus 的 FineWeb-Edu-Dedup 与 FineWeb-Edu，原始数据来自 Common Crawl，
依 ODC Attribution License v1.0 授权：https://opendatacommons.org/licenses/by/1-0/
摘录经改写；原网页版权归各原作者所有。
```

未核对：FineWeb-Edu 数据卡的 Considerations 段（抓取失败，发布前手动打开核对）。

## 待验证

- 已扩大样本：24 万行中故事体占 23.8%，AI/CS 故事约 0.4%，详见 [样本筛选](mga-story-samples.md)。
- OpenReview 审稿意见。

## 来源

| 来源 | 状态 |
|---|---|
| [arXiv 2502.04235v2](https://arxiv.org/html/2502.04235v2) | HTML 全文已读（§1–§6） |
| [ODC-By 1.0](https://opendatacommons.org/licenses/by/1-0/) | 全文已读 |
| [Common Crawl 使用条款](https://commoncrawl.org/terms-of-use) | 已读 |
| [FineWeb-Edu 数据卡](https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu) | 只取到许可标签 |
| [OpenReview（ICLR 2026）](https://openreview.net/forum?id=dIOYpj9K8P) | 搜索结果确认收录 |
| [HF 数据集 ByteDance-Seed/mga-fineweb-edu](https://huggingface.co/datasets/ByteDance-Seed/mga-fineweb-edu) | API 与 datasets-server 已核实 |
| [HF bytedance-research/MAGACorpus](https://huggingface.co/datasets/bytedance-research/MAGACorpus) | 重定向到上一条 |
