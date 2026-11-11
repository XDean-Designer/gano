import fs from "fs";

const htmlPath = "d:/GANO小联盟/alliance-daily-report.html";
const snapPath = "d:/GANO小联盟/data/alliance-daily-snapshot.json";
let html = fs.readFileSync(htmlPath, "utf8");
const snap = JSON.parse(fs.readFileSync(snapPath, "utf8"));

const snapTag =
  '<script type="application/json" id="live-snapshot">\n' +
  JSON.stringify(snap) +
  "\n</script>\n";

if (html.includes('id="live-snapshot"')) {
  html = html.replace(
    /<script type="application\/json" id="live-snapshot">[\s\S]*?<\/script>\n?/,
    snapTag
  );
} else {
  html = html.replace("<script>\n(function () {", snapTag + "<script>\n(function () {");
}

const start = html.indexOf("  function demoPayload() {");
const end = html.indexOf('  dayInput.addEventListener("change", render);');
if (start < 0 || end < 0) {
  console.error("markers missing", { start, end });
  process.exit(1);
}

const replacement = `  /* DATA UPDATE PROTOCOL（以后更新必须遵守）
   * 1. 只能写入后台真数：staff/page + coupon/issued + coupon/quotas
   * 2. 覆盖 data/alliance-daily-snapshot.json，再运行 node _patch-snapshot-boot.mjs 同步 #live-snapshot
   * 3. 禁止虚构券行 / 禁止用「演示数据」冒充日结
   * 4. 更新后自检：作废+有效=总张数；当日有效侧别与 quotas.claimed 对齐
   * 5. source 必须含「后台已核对快照」字样
   */
  function loadEmbeddedSnapshot() {
    const el = document.getElementById("live-snapshot");
    if (!el || !el.textContent.trim()) throw new Error("缺少 #live-snapshot 真数快照");
    const s = JSON.parse(el.textContent);
    if (!s || !Array.isArray(s.coupons)) throw new Error("快照无 coupons");
    if (/^演示数据|结构对齐后台/.test(s.source || "")) throw new Error("拒绝演示数据快照");
    return {
      staff: s.staff || [],
      coupons: s.coupons || [],
      quotas: s.quotas,
      source: s.source || ("后台已核对快照 · " + (s.capturedAt || "")),
      captureAt: s.capturedAt || null,
    };
  }

  function isTrustedSource(src) {
    return /后台已核对快照|后台接口实时拉取/.test(String(src || ""));
  }

  function applyData({ staff, coupons, quotas, source, captureAt }) {
    if (/^演示数据|结构对齐后台/.test(String(source || ""))) {
      throw new Error("拒绝写入演示数据");
    }
    state.staff = staff || [];
    state.coupons = coupons || [];
    state.quotas = quotas;
    state.source = source || "—";
    state.captureAt = captureAt || nowInShanghai().label;
    try {
      localStorage.setItem("allianceDailyReport.cache", JSON.stringify({
        ver: 5,
        at: state.captureAt,
        source: state.source,
        staff: state.staff,
        coupons: state.coupons,
        quotas: state.quotas,
      }));
    } catch (e) {}
    render();
  }

  function boot() {
    const now = nowInShanghai();
    dayInput.value = now.date;
    /* 始终以嵌入真数快照为准，避免 localStorage 里残留演示/旧错数覆盖 */
    try {
      localStorage.removeItem("allianceDailyReport.cache");
    } catch (e) {}
    applyData(loadEmbeddedSnapshot());
  }

`;

html = html.slice(0, start) + replacement + html.slice(end);
fs.writeFileSync(htmlPath, html, "utf8");
console.log({
  ok: true,
  htmlBytes: html.length,
  hasSnap: html.includes('id="live-snapshot"'),
  noDemoFn: !html.includes("function demoPayload"),
});
