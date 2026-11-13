/**
 * 识别疑似测试/非真实活动数据（R1+R2+R4+R5+R6）
 * 用法：node _find-suspicious-test-coupons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { loadDbConfig } from "./_alliance-live-snapshot.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const START = "2026-11-11";
const START_DT = `${START} 00:00:00`;

const TYPE = {
  1: "丽妍V3-V5",
  2: "丽妍V6-V10",
  3: "购卡满5000",
  4: "购卡满10000",
};

function pad(n) {
  return String(n).padStart(2, "0");
}

function fmt(v) {
  if (!v) return "";
  if (typeof v === "string") return v.slice(0, 19).replace("T", " ");
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function day(s) {
  return String(s || "").slice(0, 10);
}

function brand(bt) {
  return String(bt) === "1" ? "丽妍雅集" : String(bt) === "2" ? "GANO" : "其他";
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const RULE_REASON = {
  R1: "活动开始前领取",
  R2: "领取人为员工",
  R3: "自发自领",
  R4: "员工互领",
  R5: "已作废",
};

function reasonText(rulesAll) {
  if (!rulesAll || !rulesAll.length) return '<span class="muted">—</span>';
  const parts = [];
  const seen = new Set();
  for (const r of rulesAll) {
    // R2+R3 同时命中时，用「员工自发自领」更直观
    if (r === "R2" && rulesAll.includes("R3")) {
      if (!seen.has("self")) {
        parts.push("员工自发自领");
        seen.add("self");
        seen.add("R2");
        seen.add("R3");
      }
      continue;
    }
    if (r === "R3" && rulesAll.includes("R2")) continue;
    if (seen.has(r)) continue;
    seen.add(r);
    parts.push(RULE_REASON[r] || r);
  }
  return esc(parts.join("；"));
}

function yn(v) {
  return v
    ? '<span class="yes">是</span>'
    : '<span class="muted">否</span>';
}

function buildHtml(out) {
  const s = out.summary;
  const flaggedBefore = out.list.filter((x) => x.period === "开始前");
  const flaggedAfter = out.list.filter((x) => x.period === "开始后");
  const r6Before = s.R6_clicks.before.light + s.R6_clicks.before.scan;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>可疑数据</title>
<style>
  @font-face{
    font-family:"Noto Sans SC";
    src:url("./fonts/NotoSansSC-VF.ttf") format("truetype");
    font-weight:100 900;font-style:normal;font-display:swap;
  }
  :root{
    --ink:#1a1a1a;--muted:#6b7280;--line:#e5e7eb;--page:#f3f4f6;--card:#fff;
    --liyan:#C62828;--gano:#1565C0;--warn:#B45309;--hit:#FFF7ED;
  }
  *{box-sizing:border-box}
  body{
    margin:0;font-family:"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif;
    color:var(--ink);background:var(--page);padding:20px 14px 40px;
  }
  .wrap{max-width:1100px;margin:0 auto}
  .sheet{
    background:var(--card);border:1px solid var(--line);border-radius:10px;
    box-shadow:0 1px 2px rgba(0,0,0,.04);overflow:hidden;
  }
  .brand-bar{display:flex;height:4px}
  .brand-bar .liyan{flex:1;background:var(--liyan)}
  .brand-bar .gano{flex:1;background:var(--gano)}
  header{padding:18px 22px 14px;border-bottom:1px solid var(--line)}
  header h1{margin:0;font-size:18px;font-weight:700}
  header .meta{margin-top:6px;font-size:12px;color:var(--muted)}
  .body{padding:16px 22px 22px}
  h2{margin:0 0 10px;font-size:14px;font-weight:700}
  h3{margin:16px 0 8px;font-size:13px;font-weight:700;color:#374151}
  .kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:16px}
  .kpi{border:1px solid var(--line);border-radius:8px;padding:12px 14px;background:#fafafa}
  .kpi .l{font-size:12px;color:var(--muted)}
  .kpi .v{margin-top:4px;font-size:24px;font-weight:700}
  .kpi.warn .v{color:var(--warn)}
  .table-wrap{overflow:auto;border:1px solid var(--line);border-radius:8px}
  table{width:100%;border-collapse:collapse;font-size:12.5px;min-width:900px}
  th,td{padding:9px 10px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
  th{background:#111827;color:#fff;font-weight:600;white-space:nowrap}
  tr:last-child td{border-bottom:0}
  tr.hit{background:var(--hit)}
  .mono{font-variant-numeric:tabular-nums;font-family:ui-monospace,Consolas,monospace;font-size:12px}
  .sub{margin-top:3px;color:var(--muted);font-size:11px;font-family:"Noto Sans SC",sans-serif}
  .tag{
    display:inline-block;margin-top:4px;padding:1px 6px;border-radius:4px;
    background:#111827;color:#fff;font-size:10px;font-weight:600;
  }
  .chip{
    display:inline-flex;align-items:center;height:20px;padding:0 7px;margin:0 4px 4px 0;
    border-radius:999px;font-size:11px;font-weight:700;background:#e5e7eb;color:#111;
  }
  .chip.rule.r1{background:#FEE2E2;color:#991B1B}
  .chip.rule.r2{background:#FFEDD5;color:#9A3412}
  .chip.rule.r3{background:#FEF3C7;color:#92400E}
  .chip.rule.r4{background:#E0E7FF;color:#3730A3}
  .chip.rule.r5{background:#F3E8FF;color:#6B21A8}
  .yes{color:var(--liyan);font-weight:700}
  .muted{color:var(--muted)}
  .reason{font-weight:600;color:#9A3412;white-space:nowrap}
  .empty{text-align:center;color:var(--muted);padding:20px !important}
  @media (max-width:700px){
    .kpis{grid-template-columns:1fr 1fr}
    .body,header{padding-left:14px;padding-right:14px}
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="sheet">
    <div class="brand-bar"><i class="liyan"></i><i class="gano"></i></div>
    <header>
      <h1>可疑数据</h1>
      <div class="meta">开始 ${esc(out.campaignStart)} · R1+R2+R4+R5+R6 · 全量已领 ${esc(s.allClaimedCoupons)}</div>
    </header>
    <div class="body">
      <div class="kpis">
        <div class="kpi warn"><div class="l">可疑券</div><div class="v">${s.suspiciousCoupons}</div></div>
        <div class="kpi"><div class="l">开始前</div><div class="v">${s.before.count}</div></div>
        <div class="kpi warn"><div class="l">开始后</div><div class="v">${s.after.count}</div></div>
        <div class="kpi warn"><div class="l">开始前点击 R6</div><div class="v">${r6Before}</div></div>
      </div>
      <div class="muted" style="font-size:12px;margin:-6px 0 14px">
        R6 开始前：亮码 ${s.R6_clicks.before.light} · 扫码 ${s.R6_clicks.before.scan}
      </div>

      <h2>可疑券码</h2>
      ${
        !out.list.length
          ? `<p class="muted" style="font-size:13px">无可疑券</p>`
          : `${
              flaggedBefore.length
                ? `<h3>开始前（${flaggedBefore.length}）</h3>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>券码</th><th>类型</th><th>领取时间</th><th>门店</th><th>发券</th><th>领取</th><th>问题原因</th><th>作废</th>
        </tr></thead>
        <tbody>${couponRowsHtmlCompact(flaggedBefore)}</tbody>
      </table></div>`
                : ""
            }
      ${
        flaggedAfter.length
          ? `<h3>开始后（${flaggedAfter.length}）</h3>
      <div class="table-wrap"><table>
        <thead><tr>
          <th>券码</th><th>类型</th><th>领取时间</th><th>门店</th><th>发券</th><th>领取</th><th>问题原因</th><th>作废</th>
        </tr></thead>
        <tbody>${couponRowsHtmlCompact(flaggedAfter)}</tbody>
      </table></div>`
          : ""
      }`
      }
    </div>
  </div>
</div>
</body>
</html>`;
}

function couponRowsHtmlCompact(rows) {
  if (!rows.length) {
    return `<tr><td colspan="8" class="empty">无</td></tr>`;
  }
  return rows
    .map(
      (r) => `<tr class="hit">
      <td class="mono">${esc(r.couponNo)}</td>
      <td>${esc(r.couponType)}</td>
      <td class="mono">${esc(r.claimTime)}</td>
      <td>${esc(r.issueShop)}</td>
      <td class="mono">${esc(r.issuerMobile)}${r.issuerName ? `<div class="sub">${esc(r.issuerName)}</div>` : ""}${r.issuerStaff ? '<div class="tag">Staff</div>' : ""}</td>
      <td class="mono">${esc(r.claimerMobile)}${r.claimerName ? `<div class="sub">${esc(r.claimerName)}</div>` : ""}${r.claimerStaff ? '<div class="tag">Staff</div>' : ""}</td>
      <td class="reason">${reasonText(r.rulesAll)}</td>
      <td>${r.voided ? yn(true) : '<span class="muted">—</span>'}</td>
    </tr>`
    )
    .join("\n");
}

async function main() {
  const cfg = loadDbConfig();
  const conn = await mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    charset: "utf8mb4",
    timezone: "+08:00",
    dateStrings: true,
  });

  try {
    const [staffRows] = await conn.execute(
      `SELECT st.Mobile, st.Staff_Name, st.Role_Type, sh.Brand_Type, sh.Shop_Name
       FROM tb_alliance_staff st
       JOIN tb_alliance_shop sh ON sh.ID = st.Alliance_Shop_ID AND sh.Delete_Yn = 0
       WHERE st.Delete_Yn = 0
         AND st.Mobile IS NOT NULL
         AND st.Mobile <> ''`
    );

    const staffMap = new Map();
    for (const s of staffRows) {
      const m = String(s.Mobile).trim();
      if (!m) continue;
      if (!staffMap.has(m)) staffMap.set(m, []);
      staffMap.get(m).push({
        name: s.Staff_Name,
        role: s.Role_Type,
        brand: brand(s.Brand_Type),
        shop: s.Shop_Name,
      });
    }
    const isStaff = (m) => staffMap.has(String(m || "").trim());

    const [couponRows] = await conn.execute(
      `SELECT cp.ID, cp.Coupon_Code, cp.Redeem_Code, cp.Coupon_Type, cp.Coupon_Status,
              cp.Issuer_Mobile, cp.Claim_Mobile, cp.Claim_Time, cp.Void_Time,
              cp.Void_Reason, cp.Void_Operator_Name, cp.Redeem_Time,
              ish.Shop_Name AS Issue_Shop_Name, ish.Brand_Type AS Issue_Brand_Type
       FROM tb_alliance_coupon cp
       LEFT JOIN tb_alliance_shop ish ON ish.ID = cp.Issuer_Shop_ID AND ish.Delete_Yn = 0
       WHERE cp.Delete_Yn = 0
         AND cp.Claim_Time IS NOT NULL
       ORDER BY cp.Claim_Time ASC`
    );

    const staffLabel = (m) => {
      const list = staffMap.get(String(m || "").trim()) || [];
      if (!list.length) return "";
      const names = [...new Set(list.map((x) => x.name).filter(Boolean))];
      return names.join("/") || "";
    };

    const STATUS = {
      1: "已发未领",
      2: "已领取",
      3: "已核销",
      4: "已过期",
      5: "已作废",
    };

    const allClaimed = [];
    const flagged = [];
    for (const c of couponRows) {
      const claimTime = fmt(c.Claim_Time);
      const d = day(claimTime);
      const issuer = String(c.Issuer_Mobile || "").trim();
      const claimer = String(c.Claim_Mobile || "").trim();
      const voided = !!c.Void_Time || String(c.Coupon_Status) === "5";
      const rulesAll = [];
      if (d && d < START) rulesAll.push("R1");
      if (claimer && isStaff(claimer)) rulesAll.push("R2");
      if (issuer && claimer && issuer === claimer) rulesAll.push("R3");
      if (
        issuer &&
        claimer &&
        issuer !== claimer &&
        isStaff(issuer) &&
        isStaff(claimer)
      ) {
        rulesAll.push("R4");
      }
      if (voided) rulesAll.push("R5");

      const rules = rulesAll.filter((r) =>
        ["R1", "R2", "R4", "R5"].includes(r)
      );

      const row = {
        couponNo: c.Redeem_Code || c.Coupon_Code || "",
        couponId: String(c.ID),
        couponType: TYPE[Number(c.Coupon_Type)] || String(c.Coupon_Type),
        couponStatus: STATUS[Number(c.Coupon_Status)] || String(c.Coupon_Status || ""),
        claimTime,
        redeemTime: fmt(c.Redeem_Time),
        period: d < START ? "开始前" : "开始后",
        issueBrand: brand(c.Issue_Brand_Type),
        issueShop: c.Issue_Shop_Name || "",
        issuerMobile: issuer,
        claimerMobile: claimer,
        issuerName: staffLabel(issuer),
        claimerName: staffLabel(claimer),
        issuerStaff: isStaff(issuer),
        claimerStaff: isStaff(claimer),
        voided,
        voidTime: fmt(c.Void_Time),
        voidReason: c.Void_Reason || "",
        voidOperator: c.Void_Operator_Name || "",
        rules,
        rulesAll,
        suspicious: rules.length > 0,
      };
      allClaimed.push(row);
      if (row.suspicious) flagged.push(row);
    }

    const [[lightBefore]] = await conn.execute(
      `SELECT COUNT(*) AS n FROM tb_alliance_click_stat c
       WHERE c.Delete_Yn = 0 AND c.Action_Type = 1 AND c.Action_Time < ?`,
      [START_DT]
    );
    const [[scanBefore]] = await conn.execute(
      `SELECT COUNT(*) AS n FROM tb_alliance_click_stat c
       WHERE c.Delete_Yn = 0 AND c.Action_Type = 2 AND c.Action_Time < ?`,
      [START_DT]
    );
    const [[lightAfter]] = await conn.execute(
      `SELECT COUNT(*) AS n FROM tb_alliance_click_stat c
       WHERE c.Delete_Yn = 0 AND c.Action_Type = 1 AND c.Action_Time >= ?`,
      [START_DT]
    );
    const [[scanAfter]] = await conn.execute(
      `SELECT COUNT(*) AS n FROM tb_alliance_click_stat c
       WHERE c.Delete_Yn = 0 AND c.Action_Type = 2 AND c.Action_Time >= ?`,
      [START_DT]
    );

    const byPeriod = { 开始前: [], 开始后: [] };
    for (const r of flagged) byPeriod[r.period].push(r);

    const countRules = (arr) => {
      const m = { R1: 0, R2: 0, R4: 0, R5: 0 };
      for (const x of arr) {
        for (const rule of x.rules) {
          if (m[rule] != null) m[rule] += 1;
        }
      }
      return m;
    };
    const byBrand = (arr) => {
      const m = {};
      for (const x of arr) m[x.issueBrand] = (m[x.issueBrand] || 0) + 1;
      return m;
    };

    const summary = {
      staffPhones: staffMap.size,
      allClaimedCoupons: couponRows.length,
      suspiciousCoupons: flagged.length,
      before: {
        count: byPeriod["开始前"].length,
        byRuleHit: countRules(byPeriod["开始前"]),
        byBrand: byBrand(byPeriod["开始前"]),
      },
      after: {
        count: byPeriod["开始后"].length,
        byRuleHit: countRules(byPeriod["开始后"]),
        byBrand: byBrand(byPeriod["开始后"]),
      },
      R6_clicks: {
        before: {
          light: Number(lightBefore.n),
          scan: Number(scanBefore.n),
        },
        after: {
          light: Number(lightAfter.n),
          scan: Number(scanAfter.n),
        },
      },
      note: "券按 ID 去重；一券可命中多规则，故 byRuleHit 之和可大于条数。R3（自发自领）并入 R2 展示于 rulesAll。",
    };

    const beforeAll = allClaimed.filter((x) => x.period === "开始前");
    const afterAll = allClaimed.filter((x) => x.period === "开始后");
    summary.periodAll = {
      before: beforeAll.length,
      after: afterAll.length,
    };

    const out = {
      generatedAt: new Date().toISOString(),
      campaignStart: START,
      rules: ["R1", "R2", "R4", "R5", "R6"],
      summary,
      list: flagged,
      allClaimed,
    };

    const jsonPath = path.join(__dirname, "data", "suspicious-test-coupons.json");
    fs.writeFileSync(jsonPath, JSON.stringify(out, null, 2) + "\n", "utf8");

    const mdLines = [];
    mdLines.push("# 疑似测试/非真实活动数据识别结果");
    mdLines.push("");
    mdLines.push(`- 活动正式开始：\`${START}\``);
    mdLines.push(`- 生成时间：\`${out.generatedAt}\``);
    mdLines.push(`- 规则：R1 开始前领取；R2 领取人∈Staff；R4 员工互领；R5 已作废；R6 开始前亮码/扫码`);
    mdLines.push("");
    mdLines.push("## 汇总");
    mdLines.push("");
    mdLines.push(`| 项 | 数量 |`);
    mdLines.push(`|---|---:|`);
    mdLines.push(`| 全量已领券 | ${summary.allClaimedCoupons} |`);
    mdLines.push(`| 可疑券（去重） | **${summary.suspiciousCoupons}** |`);
    mdLines.push(`| 其中 · 开始前 | **${summary.before.count}** |`);
    mdLines.push(`| 其中 · 开始后 | **${summary.after.count}** |`);
    mdLines.push("");
    mdLines.push("### 开始前 · 规则命中次数（可重叠）");
    mdLines.push("");
    mdLines.push(`| R1 | R2 | R4 | R5 |`);
    mdLines.push(`|---:|---:|---:|---:|`);
    mdLines.push(
      `| ${summary.before.byRuleHit.R1} | ${summary.before.byRuleHit.R2} | ${summary.before.byRuleHit.R4} | ${summary.before.byRuleHit.R5} |`
    );
    mdLines.push("");
    mdLines.push("### 开始后 · 规则命中次数（可重叠）");
    mdLines.push("");
    mdLines.push(`| R1 | R2 | R4 | R5 |`);
    mdLines.push(`|---:|---:|---:|---:|`);
    mdLines.push(
      `| ${summary.after.byRuleHit.R1} | ${summary.after.byRuleHit.R2} | ${summary.after.byRuleHit.R4} | ${summary.after.byRuleHit.R5} |`
    );
    mdLines.push("");
    mdLines.push("### R6 点击（亮码/扫码）");
    mdLines.push("");
    mdLines.push(`| 区间 | 亮码 | 扫码 |`);
    mdLines.push(`|---|---:|---:|`);
    mdLines.push(
      `| 开始前 | **${summary.R6_clicks.before.light}** | **${summary.R6_clicks.before.scan}** |`
    );
    mdLines.push(
      `| 开始后 | ${summary.R6_clicks.after.light} | ${summary.R6_clicks.after.scan} |`
    );
    mdLines.push("");
    mdLines.push("## 可疑券码清单");
    mdLines.push("");
    mdLines.push(
      "| 区间 | 券码 | 领取时间 | 品牌 | 门店 | 发券手机 | 领取手机 | 命中规则 | 作废 |"
    );
    mdLines.push("|---|---|---|---|---|---|---|---|---|");
    for (const r of flagged) {
      mdLines.push(
        `| ${r.period} | \`${r.couponNo}\` | ${r.claimTime} | ${r.issueBrand} | ${r.issueShop} | ${r.issuerMobile} | ${r.claimerMobile} | ${r.rules.join("+")} | ${r.voided ? "是" : ""} |`
      );
    }
    mdLines.push("");

    const mdPath = path.join(__dirname, "docs", "suspicious-test-coupons.md");
    fs.writeFileSync(mdPath, mdLines.join("\n"), "utf8");

    const htmlPath = path.join(__dirname, "suspicious-test-coupons.html");
    fs.writeFileSync(htmlPath, buildHtml(out), "utf8");

    console.log(JSON.stringify(summary, null, 2));
    console.log("written:", jsonPath);
    console.log("written:", mdPath);
    console.log("written:", htmlPath);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
