# 样片 01：插入排序——小老鼠排队

当前定稿：**v3**（71 秒，12 个镜头）。

## 三版迭代

| 版本 | 剧本 | 动画 | 主要变化 | 暴露的问题 |
|---|---|---|---|---|
| v1 | [script.md](script.md) | [claude/](claude/index.html)、[gpt6/](gpt6/index.html) | 同一剧本交给 Claude 和 GPT-6 各写一版做对比 | 两版都自称完成但都有问题：Claude 版箭头压字；GPT-6 版 `seek` 失效。动作只有平移，系统语音机械，先定画面再塞配音 |
| v2 | [script-v2.md](script-v2.md) | [v2/](v2/index.html) | 配音先行（Xiaoyi 神经语音）、动画质量规范、跳跃与角色表演、镜头推近 | 一句话平均切分导致动作和念到的数字对不上；跳跃撞标题；「已排好」区域语义错误 |
| v3 | [script-v3.md](script-v3.md) | [v3/](v3/index.html) | 按三个 skill 重做：动作踩在念到的词上；扑克牌飞上去变成数字牌；颜色含义固定；交换前先描边；新增「本来就排好」反例 | 动画 Agent 自检漏掉描边重叠、颜色前后矛盾；一次把转场误判为缺陷 |

每版的问题都写回了 [动画质量规范](../../research/motion-quality-spec.md) 的验收清单。

## 自己渲染一遍

```bash
npm init -y && npm i puppeteer-core   # 另需 Google Chrome 与 ffmpeg
node scripts/render_frames.js samples/01-insertion-sort/v3/index.html frames 71.352 30
ffmpeg -framerate 30 -i frames/f%05d.png -i samples/01-insertion-sort/v3/voiceover.m4a \
  -c:v libx264 -pix_fmt yuv420p -crf 18 -c:a copy -shortest insertion-sort-v3.mp4
```

验收：

```bash
node scripts/qa_check.js samples/01-insertion-sort/v3/index.html \
  samples/01-insertion-sort/v3/timeline.json qa-out
```

改了旁白要先重跑配音时间线（需 `pip install edge-tts`）：

```bash
python scripts/build_timeline.py samples/01-insertion-sort/script-v3.md samples/01-insertion-sort/v3
```

## 素材

故事设定改编自 MGA-FineWeb-Edu 中的一条插入排序故事体改写，原文 [dinocajic.com](https://www.dinocajic.com/tag/insertion-sort/)。署名与许可见仓库根目录 README。
