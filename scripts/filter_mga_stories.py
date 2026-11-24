"""Filter MGA (ByteDance-Seed/mga-fineweb-edu) rows for AI/CS story-style samples.

Usage:
    python filter_mga_stories.py <shard.parquet> [<shard.parquet> ...] --out picks.jsonl

A row is kept when all three hold:
  1. genre looks like a story / narrative (Chinese free-text field)
  2. audience looks like beginners (kids, teens, general public)
  3. genre names an AI/CS topic, and the rewritten text has >= 2 tech words

Requires: pyarrow
"""

import argparse
import json
import re
from collections import Counter

import pyarrow.parquet as pq

STORY_GENRE = re.compile(r"故事|童话|冒险|小说|寓言|剧本|对话")
BEGINNER_AUDIENCE = re.compile(r"儿童|小学|中学|中小学|青少年|孩子|学生|初学|零基础|大众|普通|爱好者")

# Topic keywords, matched on the Chinese genre field, which states what the
# rewrite is about. English body keywords proved too noisy in a first pass
# ("bits", "virus", "memory" hit non-CS texts), so they only confirm topics.
TOPICS = {
    "ai": r"人工智能|机器学习|神经网络|深度学习|大模型|语言模型|聊天机器人|AI",
    "algorithm": r"算法|排序|递归",
    "hardware": r"计算机硬件|芯片|处理器|CPU|内存|晶体管|主板|硬盘|计算机.{0,6}(组成|结构|内部)",
    "network": r"互联网|计算机网络|网络协议|路由|IP 地址|IP地址|域名|Wi-?Fi|5G",
    "security": r"网络安全|信息安全|加密|密码学|黑客|恶意软件|计算机病毒|隐私",
    "programming": r"编程|程序设计|代码|软件开发|Python|Java|Scratch",
    "data": r"大数据|数据库|数据科学|二进制|数据分析",
    "robotics": r"机器人|自动驾驶|无人机",
}
TOPIC_RE = {k: re.compile(v, re.IGNORECASE) for k, v in TOPICS.items()}
TECH_BODY = re.compile(
    r"computer|algorithm|artificial intelligence|machine learning|internet|software|"
    r"program|code|data|robot|encrypt|chip|processor|network|digital",
    re.IGNORECASE,
)


def topics_of(genre, text):
    """Topics named in the genre, confirmed by at least 2 tech words in the body."""
    if len(TECH_BODY.findall(text)) < 2:
        return []
    return [k for k, rx in TOPIC_RE.items() if rx.search(genre)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("shards", nargs="+")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    stats = Counter()
    topic_count = Counter()
    with open(args.out, "w", encoding="utf-8") as out:
        for path in args.shards:
            pf = pq.ParquetFile(path)
            for batch in pf.iter_batches(batch_size=4096, columns=["content_split", "meta"]):
                for row in batch.to_pylist():
                    stats["rows"] += 1
                    meta = row["meta"] or {}
                    genre = meta.get("genre") or ""
                    audience = meta.get("audience") or ""
                    if not STORY_GENRE.search(genre):
                        continue
                    stats["story"] += 1
                    if not BEGINNER_AUDIENCE.search(audience):
                        continue
                    stats["story_beginner"] += 1
                    text = row["content_split"] or ""
                    raw = meta.get("raw_text") or ""
                    topics = topics_of(genre, text)
                    if not topics:
                        continue
                    stats["picked"] += 1
                    topic_count.update(topics)
                    try:
                        url = json.loads(meta.get("meta_extra") or "{}").get("url")
                    except json.JSONDecodeError:
                        url = None
                    out.write(json.dumps({
                        "docid": meta.get("docid"),
                        "chunk_id": meta.get("chunk_id"),
                        "topics": topics,
                        "genre": genre,
                        "audience": audience,
                        "url": url,
                        "text": text,
                        "raw_text": raw,
                    }, ensure_ascii=False) + "\n")

    print(json.dumps({"stats": stats, "topics": topic_count}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
