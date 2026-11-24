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

价格已对照官方页面（2026-11-24）。时长上限仍来自第三方汇总，未验证。

| 模型 | 官方价格 | 国内入口 | 来源 |
|---|---|---|---|
| Veo 3.1（Google） | Lite 有声 $0.05–0.08，Fast 有声 $0.10–0.30，Standard 有声 $0.40；无声档约便宜一半 | 未查到 | [Vertex AI 定价](https://cloud.google.com/vertex-ai/generative-ai/pricing) |
| Kling 3.0（快手） | 有声 0.9–3.0 元/秒，无声 0.6–3.0 元/秒（阿里云百炼代售价） | 阿里云百炼 | [百炼模型价格](https://help.aliyun.com/zh/model-studio/model-pricing) |
| Seedance 2.5（字节） | 0.67（480p）– 6.03（4K）元/秒；flash 版 0.44–0.99 元/秒 | 火山引擎 | [火山方舟定价](https://www.volcengine.com/docs/82379/1544106) |
| Wan 3.0（阿里） | 0.3（480p）– 1.2（1080p）元/秒 | 阿里云百炼 | [百炼模型价格](https://help.aliyun.com/zh/model-studio/model-pricing) |
| MiniMax 海螺 H3 | 0.50（768P）– 0.80（2K）元/秒 | minimaxi.com | [MiniMax 定价](https://platform.minimaxi.com/document/Price) |
| Runway Gen-4.5 | 12 credits/秒；订阅 $12/月起（年付） | 未查到 | [Runway 定价](https://runwayml.com/pricing) |

> Veo、Kling 自带音频（按有声 / 无声分档计价已核实）；其余模型的音频能力未验证。

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

- OpenAI、Anthropic 的支持地区页抓到的片段里没有中国大陆，但列表不完整，结论未验证；Gemini API 的国家列表未取到。以各家官方「支持地区」页为准。
- 国内有人民币计价控制台、可合规使用：Kling 与 Wan（阿里云百炼）、Seedance（火山引擎）、海螺（minimaxi.com）。国内大模型也能写渲染代码。
- Manim、Remotion、ffmpeg 为开源工具，本地运行。

## 待验证

- 各视频模型的单段时长上限与音频能力（价格已核实）。
- GPT-6.2 写 Three.js 的实际效果（自己跑一条对比）。
- Claude 与 GPT-6.2 写 Manim 的效果对比。

## 来源

| 来源 | 日期 | 类型 | 状态 |
|---|---|---|---|
| [OpenAI：Introducing GPT-6.2 Astra and Sol](https://openai.com/index/introducing-gpt-6-2-astra-sol) | 2026-11-17 | 一手 | 已核实 |
| [OpenAI：Sora discontinuation](https://help.openai.com/en/articles/20001152-what-to-know-about-the-sora-discontinuation) | 2026 | 一手 | 已核实 |
| [VibeVideoBench (arXiv 2610.35864)](https://arxiv.org/html/2610.35864v2) | 2026-10-27 | 一手论文 | 已核实摘要 |
| [OpenRouter：GPT-6.2 Sol](https://openrouter.ai/openai/gpt-6.2-sol) | 2026-11 | 二手 | 子代理查阅 |
| 各家官方定价页（见上表） | 2026-11-24 | 一手 | 子代理查阅 |
| [seeddance.io 长视频模型对比](https://www.seeddance.io/blog/best-ai-video-generators-long-videos-2026) | 2026-10-15 | 二手 | 时长数据来源 |
| [awesome-claude-video-skills](https://github.com/zhuyansen/awesome-claude-video-skills) | 2026 | 二手 | 子代理查阅 |
