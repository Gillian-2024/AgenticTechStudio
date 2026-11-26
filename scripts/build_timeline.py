"""Voice-first timeline: synthesize each storyboard line, then derive shot timings.

Usage:
    python build_timeline.py <script.md> <out_dir> [--voice zh-CN-XiaoyiNeural] [--rate +5%]

Outputs in <out_dir>:
    vo/<n>.mp3       one clip per shot
    voiceover.m4a    all clips placed on the timeline
    timeline.json    [{shot, start, end, vo_start, vo_end, line, words}], seconds
                     words: [{t, d, text}] per spoken character, absolute time,
                     so animation can land actions on the exact spoken word.

A shot lasts max(voice + padding, min_seconds) so animation follows the voice,
not the other way round. Requires: edge-tts (pip), ffmpeg/ffprobe.
"""

import argparse
import asyncio
import json
import re
import subprocess
from pathlib import Path

import edge_tts

LEAD_IN = 0.3   # silence before the line starts in its shot
TAIL = 0.5      # breathing room after the line ends
ROW = re.compile(r"^\|\s*(\d+)\s*\|\s*([\d.]+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$")


def duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


async def synthesize(text, voice, rate, clip):
    """Write the clip and return word boundaries relative to clip start."""
    words = []
    comm = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    with open(clip, "wb") as f:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                words.append({"t": chunk["offset"] / 1e7, "d": chunk["duration"] / 1e7,
                              "text": chunk["text"]})
    return words


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script_md")
    ap.add_argument("out_dir")
    ap.add_argument("--voice", default="zh-CN-XiaoyiNeural")
    ap.add_argument("--rate", default="+5%")
    args = ap.parse_args()

    out = Path(args.out_dir)
    (out / "vo").mkdir(parents=True, exist_ok=True)

    shots = []
    for line in Path(args.script_md).read_text(encoding="utf-8").splitlines():
        m = ROW.match(line)
        if m:
            shots.append({"shot": int(m[1]), "min": float(m[2]), "line": m[3], "visual": m[4]})

    t = 0.0
    timeline = []
    for s in shots:
        clip = out / "vo" / f"{s['shot']:02d}.mp3"
        words = asyncio.run(synthesize(s["line"], args.voice, args.rate, clip))
        vo = duration(clip)
        length = max(LEAD_IN + vo + TAIL, s["min"])
        vo_start = t + LEAD_IN
        timeline.append({
            "shot": s["shot"],
            "start": round(t, 3),
            "end": round(t + length, 3),
            "vo_start": round(vo_start, 3),
            "vo_end": round(vo_start + vo, 3),
            "line": s["line"],
            "visual": s["visual"],
            "words": [{"t": round(vo_start + w["t"], 3), "d": round(w["d"], 3), "text": w["text"]}
                      for w in words],
        })
        t += length

    inputs, filters, labels = [], [], []
    for i, seg in enumerate(timeline):
        inputs += ["-i", str(out / "vo" / f"{seg['shot']:02d}.mp3")]
        ms = int(seg["vo_start"] * 1000)
        filters.append(f"[{i}:a]adelay={ms}|{ms}[a{i}]")
        labels.append(f"[a{i}]")
    total = timeline[-1]["end"]
    graph = ";".join(filters) + ";" + "".join(labels) + \
        f"amix=inputs={len(timeline)}:normalize=0,apad,atrim=0:{total}[out]"
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", graph,
         "-map", "[out]", "-c:a", "aac", "-b:a", "160k", str(out / "voiceover.m4a")],
        check=True,
    )

    (out / "timeline.json").write_text(
        json.dumps({"total": round(total, 3), "voice": args.voice, "shots": timeline},
                   ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    for seg in timeline:
        print(f"{seg['shot']:>2}  {seg['start']:6.2f}-{seg['end']:6.2f}  vo {seg['vo_end'] - seg['vo_start']:.2f}s")
    print(f"total {total:.2f}s")


if __name__ == "__main__":
    main()
