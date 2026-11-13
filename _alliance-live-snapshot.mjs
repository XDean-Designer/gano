/**
 * 从生产只读库组装联盟日报快照（自 REPORT_START；含作废券，由看板开关过滤）。
 * 用法：
 *   import { buildLiveSnapshot, loadDbConfig } from "./_alliance-live-snapshot.mjs"
 *   node _alliance-live-snapshot.mjs --write
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_START = "2026-11-11";
const REPORT_START_DT = `${REPORT_START} 00:00:00`;

const COUPON_META = {
  1: {
    couponName: "丽妍雅集 V3–V5",
    couponPrice: "218",
    projectName: "首席设计师洗剪吹或法式头皮减压",
    issueBrandName: "丽妍雅集",
    redeemBrandName: "GANO",
  },
  2: {
    couponName: "丽妍雅集 V6–V10",
    couponPrice: "480",
    projectName: "日本玫丽盼全球化护理一次",
    issueBrandName: "丽妍雅集",
    redeemBrandName: "GANO",
  },
  3: {
    couponName: "购卡满 5000",
    couponPrice: "980",
    projectName: "紫镜嘭弾护理一次",
    issueBrandName: "GANO",
    redeemBrandName: "丽妍雅集",
  },
  4: {
    couponName: "购卡满 10000",
    couponPrice: "1360",
    projectName: "紫镜嘭弾护理 + 归元暖腹灸",
    issueBrandName: "GANO",
    redeemBrandName: "丽妍雅集",
  },
};

const ROLE_NAME = { 1: "店主", 2: "店员", 3: "运营" };

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatDt(v) {
  if (!v) return "";
  if (typeof v === "string") return v.slice(0, 19).replace("T", " ");
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function stampNow() {
  const d = new Date();
  // Asia/Shanghai wall clock via locale
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

export function loadDbConfig() {
  const localPath = path.join(__dirname, "data", "db-readonly.local.json");
  let file = {};
  if (fs.existsSync(localPath)) {
    file = JSON.parse(fs.readFileSync(localPath, "utf8"));
  }
  const cfg = {
    host: process.env.ALLIANCE_DB_HOST || file.host,
    port: Number(process.env.ALLIANCE_DB_PORT || file.port || 33306),
    user: process.env.ALLIANCE_DB_USER || file.user,
    password: process.env.ALLIANCE_DB_PASSWORD || file.password,
    database: process.env.ALLIANCE_DB_DATABASE || file.database || "rts_base",
  };
  if (!cfg.host || !cfg.user || !cfg.password) {
    throw new Error(
      "缺少只读库配置：请创建 data/db-readonly.local.json 或设置 ALLIANCE_DB_* 环境变量"
    );
  }
  return cfg;
}

async function q(conn, sql, params = []) {
  const [rows] = await conn.execute(sql, params);
  return rows;
}

export async function buildLiveSnapshot(cfg = loadDbConfig()) {
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
    const staffRows = await q(
      conn,
      `SELECT st.ID, st.Mobile, st.Staff_Name, st.Role_Type, st.Alliance_Shop_ID,
              sh.Shop_Name, sh.Brand_Type
       FROM tb_alliance_staff st
       JOIN tb_alliance_shop sh ON sh.ID = st.Alliance_Shop_ID AND sh.Delete_Yn = 0
       WHERE st.Delete_Yn = 0
       ORDER BY sh.Brand_Type, sh.Shop_Name, st.ID`
    );

    const staff = staffRows.map((s) => {
      const brandType = String(s.Brand_Type);
      const brandName = brandType === "1" ? "丽妍雅集" : "GANO";
      return {
        brandName,
        brandType,
        mobile: s.Mobile,
        roleName: ROLE_NAME[s.Role_Type] || String(s.Role_Type),
        roleType: String(s.Role_Type),
        shopId: String(s.Alliance_Shop_ID),
        shopName: s.Shop_Name,
        staffId: String(s.ID),
        staffName: s.Staff_Name,
        phone: s.Mobile,
        companyName: brandName,
        storeName: s.Shop_Name,
      };
    });

    const couponRows = await q(
      conn,
      `SELECT cp.ID, cp.Coupon_Code, cp.Coupon_Type, cp.Issuer_Mobile, cp.Issuer_Shop_ID,
              cp.Claim_Time, cp.Claim_Mobile, cp.Redeem_Code, cp.Redeem_Mobile,
              cp.Redeem_Shop_ID, cp.Redeem_Time, cp.Coupon_Status, cp.Void_Time,
              cp.Void_Operator_Name, cp.Void_Reason,
              ish.Shop_Name AS Issue_Shop_Name, ish.Brand_Type AS Issue_Brand_Type,
              rsh.Shop_Name AS Redeem_Shop_Name, rsh.Brand_Type AS Redeem_Brand_Type
       FROM tb_alliance_coupon cp
       LEFT JOIN tb_alliance_shop ish ON ish.ID = cp.Issuer_Shop_ID AND ish.Delete_Yn = 0
       LEFT JOIN tb_alliance_shop rsh ON rsh.ID = cp.Redeem_Shop_ID AND rsh.Delete_Yn = 0
       WHERE cp.Delete_Yn = 0
         AND cp.Claim_Time IS NOT NULL
         AND cp.Claim_Time >= ?
       ORDER BY cp.Claim_Time DESC`,
      [REPORT_START_DT]
    );

    const coupons = couponRows.map((c) => {
      const type = Number(c.Coupon_Type);
      const meta = COUPON_META[type] || {
        couponName: `券类型${type}`,
        couponPrice: "0",
        projectName: "",
        issueBrandName: "",
        redeemBrandName: "",
      };
      return {
        claimTime: formatDt(c.Claim_Time),
        couponId: String(c.ID),
        couponName: meta.couponName,
        couponNo: c.Redeem_Code || c.Coupon_Code || "",
        couponPrice: meta.couponPrice,
        couponStatus: String(c.Coupon_Status),
        couponType: String(type),
        customerMobile: c.Claim_Mobile || "",
        customerNickname: "",
        issueBrandType: String(c.Issue_Brand_Type ?? ""),
        issueShopName: c.Issue_Shop_Name || "",
        issueTime: formatDt(c.Claim_Time),
        issuerMobile: c.Issuer_Mobile || "",
        issuerNickname: "",
        issuerStaffName: "",
        projectName: meta.projectName,
        redeemBrandType: c.Redeem_Brand_Type != null ? String(c.Redeem_Brand_Type) : "",
        redeemMobile: c.Redeem_Mobile || "",
        redeemNickname: "",
        redeemShopName: c.Redeem_Shop_Name || "",
        redeemStaffName: "",
        redeemTime: formatDt(c.Redeem_Time),
        voidOperatorName: c.Void_Operator_Name || "",
        voidReason: c.Void_Reason || "",
        voidTime: formatDt(c.Void_Time),
        issuerPhone: c.Issuer_Mobile || "",
        storeName: c.Issue_Shop_Name || "",
        price: meta.couponPrice,
        status: String(c.Coupon_Status),
      };
    });

    const quotaRows = await q(
      conn,
      `SELECT Coupon_Type, Total_Limit, Claimed_Count
       FROM tb_alliance_coupon_quota
       WHERE Delete_Yn = 0
       ORDER BY Coupon_Type`
    );
    const quotas = quotaRows.map((r) => {
      const type = Number(r.Coupon_Type);
      const meta = COUPON_META[type] || {
        couponName: `券类型${type}`,
        projectName: "",
        issueBrandName: "",
        redeemBrandName: "",
      };
      const claimed = Number(r.Claimed_Count) || 0;
      const total = Number(r.Total_Limit) || 0;
      return {
        claimedCount: String(claimed),
        couponName: meta.couponName,
        couponType: String(type),
        issueBrandName: meta.issueBrandName,
        projectName: meta.projectName,
        redeemBrandName: meta.redeemBrandName,
        remain: String(Math.max(0, total - claimed)),
        totalLimit: String(total),
      };
    });

    const lightRows = await q(
      conn,
      `SELECT sh.Brand_Type AS brandType, sh.ID AS shopId, sh.Shop_Name AS shopName,
              COUNT(*) AS lightCount
       FROM tb_alliance_click_stat c
       JOIN tb_alliance_staff st ON st.Mobile = c.Mobile AND st.Delete_Yn = 0
       JOIN tb_alliance_shop sh ON sh.ID = st.Alliance_Shop_ID AND sh.Delete_Yn = 0
       WHERE c.Delete_Yn = 0 AND c.Action_Type = 1 AND c.Action_Time >= ?
       GROUP BY sh.Brand_Type, sh.ID, sh.Shop_Name`,
      [REPORT_START_DT]
    );

    const scanRows = await q(
      conn,
      `SELECT sh.Brand_Type AS brandType, sh.ID AS shopId, sh.Shop_Name AS shopName,
              COUNT(*) AS scanCount
       FROM tb_alliance_click_stat c
       JOIN tb_alliance_coupon cp ON cp.ID = c.Coupon_ID AND cp.Delete_Yn = 0
       JOIN tb_alliance_shop sh ON sh.ID = cp.Issuer_Shop_ID AND sh.Delete_Yn = 0
       WHERE c.Delete_Yn = 0 AND c.Action_Type = 2 AND c.Action_Time >= ?
       GROUP BY sh.Brand_Type, sh.ID, sh.Shop_Name`,
      [REPORT_START_DT]
    );

    const byDayLight = await q(
      conn,
      `SELECT sh.Brand_Type AS brandType, sh.Shop_Name AS shopName,
              DATE(c.Action_Time) AS d, COUNT(*) AS n
       FROM tb_alliance_click_stat c
       JOIN tb_alliance_staff st ON st.Mobile = c.Mobile AND st.Delete_Yn = 0
       JOIN tb_alliance_shop sh ON sh.ID = st.Alliance_Shop_ID AND sh.Delete_Yn = 0
       WHERE c.Delete_Yn = 0 AND c.Action_Type = 1 AND c.Action_Time >= ?
       GROUP BY sh.Brand_Type, sh.Shop_Name, DATE(c.Action_Time)
       ORDER BY d, brandType, n DESC`,
      [REPORT_START_DT]
    );

    const byDayScan = await q(
      conn,
      `SELECT sh.Brand_Type AS brandType, sh.Shop_Name AS shopName,
              DATE(c.Action_Time) AS d, COUNT(*) AS n
       FROM tb_alliance_click_stat c
       JOIN tb_alliance_coupon cp ON cp.ID = c.Coupon_ID AND cp.Delete_Yn = 0
       JOIN tb_alliance_shop sh ON sh.ID = cp.Issuer_Shop_ID AND sh.Delete_Yn = 0
       WHERE c.Delete_Yn = 0 AND c.Action_Type = 2 AND c.Action_Time >= ?
       GROUP BY sh.Brand_Type, sh.Shop_Name, DATE(c.Action_Time)
       ORDER BY d, brandType, n DESC`,
      [REPORT_START_DT]
    );

    const claimByBrand = { 1: 0, 2: 0 };
    const redeemByBrand = { 1: 0, 2: 0 };
    const voidedCount = coupons.filter(
      (c) => c.voidTime || String(c.couponStatus) === "5"
    ).length;
    for (const c of coupons) {
      const bt = Number(c.issueBrandType);
      const isVoid = !!(c.voidTime || String(c.couponStatus) === "5");
      if (bt === 1 || bt === 2) {
        /* funnelCumulative.claim/redeem 默认按「不含作废」写入；看板打开「含作废」时用券明细重算 */
        if (!isVoid) {
          claimByBrand[bt] += 1;
          if (c.couponStatus === "3" || c.couponStatus === "4" || c.redeemTime) {
            redeemByBrand[bt] += 1;
          }
        }
      }
    }

    const lightByBrand = { 1: 0, 2: 0 };
    const scanByBrand = { 1: 0, 2: 0 };
    const merged = new Map();
    for (const r of lightRows) {
      const bt = Number(r.brandType);
      const key = `${bt}|${r.shopName}`;
      lightByBrand[bt] = (lightByBrand[bt] || 0) + Number(r.lightCount);
      merged.set(key, {
        brandType: String(bt),
        brandName: bt === 1 ? "丽妍雅集" : "GANO HAIR",
        shopId: String(r.shopId),
        shopName: r.shopName,
        lightCount: Number(r.lightCount),
        scanCount: 0,
      });
    }
    for (const r of scanRows) {
      const bt = Number(r.brandType);
      const key = `${bt}|${r.shopName}`;
      scanByBrand[bt] = (scanByBrand[bt] || 0) + Number(r.scanCount);
      if (!merged.has(key)) {
        merged.set(key, {
          brandType: String(bt),
          brandName: bt === 1 ? "丽妍雅集" : "GANO HAIR",
          shopId: String(r.shopId),
          shopName: r.shopName,
          lightCount: 0,
          scanCount: 0,
        });
      }
      merged.get(key).scanCount = Number(r.scanCount);
    }

    const storeClicks = [...merged.values()].sort(
      (a, b) =>
        Number(a.brandType) - Number(b.brandType) ||
        b.lightCount - a.lightCount ||
        b.scanCount - a.scanCount ||
        a.shopName.localeCompare(b.shopName, "zh")
    );

    const clicksByDay = {
      light: byDayLight.map((r) => ({
        brandType: Number(r.brandType),
        shopName: r.shopName,
        date: String(r.d).slice(0, 10),
        lightCount: Number(r.n),
      })),
      scan: byDayScan.map((r) => ({
        brandType: Number(r.brandType),
        shopName: r.shopName,
        date: String(r.d).slice(0, 10),
        scanCount: Number(r.n),
      })),
    };

    const stamp = stampNow();
    return {
      ver: 9,
      kind: "live-snapshot",
      capturedAt: stamp,
      source: `后台已核对快照 · 生产只读库实时 · ${stamp}`,
      note: `含作废券入库（有效 ${coupons.length - voidedCount} / 作废 ${voidedCount} / 合计 ${coupons.length}）；亮码/扫码自 ${REPORT_START} 取自 tb_alliance_click_stat；看板默认不含作废`,
      reportStart: REPORT_START,
      voidedCount,
      staff,
      coupons,
      quotas,
      funnelCumulative: [
        {
          brandName: "丽妍雅集",
          brandType: "1",
          issueCount: String(lightByBrand[1] || 0),
          scanCount: String(scanByBrand[1] || 0),
          claimCount: String(claimByBrand[1] || 0),
          redeemCount: String(redeemByBrand[1] || 0),
        },
        {
          brandName: "GANO HAIR",
          brandType: "2",
          issueCount: String(lightByBrand[2] || 0),
          scanCount: String(scanByBrand[2] || 0),
          claimCount: String(claimByBrand[2] || 0),
          redeemCount: String(redeemByBrand[2] || 0),
        },
      ],
      storeClicks,
      clicksByDay,
      byDay: clicksByDay,
    };
  } finally {
    await conn.end();
  }
}

async function main() {
  const snap = await buildLiveSnapshot();
  const out = path.join(__dirname, "data", "alliance-daily-snapshot.json");
  if (process.argv.includes("--write")) {
    fs.writeFileSync(out, JSON.stringify(snap, null, 2) + "\n", "utf8");
    console.log(JSON.stringify({
      ok: true,
      written: out,
      capturedAt: snap.capturedAt,
      coupons: snap.coupons.length,
      staff: snap.staff.length,
      funnel: snap.funnelCumulative,
    }, null, 2));
  } else {
    console.log(JSON.stringify({
      ok: true,
      capturedAt: snap.capturedAt,
      coupons: snap.coupons.length,
      staff: snap.staff.length,
      funnel: snap.funnelCumulative,
    }, null, 2));
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
