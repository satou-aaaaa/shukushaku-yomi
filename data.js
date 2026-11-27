// 縮尺よみの問題を作る（ブラウザと node の両方で使う）。
// 決まりは、国土地理院の資料（下の SRC）で確かめたことだけ（2026-11-17 に読んだ）。
//  - 縮尺 1/N の地図では、地図の長さ × N ＝ 実際の長さ（2万5千分の1の地図の4cmは1km）
//  - 2万5千分の1地形図の等高線：主曲線10mごと・計曲線50mごと・補助曲線は主曲線の間を5m又は2.5mごと（地形図図式 第51条）
//  - 等高線の問題は、図式で確かめた2万5千分の1だけ（5万分の1の間隔は資料で確かめられなかったので出さない）
// 地図の長さ・高さの数字は練習用の作り話。答えはコードで計算して決める。場所の名前は出さない。
// 1問は、地図の場面を見て答えを選ぶ。正解したら2段目「どう計算した？」を選ぶ。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。同じ tag なら、どの端末でも同じ問題になる。
// KINDS・言い回しの並びは最後に足すだけにする（並べ替え・削除をすると過去の日の問題が変わる）。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];

  // 出典（画面の「なぜ」に出す）
  const SRC = {
    kyori: ["国土地理院「距離と縮尺」", "https://www.gsi.go.jp/KIDS/KIDS04.html"],
    toko: ["国土地理院「等高線」", "https://www.gsi.go.jp/KIDS/KIDS07.html"],
    zushiki: ["国土地理院「2万5千分1地形図図式（表示基準）」", "https://www.gsi.go.jp/common/000218186.pdf"],
  };

  // 縮尺（分母）と等高線の間隔（m）
  const SCALE = { 25000: { n: "2万5千分の1", main: 10, thick: 50, aux: 5 }, 50000: { n: "5万分の1" } };
  const DENOMS = [25000, 50000];
  const C = 25000; // 等高線の問題に使う縮尺

  // 2段目「どう計算した？」
  const GROUPS = {
    kakeru: { name: "地図の長さ × 分母", sub: "地図の長さから、実際の長さを出す" },
    waru: { name: "実際の長さ ÷ 分母", sub: "実際の長さから、地図の長さを出す" },
    bunbo: { name: "実際 ÷ 地図", sub: "2つの長さから、縮尺の分母を出す" },
    sen: { name: "等高線の間隔", sub: "等高線の高さの決まり（10m・50m・5m）を使う" },
  };

  // part:ri:begin（shared-workflows の template/parts/data/ri.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  const ri = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  // part:ri:end
  const pick = (R, a) => a[ri(R, 0, a.length - 1)];
  // part:shuffle:begin（shared-workflows の template/parts/data/shuffle.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function shuffle(R, a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = ri(R, 0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  // part:shuffle:end
  // part:pickN:begin（shared-workflows の template/parts/data/pickN.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function pickN(R, a, n) { return shuffle(R, a).slice(0, n); }
  // part:pickN:end
  const fmt = (n) => { const [i, d] = String(Math.round(n * 1000) / 1000).split("."); return i.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (d ? "." + d : ""); };
  // 長さ（m）を言う：1000m 以上は km も
  const mOf = (m) => (m >= 1000 && Number.isInteger(m / 10) ? `${fmt(m / 1000)}km` : `${fmt(m)}m`); // 1km 以上で小数2けたまでなら km
  function optsOf(R, ans, cands, n) { const out = [ans]; for (const c of cands) { if (out.length >= n) break; if (c && !out.includes(c) && !/\.\d{3}/.test(c)) out.push(c); } return shuffle(R, out); } // 小数3けたの選び肢は出さない
  const MEDIA = ["ハイキングの計画", "社会の授業", "まち歩き", "山のぼりの下調べ", "自由研究"];
  const name = (d) => SCALE[d].n;
  const range = (a, b, st) => { const o = []; for (let x = a; x <= b + 1e-9; x += st) o.push(Math.round(x * 10) / 10); return o; };
  const CMS = range(0.5, 16, 0.5);

  // 地図の切れはし（縮尺と長さの線、または等高線）の絵
  function rulerSvg(d, cm) {
    const w = Math.min(200, 20 + cm * 16);
    return `<svg viewBox="0 0 240 90" width="240" height="90" role="img" aria-label="${name(d)}の地図に、長さ${fmt(cm)}cmの線"><rect x="4" y="4" width="232" height="82" rx="4" fill="#f4f1e2" stroke="#5a4a2f"/><path d="M20 70 Q60 30 110 52 T220 30" fill="none" stroke="#8fb39b" stroke-width="6" opacity=".6"/><line x1="20" y1="24" x2="${20 + w}" y2="24" stroke="#b8322a" stroke-width="3"/><circle cx="20" cy="24" r="4" fill="#b8322a"/><circle cx="${20 + w}" cy="24" r="4" fill="#b8322a"/><text x="120" y="80" text-anchor="middle" font-size="12" fill="#333">${name(d)}・線の長さ ${fmt(cm)}cm</text></svg>`;
  }
  function contourSvg(n, thickTo) { // n 区間を描く。thickTo 以下で5の倍数の線（はじめの線から50mごと）を太くする（-1 なら全部細い）
    let p = ""; for (let i = 0; i <= n; i++) { const r = 70 - i * (60 / Math.max(1, n)); p += `<ellipse cx="120" cy="58" rx="${r * 1.5}" ry="${r * 0.55}" fill="none" stroke="#7a5230" stroke-width="${thickTo >= 0 && i <= thickTo && i % 5 === 0 ? 3 : 1.2}"/>`; }
    return `<svg viewBox="0 0 240 110" width="240" height="110" role="img" aria-label="山を上から見た等高線">${p}<text x="120" y="62" text-anchor="middle" font-size="12" fill="#333">▲</text></svg>`;
  }

  const MK = {
    // 2万5千分の1：地図の長さ → 実際
    kyori25(R) {
      const cm = pick(R, CMS), d = 25000, m = cm * d / 100, md = ri(R, 0, MEDIA.length - 1);
      return { media: MEDIA[md], q: `${name(d)}の地図で、2つの地点の間は${fmt(cm)}cm。実際の距離は？`, svg: rulerSvg(d, cm), opts: optsOf(R, mOf(m), [mOf(m * 2), mOf(m / 2), mOf(m * 10), mOf(m / 10)], 3), ans: mOf(m), grp: "kakeru", v: `${cm}:${md}`,
        why: `${fmt(cm)}cm × 25,000 ＝ ${fmt(cm * d)}cm ＝ ${mOf(m)}。2万5千分の1では、4cmで1kmです。` };
    },
    // 5万分の1：地図の長さ → 実際
    kyori5(R) {
      const cm = pick(R, CMS), d = 50000, m = cm * d / 100, md = ri(R, 0, MEDIA.length - 1);
      return { media: MEDIA[md], q: `${name(d)}の地図で、2つの地点の間は${fmt(cm)}cm。実際の距離は？`, svg: rulerSvg(d, cm), opts: optsOf(R, mOf(m), [mOf(m / 2), mOf(m * 2), mOf(m * 10), mOf(m / 10)], 3), ans: mOf(m), grp: "kakeru", v: `${cm}:${md}`,
        why: `${fmt(cm)}cm × 50,000 ＝ ${fmt(cm * d)}cm ＝ ${mOf(m)}。5万分の1では、2cmで1kmです。` };
    },
    // 等高線の間隔（決まり）
    kankaku(R) {
      const d = C, sc = SCALE[d], t = ri(R, 0, 5), md = ri(R, 0, MEDIA.length - 1), nm = name(d);
      const Q = [
        [`${nm}の地形図。等高線の細い線（主曲線）は、高さ何mごとに引かれている？`, "10m", ["50m", "5m", "100m"], `細い主曲線は${sc.main}mごとです。`],
        [`${nm}の地形図。等高線の太い線（計曲線）は、高さ何mごとに引かれている？`, "50m", ["10m", "100m", "25m"], `太い計曲線は${sc.thick}mごとです。`],
        [`${nm}の地形図。細い等高線（主曲線）を5本あがると、何m高くなる？`, "50m", ["5m", "25m", "100m"], `主曲線は${sc.main}mごとなので、${sc.main} × 5 ＝ 50mです。`],
        [`${nm}の地形図。太い計曲線と次の太い計曲線の間に、細い主曲線は何本ある？`, "4本", ["5本", "9本", "10本"], `50mの間を10mごとに区切るので、間の細い線は4本です。`],
        [`地形図の等高線の高さは、どこから数えた高さ？`, "平均海面", ["山のふもと", "地図の下の端", "いちばん低い等高線"], "等高線は、平均海面から数えた高さで引きます。"],
        [`${nm}の地形図。太い計曲線を2本あがると、何m高くなる？`, "100m", ["20m", "50m", "200m"], `計曲線は${sc.thick}mごとなので、${sc.thick} × 2 ＝ 100mです。`],
      ][t];
      return { media: MEDIA[md], q: Q[0], opts: optsOf(R, Q[1], Q[2], 3), ans: Q[1], grp: "sen", v: `${t}:${md}`,
        why: `${Q[3]}（${nm}の地形図は、主曲線${sc.main}mごと・計曲線${sc.thick}mごと）` };
    },
    // 実際の距離 → 地図の長さ
    chizu(R) {
      const d = pick(R, DENOMS), m = pick(R, range(250, 10000, 250)), cm = m * 100 / d, md = ri(R, 0, MEDIA.length - 1);
      return { media: MEDIA[md], q: `実際の距離が${mOf(m)}の道。${name(d)}の地図では何cm？`, opts: optsOf(R, fmt(cm) + "cm", [fmt(cm * 2) + "cm", fmt(cm / 2) + "cm", fmt(cm * 10) + "cm", fmt(cm / 10) + "cm"], 4), ans: fmt(cm) + "cm", grp: "waru", v: `${d}:${m}:${md}`,
        why: `${mOf(m)} ＝ ${fmt(m * 100)}cm。${fmt(m * 100)} ÷ ${fmt(d)} ＝ ${fmt(cm)}cmです。` };
    },
    // 等高線を数えて高さ
    takasa(R) {
      const d = C, s = SCALE[d], base = pick(R, range(0, 900, 50)), n = ri(R, 2, 4), h = base + n * s.main, md = ri(R, 0, MEDIA.length - 1);
      return { media: MEDIA[md], q: `${name(d)}の地形図。高さ${base}mの等高線から、山頂に向かって細い等高線を${n}本こえた所に立った（そこは線の上）。高さは？`, svg: contourSvg(n, -1), opts: optsOf(R, h + "m", [base + n * 20 + "m", base + n + "m", base + n * s.thick + "m", base + (n + 1) * s.main + "m"], 4), ans: h + "m", grp: "sen", v: `${base}:${n}:${md}`,
        why: `${name(d)}の細い等高線は${s.main}mごと。${base} ＋ ${s.main} × ${n} ＝ ${h}mです。` };
    },
    // 2つの地図をくらべる
    kurabe(R) {
      const cm = pick(R, range(0.5, 10, 0.5)), w = ri(R, 0, 1), md = ri(R, 0, MEDIA.length - 1);
      // w=1：5万分の1の cm と同じ距離は、2万5千分の1で何cm（2倍）。w=0：逆（半分）
      const [from, to] = w ? [50000, 25000] : [25000, 50000], a = cm * from / to;
      return { media: MEDIA[md], q: `${name(from)}の地図で${fmt(cm)}cmの道。同じ道を${name(to)}の地図で測ると何cm？`, opts: optsOf(R, fmt(a) + "cm", [fmt(cm) + "cm", fmt(w ? cm / 2 : cm * 2) + "cm", fmt(cm * 4) + "cm", fmt(cm / 4) + "cm"], 4), ans: fmt(a) + "cm", grp: "kakeru", v: `${cm}:${w}:${md}`,
        why: `実際は ${fmt(cm)} × ${fmt(from)} ＝ ${fmt(cm * from)}cm。${name(to)}では ÷${fmt(to)} で ${fmt(a)}cm。${w ? "2万5千分の1のほうが2倍くわしい" : "5万分の1では半分の長さ"}です。` };
    },
    // 2つの長さから縮尺
    bunbo(R) {
      const d = pick(R, [10000, 25000, 50000, 200000]), cm = pick(R, range(1, 12, 1)), m = cm * d / 100, md = ri(R, 0, MEDIA.length - 1);
      const nm = (x) => ({ 10000: "1万分の1", 25000: "2万5千分の1", 50000: "5万分の1", 200000: "20万分の1" }[x]);
      return { media: MEDIA[md], q: `ある地図で${fmt(cm)}cmの線が、実際には${mOf(m)}だった。この地図の縮尺は？`, opts: optsOf(R, nm(d), shuffle(R, [10000, 25000, 50000, 200000].filter((x) => x !== d)).map(nm), 4), ans: nm(d), grp: "bunbo", v: `${d}:${cm}:${md}`,
        why: `${mOf(m)} ＝ ${fmt(m * 100)}cm。${fmt(m * 100)} ÷ ${fmt(cm)} ＝ ${fmt(d)} なので、${nm(d)}です。` };
    },
    // 2点の高さの差（計曲線と主曲線）
    sa(R) {
      const d = C, s = SCALE[d], k = ri(R, 1, 4), n = ri(R, 0, 4), diff = k * s.thick + n * s.main, md = ri(R, 0, MEDIA.length - 1);
      return { media: MEDIA[md], q: `${name(d)}の地形図。ふもとの点は太い計曲線の上。山頂側へ、太い計曲線を${k}本、そのあと細い主曲線を${n}本こえた線の上の点との高さの差は？`, svg: contourSvg(k * 5 + n, k * 5), opts: optsOf(R, diff + "m", [(k + n) * s.main + "m", (k + n) * s.thick + "m", k * 100 + n * 20 + "m", diff + s.main + "m", diff * 2 + "m"], 4), ans: diff + "m", grp: "sen", v: `${k}:${n}:${md}`,
        why: `${name(d)}は計曲線が${s.thick}mごと・主曲線が${s.main}mごと。${s.thick} × ${k} ＋ ${s.main} × ${n} ＝ ${diff}mです。` };
    },
    // 面積（地図上の正方形）
    menseki(R) {
      const d = pick(R, DENOMS), cm = pick(R, [0.5, 1, 1.5, 2, 3, 4]), side = cm * d / 100, a = side * side, md = ri(R, 0, MEDIA.length - 1);
      const sq = (x) => (x >= 1e6 ? `${fmt(x / 1e6)}km²` : `${fmt(x)}m²`);
      return { media: MEDIA[md], q: `${name(d)}の地図で、1辺${cm}cmの正方形の土地。実際の面積は？`, opts: optsOf(R, sq(a), [sq(side), sq(a * 2), sq(a / 2), sq(a * 4), sq(a / 4)], 4), ans: sq(a), grp: "kakeru", v: `${d}:${cm}:${md}`,
        why: `1辺は ${cm} × ${fmt(d)} ＝ ${fmt(cm * d)}cm ＝ ${mOf(side)}。面積は ${mOf(side)} × ${mOf(side)} ＝ ${sq(a)}です。` };
    },
    // 補助曲線（主曲線の間の5mの線）
    hojo(R) {
      const s = SCALE[C], lo = pick(R, range(10, 490, 10)), up = ri(R, 0, 1), h = lo + s.aux, md = ri(R, 0, MEDIA.length - 1);
      const q = up ? `${name(C)}の地形図。なだらかな丘で、${lo}mの主曲線と${lo + s.main}mの主曲線の間に、破線の補助曲線（5mごと）が1本ある。補助曲線の高さは？` : `${name(C)}の地形図。${lo + s.main}mの主曲線のすぐ下に、破線の補助曲線（5mごと）が1本ある。下の主曲線は${lo}m。補助曲線の高さは？`;
      return { media: MEDIA[md], q, opts: optsOf(R, h + "m", [lo + 2.5 + "m", lo + s.main + "m", lo + 1 + "m", lo - s.aux + "m"], 4), ans: h + "m", grp: "sen", v: `${lo}:${up}:${md}`,
        why: `補助曲線は、主曲線（10mごと）の間を5m又は2.5mごとに表します。ここは5mの線なので、${lo} ＋ 5 ＝ ${h}mです。` };
    },
  };

  const KINDS = [
    { id: "kyori25", lv: 0, name: "2万5千分の1の距離", src: ["kyori"], look: "地図の長さに、縮尺の分母（25,000）をかけます。", key: "2万5千分の1：4cm ＝ 1km（1cm ＝ 250m）" },
    { id: "kyori5", lv: 0, name: "5万分の1の距離", src: ["kyori"], look: "地図の長さに、縮尺の分母（50,000）をかけます。", key: "5万分の1：2cm ＝ 1km（1cm ＝ 500m）" },
    { id: "kankaku", lv: 0, name: "等高線の間隔", src: ["toko", "zushiki"], look: "細い線は主曲線、太い線は計曲線です。", key: "2万5千分の1：主曲線10mごと・計曲線50mごと" },
    { id: "chizu", lv: 1, name: "地図では何cm", src: ["kyori"], look: "実際の長さを cm にして、分母でわります。", key: "1km ＝ 100,000cm。÷25,000 ＝ 4cm" },
    { id: "takasa", lv: 1, name: "等高線で高さ", src: ["toko", "zushiki"], look: "細い等高線1本で、10m 高くなります。", key: "はじめの高さ ＋ 10m × 本数" },
    { id: "kurabe", lv: 1, name: "2つの地図をくらべる", src: ["kyori"], look: "まず実際の長さを出してから、もう一つの縮尺でわります。", key: "2万5千分の1の長さ ＝ 5万分の1の長さ × 2" },
    { id: "bunbo", lv: 2, name: "縮尺を当てる", src: ["kyori"], look: "実際の長さと地図の長さを、同じ cm にそろえます。", key: "実際（cm）÷ 地図（cm）＝ 縮尺の分母" },
    { id: "sa", lv: 2, name: "高さの差", src: ["toko", "zushiki"], look: "太い計曲線は50mごと、細い主曲線は10mごとです。", key: "50m × 計曲線の数 ＋ 10m × 主曲線の数" },
    { id: "menseki", lv: 2, name: "地図で面積", src: ["kyori"], look: "1辺の実際の長さを出してから、かけ合わせます。", key: "2万5千分の1の1cm ＝ 250m。250m × 250m ＝ 62,500m²" },
    { id: "hojo", lv: 2, name: "補助曲線", src: ["zushiki"], look: "補助曲線は、主曲線の間に引く破線です。", key: "補助曲線：主曲線の間を5m又は2.5mごと" },
  ];
  for (const k of KINDS) k.make = MK[k.id];
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);

  // part:seedOf:begin（shared-workflows の template/parts/data/seedOf.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  // part:seedOf:end
  // part:rng:begin（shared-workflows の template/parts/data/rng.js の写し。ここでは直さない。node scripts/sync-template.mjs で写す）
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // part:rng:end

  // 1問を作る。tag は「種類|種」。同じ tag ならいつも同じ問題
  function make(tag) {
    const [kind] = String(tag).split("|"), k = Object.prototype.hasOwnProperty.call(BY, kind) ? BY[kind] : null;
    if (!k) return null;
    const p = k.make(rng(seedOf(tag)), k.lv);
    return { tag, kind, lv: k.lv, name: k.name, look: k.look, key: k.key, type: "act", rev: false, src: k.src.map((s) => SRC[s]), ...p };
  }
  const keyOf = (P) => `${P.kind}:${P.q}:${P.opts.slice().sort().join("/")}`;

  // 今日の5問（やさしい2・ふつう2・むずかしい1）。種類は重ねない
  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOf(0), 2), n = pickN(R, kindsOf(1), 2), h = pickN(R, kindsOf(2), 1);
    return [...e, ...n, ...h].map((id, i) => `${id}|${date}:d${i}`);
  }
  // 上級の3問（むずかしいだけ・今日の5問のむずかしいとは別の種類）
  function hardTags(date) {
    const dh = dailyTags(date)[4].split("|")[0], R = rng(seedOf("hard:" + date)), h = pickN(R, kindsOf(2).filter((x) => x !== dh), 3);
    return h.map((id, i) => `${id}|${date}:h${i}`);
  }

  const SSK = { KINDS, BY, GROUPS, LV, SRC, SCALE, kindsOf, seedOf, rng, make, keyOf, dailyTags, hardTags, pickN };
  if (typeof module !== "undefined" && module.exports) module.exports = SSK; else root.SSK = SSK;
})(typeof self !== "undefined" ? self : this);
