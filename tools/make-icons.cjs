// アプリのアイコン（icon-192.png・icon-512.png）を作る。紺の地に、等高線の山と縮尺のものさし。
// 使い方: node tools/make-icons.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const s of [192, 512]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<body style="margin:0"><svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#123554"/>
      <ellipse cx="50" cy="44" rx="34" ry="22" fill="none" stroke="#f6d77a" stroke-width="4"/>
      <ellipse cx="50" cy="40" rx="22" ry="14" fill="none" stroke="#fffdf7" stroke-width="3"/>
      <ellipse cx="50" cy="37" rx="10" ry="6" fill="#f6d77a"/>
      <path d="M18 80 H82 M18 74 V86 M50 76 V84 M82 74 V86" stroke="#fffdf7" stroke-width="4" fill="none"/></svg></body>`);
    await p.screenshot({ path: path.join(__dirname, "..", `icon-${s}.png`), clip: { x: 0, y: 0, width: s, height: s } });
  }
  await b.close();
})();
