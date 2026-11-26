// Voice beats: find when a word is spoken in timeline.json, so actions land on it.
//
// Usage in an animation page (after embedding TIMELINE = <timeline.json>):
//   const beats = VoiceBeats(TIMELINE);
//   beats.at(9, "6")          -> time the first "6" is spoken in shot 9
//   beats.at(9, "5", 0)       -> nth occurrence (0-based)
//   beats.all(9, ["6","5","4"]) -> [t6, t5, t4], each searched after the previous
//   beats.progress(t, a, b)   -> 0..1 between two beat times, clamped
//
// Matching is on the concatenated spoken characters, so multi-character phrases
// ("跳过", "停在") work even though edge-tts reports Chinese one character at a time.
(function (global) {
  function VoiceBeats(timeline) {
    const shots = {};
    for (const s of timeline.shots) shots[s.shot] = s;

    function find(shotNo, phrase, fromT) {
      const s = shots[shotNo];
      if (!s || !s.words || !s.words.length) throw new Error("no words for shot " + shotNo);
      const ws = s.words.filter((w) => w.t >= (fromT ?? -Infinity));
      const text = ws.map((w) => w.text).join("");
      // Map character index in the joined string back to the word that holds it.
      const owner = [];
      ws.forEach((w, i) => { for (let k = 0; k < w.text.length; k++) owner.push(i); });
      const idx = text.indexOf(phrase);
      if (idx < 0) throw new Error(`"${phrase}" not spoken in shot ${shotNo}`);
      return ws[owner[idx]].t;
    }

    return {
      at(shotNo, phrase, nth = 0) {
        let t = -Infinity;
        for (let i = 0; i <= nth; i++) t = find(shotNo, phrase, i === 0 ? undefined : t + 1e-3);
        return t;
      },
      all(shotNo, phrases) {
        let t;
        return phrases.map((p) => (t = find(shotNo, p, t === undefined ? undefined : t + 1e-3)));
      },
      progress(t, a, b) {
        return b <= a ? (t >= b ? 1 : 0) : Math.min(1, Math.max(0, (t - a) / (b - a)));
      },
    };
  }
  global.VoiceBeats = VoiceBeats;
})(typeof window !== "undefined" ? window : globalThis);
