import fs from "fs";

const snapPath = "d:/GANO小联盟/data/alliance-daily-snapshot.json";
const htmlPaths = [
  "d:/GANO小联盟/alliance-daily-report.html",
  "d:/GANO小联盟/alliance-activity-mobile.html",
];

const snap = JSON.parse(fs.readFileSync(snapPath, "utf8"));

if (/^演示数据|结构对齐后台/.test(snap.source || "")) {
  throw new Error("snapshot source looks like demo data: " + snap.source);
}

const snapTag =
  '<script type="application/json" id="live-snapshot">\n' +
  JSON.stringify(snap) +
  "\n</script>\n";

const synced = [];
for (const htmlPath of htmlPaths) {
  if (!fs.existsSync(htmlPath)) {
    console.warn("skip missing:", htmlPath);
    continue;
  }
  let html = fs.readFileSync(htmlPath, "utf8");
  if (!html.includes('id="live-snapshot"')) {
    throw new Error("HTML missing #live-snapshot: " + htmlPath);
  }
  html = html.replace(
    /<script type="application\/json" id="live-snapshot">[\s\S]*?<\/script>\n?/,
    snapTag
  );
  html = html.replace(
    /if \(\/演示\/\.test\(s\.source \|\| ""\)\) throw new Error\("拒绝演示数据快照"\);/,
    'if (/^演示数据|结构对齐后台/.test(s.source || "")) throw new Error("拒绝演示数据快照");'
  );
  html = html.replace(
    /if \(\/演示\/\.test\(String\(source \|\| ""\)\)\) \{\s*throw new Error\("拒绝写入演示数据"\);\s*\}/,
    'if (/^演示数据|结构对齐后台/.test(String(source || ""))) {\n      throw new Error("拒绝写入演示数据");\n    }'
  );
  fs.writeFileSync(htmlPath, html, "utf8");
  synced.push(htmlPath);
}

const voided = snap.coupons.filter(
  (c) => c.voidTime || String(c.couponStatus) === "5"
).length;
console.log({
  ok: true,
  capturedAt: snap.capturedAt,
  coupons: snap.coupons.length,
  voided,
  valid: snap.coupons.length - voided,
  source: snap.source,
  synced,
});
