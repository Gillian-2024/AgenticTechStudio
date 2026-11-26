#!/usr/bin/env bash
# Build a 60s voiceover track from the storyboard: one macOS `say` clip per shot,
# each placed at its shot start time.
#
# Usage: scripts/make_voiceover.sh <script.md> <out.m4a> [voice=Tingting]
# Requires: macOS `say`, ffmpeg.
set -euo pipefail

script_md="$1"
out="$2"
voice="${3:-Tingting}"
work="$(mktemp -d /tmp/vo.XXXXXX)"

# Storyboard rows look like: | 1 | 0–6 | narration | visuals |
grep -E '^\| [0-9]+ \|' "$script_md" | while IFS='|' read -r _ num secs line _; do
  num="$(echo "$num" | tr -d ' ')"
  start="$(echo "$secs" | tr -d ' ' | sed 's/[–-].*//')"
  line="$(echo "$line" | sed 's/^ *//; s/ *$//')"
  say -v "$voice" -r 215 -o "$work/$num.aiff" "$line"
  echo "$num $start" >> "$work/index.txt"
done

inputs=()
filters=""
labels=""
n=0
while read -r num start; do
  inputs+=(-i "$work/$num.aiff")
  filters+="[$n:a]adelay=$((start * 1000))|$((start * 1000))[a$n];"
  labels+="[a$n]"
  n=$((n + 1))
done < "$work/index.txt"

ffmpeg -y -loglevel error "${inputs[@]}" \
  -filter_complex "${filters}${labels}amix=inputs=$n:normalize=0,apad,atrim=0:60[out]" \
  -map "[out]" -c:a aac -b:a 160k "$out"

# Warn when a clip runs past the next shot's start.
prev_end=0
while read -r num start; do
  dur="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$work/$num.aiff")"
  if (( start < prev_end )); then echo "warn: shot $num starts at ${start}s, previous clip ends at ${prev_end}s"; fi
  prev_end="$(python3 -c "import math;print(math.ceil($start+$dur))")"
done < "$work/index.txt"

rm -r "$work"
echo "wrote $out"
