---
name: concept-explainer
description: 给初学者讲解 CS/AI 技术概念时使用——写讲解脚本、分镜（storyboard）、beat list，或编写/审查讲解动画（HTML/JS，window.seek(t) 确定性渲染）。提炼自 3Blue1Brown 场景源码与 Manim Community 文档的讲解方法，引擎无关，不依赖 Manim API。与 research/motion-quality-spec.md 配合使用：本 skill 管“讲什么、按什么顺序讲、画面元素怎么承载含义”，motion-quality-spec 管“动作质量、时间线、确定性渲染”。
---

# Concept Explainer：给初学者讲清一个技术概念

出处缩写：`3b1b:` = github.com/3b1b/videos（commit 31f8ffe），`manim:` = github.com/ManimCommunity/manim（commit 18320e2）。详见 references/sources.md。
3b1b 仓库未声明许可证：只学方法，本 skill 不含其任何代码。

## 1. 工作流（四步，按顺序，每步产出落纸再进下一步）

1. **概念 → 一句话**：用初学者能懂的词写出“它做了什么”。写不出来就还没想清楚，不进下一步。
2. **核心机制**：找出让它成立的那 1 个机制（例：注意力 = 每个词按相关度从别的词那里“取”信息）。其余细节标为“可省略”或“后面再讲”。
3. **视觉隐喻**：给机制选一个贯穿全片的具体对象（一排词块、一块钉板、一排老鼠）。对象要能“被操作”：移动、变色、合并、拆分。抽象公式只在对象行为之后出现。
4. **Beat list**：把讲解拆成 beat，每个 beat 只引入一个新概念（模板见 §3）。

## 2. 规则（每条：规则 / 为什么 / 出处）

### 对象与身份
- **R1 对象持续存在**：一个东西从头到尾是同一个画面对象，靠移动/变形表达变化，不删了重画。为什么：观众靠“同一个东西”追踪推理链，重画会切断追踪。（3b1b:_2024/transformers/attention.py，word2mob 字典让每个词块贯穿整个场景）
- **R2 变形而不替换**：状态 A→B 用插值变形（形状、位置、数值连续过渡）；只有 A、B 真的是不同东西时才淡出淡入。为什么：连续变形本身就在说“这是同一个东西变了”。（manim:docs/source/tutorials/building_blocks.rst“Transforming mobjects into other mobjects”；manim:manim/animation/transform.py 中 Transform / ReplacementTransform / FadeTransform 的区分）
- **R3 从副本派生**：新结果由旧对象“复制一份飞过去”生成，原件留在原处。为什么：观众同时看到来源和结果，因果关系可见。（3b1b:_2024/transformers/attention.py、embedding.py 大量使用 TransformFromCopy）
- **R4 数字要“数”过去**：数值变化让数字逐步递增/递减，不直接跳到终值。为什么：渐变的数字让量的变化可感知。（manim:building_blocks.rst“Creating a custom animation”的 Count 例子）
- **R5 标签跟随对象**：标签挂在对象上，对象移动标签同步移动；关系变化时标签不消失。为什么：标签一旦脱离，观众要重新配对名称和东西。（3b1b:_2024/transformers/embedding.py 的 add_updater 用法；与 motion-quality-spec §2 一致）

### 颜色与注意力
- **R6 一种颜色 = 一种含义，全片不变**：例如形容词=蓝绿，名词=棕灰；同类对象一出场就上同一色，之后不挪作他用。为什么：颜色成为免费的图例，后面无需再解释。（3b1b:_2024/transformers/attention.py 中 adj_rects / noun_rects 分组着色）
- **R7 先指再动**：要操作某个对象前，先用描边框、闪光、短暂放大把视线引过去，停半拍，再执行操作。为什么：视线没到，动作就白做了。（manim:manim/animation/indication.py 的 Indicate、Circumscribe；3b1b:attention.py 的 SurroundingRectangle、embedding.py / _2023/convolutions2/dice.py 的 FlashAround）
- **R8 用框分组，不用文字说“这几个”**：属于同一类的元素用同色半透明底框框起来。为什么：分组关系一眼可见。（3b1b:attention.py 的 word2rect）
- **R9 镜头只给当前焦点**：讲细节时推近，讲全局时拉远，镜头移动服务于“现在该看哪里”。为什么：画面里其余东西都是干扰。（3b1b:attention.py、embedding.py 各有数十处相机移动；manim:manim/scene/moving_camera_scene.py）

### 节奏
- **R10 每个 beat 只一个新概念**：一个 beat 只引入一个新对象或一个新关系。为什么：初学者的工作记忆一次只装得下一个新东西。（3b1b:_2023/clt/galton_board.py 先放钉板、再放一颗球、再放很多球，逐层加）
- **R11 依次出现，不一起砸**：一组元素用错开的依次入场（每个比前一个晚一点）。为什么：错开的顺序本身传达了读法，同时也给眼睛时间。（3b1b:attention.py 开头逐词 FadeIn，全文件 LaggedStart 上百处）
- **R12 动作后留停顿**：每个关键变化之后留出停顿让观众消化，停顿时只保留轻微环境动效。为什么：理解发生在动作结束之后。（3b1b:attention.py 约 148 处 self.wait；时长分段遵循 motion-quality-spec §1）

### 讲解结构
- **R13 先讲规则，再应用，再推广**：先用一个最小例子演示规则（1 个词、1 颗球、2 个骰子），再在完整例子上运行，最后拉远展示一般情况/公式。为什么：具体例子建立直觉，推广才有地基。（3b1b:_2023/convolutions2/dice.py 从两颗骰子到连续情况 continuous.py；galton_board.py 从一颗球到分布）
- **R14 先现象，后符号**：公式或术语在对应画面行为出现之后再出现，并把符号着色成与对应对象相同的颜色。为什么：符号成为已知画面的“名字”，而不是新负担。（3b1b:_2024/linalg/eigenlecture.py 的 set_color 用法；R6）
- **R15 用多个例子打破误解**：同一规则至少换一组输入再跑一次，最好有一个“反直觉”的例子。为什么：单例子会让观众记住例子而不是规则。（3b1b:attention.py 中多组形容词→名词箭头）
- **R16 收尾 recap 复用原对象**：总结时把前面出现过的对象缩小并排回到画面，按讲解顺序逐个高亮。为什么：recap 是“回忆”，用原对象最快唤起。（基于 R1/R7 的组合；3b1b 场景结尾常把前文对象拉远重现）

## 3. Beat 规划模板

每个 beat 一行，填满才算规划完：

| # | 新概念（只一个） | 画面对象（已有/新增） | 先指什么（R7） | 动作（变形/派生/数数） | 颜色含义 | 旁白要点 | 停顿 |
|---|---|---|---|---|---|---|---|
| 1 | 输入是一串词 | 新增：词块 ×8 | — | 逐个入场 | 灰=普通词 | “先看一句话” | 1s |
| 2 | 某些词描述另一些词 | 已有词块 | 框住 fluffy | 弧形箭头指向 creature | 蓝=形容词，棕=名词 | … | 1s |

结构骨架：钩子（一个问题/现象）→ 最小例子演示规则 → 完整例子应用 → 推广/公式 → recap。

## 4. 反模式

- 每个镜头换一套新图形，没有贯穿对象（违反 R1）。
- 状态变化用“旧图消失、新图出现”表达（违反 R2）。
- 同一颜色在不同镜头代表不同东西；或给装饰物用了含义色（违反 R6）。
- 没有高亮就直接动某个小元素，观众找不到在哪动（违反 R7）。
- 一个 beat 里同时出现新对象、新术语、新公式（违反 R10）。
- 开头就上定义/公式（违反 R13、R14）。
- 动作一个接一个不停，无停顿（违反 R12）。
- 标签固定在屏幕位置，对象移走后标签留在原地（违反 R5）。

## 5. 审查清单（分镜和成片都过一遍）

1. 能用一句初学者语言说出概念吗？核心机制只有一个吗？
2. 有一个贯穿全片的对象吗？关键对象是否全程同一实例（R1）？
3. 每个状态变化是变形/派生，而非删除重建（R2、R3）？
4. 颜色表：每种含义色只对应一种含义，全片一致（R6）？
5. 每次操作小元素前都有高亮 + 半拍停顿（R7）？
6. 每个 beat 只有一个新概念（R10）？
7. 顺序是“最小例子 → 完整例子 → 推广”，符号在现象之后（R13、R14）？
8. 至少两个例子，其中一个能打破常见误解（R15）？
9. 结尾 recap 复用前文对象（R16）？
10. 时间线、动作质量、确定性渲染已按 research/motion-quality-spec.md 验收。
