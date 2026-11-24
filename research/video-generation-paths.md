# 前沿基模生成视频的实际做法（截至 2026-11-24）

## 结论

- 适合本项目的路线是**以代码渲染为主体、原生视频为点缀的混合方案**：大模型写代码（Manim / HTML 动画 / Remotion）渲染出图解画面，只在开头钩子和比喻镜头用原生视频模型。
- 理由：科普需要精确的文字、公式和流程图。扩散类视频模型做不到精确，代码渲染能做到，而且可复现、成本只有 token，适合公开仓库。

## 两条前提的核查

| 说法 | 结论 | 依据 |
|---|---|---|
| GPT-6.2 擅长做三维视频 | **不准确**。GPT-6.2（Astra / Sol，2026-11-17 发布）不原生生成视频。官方原话是写出的前端在网站、游戏、3D 设计上更好，即写 Three.js 等代码，属于代码渲染路线 | [OpenAI 发布页](https://openai.com/index/introducing-gpt-6-2-astra-sol)（已核实） |
| Opus 审美好 | **主观，无直接评分**。VibeVideoBench 中 GPT-6 Astra 与 Claude Opus 5.5 在代码生成视频上排前两名；Claude 系偏好矢量绘图，这类路线得分最高。审美好可能来源于此，属推断 | [VibeVideoBench](https://arxiv.org/html/2610.35864v2)（已核实摘要） |

补充：OpenAI 的 Sora 已下线，App 2026-04-26、API 2026-09-24（[OpenAI 帮助中心](https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation)，已核实）。

## 两条生产路线

### A. 原生视频生成：模型直接出画面

| 模型 | 单段时长 | 自带音频 | 价格（约） |
|---|---|---|---|
| Veo 3.1（Google） | 8 秒，可延长 | 有 | Lite ≈ $0.08/秒 |
| Kling 3.0（快手） | 15 秒，可延长 | 有 | ≈ $0.10/秒 |
| Seedance 2.5（字节，预览） | 4–30 秒 | 有 | ≈ $0.23–0.47/秒 |
| Wan 3.0（阿里） | 30 秒 | 未验证 | ≈ $0.05–0.20/秒 |
| MiniMax H3 | 15 秒 | 未验证 | ≈ $0.13/秒 |
| Runway Gen-4.5 | 10 秒 | 需另配 | 订阅 $12 起/月 |

> 时长与价格来自第三方汇总（2026-10 前后），未逐一对照官方页面。

- 擅长：氛围镜头、比喻画面。
- 短板：画不准文字、公式、图表；同一提示词每次结果不同；按秒计费，反复调整成本高。

### B. 代码渲染：大模型写代码，代码出画面

- 工具：Manim（3Blue1Brown 风格）、Remotion（React 写视频）、Motion Canvas、Three.js、Blender Python、HTML 动画 + 无头浏览器录制。
- 相关项目：TheoremExplainAgent、Code2Video、Paper2Video（见 VibeVideoBench 引用）。
- 擅长：文字图表精确、可重复渲染、成本低、能放进仓库。
- 短板：写实画面弱；3D 场景在 VibeVideoBench 中是最弱一档，GPT-6.2 的 3D 强项需自己实测。

### 配套

配音用 TTS（ElevenLabs / OpenAI TTS / 免费的 Edge TTS），合成用 ffmpeg（可脚本化）或剪映（手动）。

## 推荐分工（推断，待实测）

1. 脚本与分镜：Claude 或 GPT-6.2 Sol。
2. 主体画面：代码渲染，由 Claude 或 GPT-6.2 写代码。
3. 点缀镜头：Veo 3.1 Lite 或 Kling，每片 2–3 段、每段 5–8 秒。
4. 配音合成：TTS + ffmpeg。

## 访问与合规

- OpenAI、Anthropic、Google 的官方服务地区通常不含中国大陆（2026 年情况未验证，以各家官方「支持地区」页为准）。
- 国内可合规使用：Kling、Seedance（火山引擎）、海螺 / MiniMax、Wan（阿里云百炼）；国内大模型也能写渲染代码。
- Manim、Remotion、ffmpeg 为开源工具，本地运行。

## 待验证

- 各视频模型的官方价格与时长。
- GPT-6.2 写 Three.js 的实际效果（自己跑一条对比）。
- Claude 与 GPT-6.2 写 Manim 的效果对比。

## 来源

| 来源 | 日期 | 类型 | 状态 |
|---|---|---|---|
| [OpenAI：Introducing GPT-6.2 Astra and Sol](https://openai.com/index/introducing-gpt-6-2-astra-sol) | 2026-11-17 | 一手 | 已核实 |
| [OpenAI：Sora discontinuation](https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation) | 2026 | 一手 | 已核实 |
| [VibeVideoBench (arXiv 2610.35864)](https://arxiv.org/html/2610.35864v2) | 2026-10-27 | 一手论文 | 已核实摘要 |
| [OpenRouter：GPT-6.2 Sol](https://openrouter.ai/openai/gpt-6.2-sol) | 2026-11 | 二手 | 子代理查阅 |
| [seeddance.io 长视频模型对比](https://www.seeddance.io/blog/best-ai-video-generators-long-videos-2026) | 2026-10-15 | 二手 | 子代理查阅 |
| [hedra 视频 API 价格对比](https://www.hedra.com/blog/video-model-api-cost-comparison) | 2026 | 二手 | 子代理查阅 |
| [awesome-claude-video-skills](https://github.com/zhuyansen/awesome-claude-video-skills) | 2026 | 二手 | 子代理查阅 |
