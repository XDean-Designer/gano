/**
 * Build HTML A (swimlane storyboard) + B (catalog) by embedding the exact
 * Screen components extracted from gano-rubis-alliance-flow.canvas.tsx.
 * Renders via React in-browser — pixel-faithful to the canvas phones.
 */
import fs from "fs";
import { execSync } from "child_process";

execSync("node extract-screens.mjs", { cwd: "d:/GANO小联盟", stdio: "inherit" });
const screensJsx = fs.readFileSync("d:/GANO小联盟/alliance-screens.jsx", "utf8");

const COLUMNS = [
  { title: "进入获客", advisor: "enter" },
  { title: "按档点选", advisor: "tiers" },
  { title: "亮码", advisor: "code", customer: "wxScan" },
  { title: "GANO店铺", customer: "shop" },
  { title: "领取", customer: "claim" },
  { title: "领到券", customer: "ticket" },
  { title: "到店对码", customer: "show", gano: "camera" },
  {
    title: "核销结果",
    customerOk: "used",
    customerExpired: "staleTicket",
    ganoOk: "redeemed",
    ganoExpired: "expired",
  },
  { title: "做完之后", advisor: "feedback", ganoOk: "review", ganoExpired: "manual" },
  { title: "两边账", boss: "stats" },
];

const SUPPLEMENTS = [
  { id: "tiersEmpty", title: "档位发完", role: "顾问" },
  { id: "codeV35", title: "V3–V5 亮码", role: "顾问" },
  { id: "claimV35", title: "V3–V5 领取", role: "顾客" },
  { id: "ticketV35", title: "V3–V5 领到券", role: "顾客" },
  { id: "showQr", title: "出示核销码", role: "顾客" },
  { id: "myCoupons", title: "我的券", role: "顾客" },
  { id: "sessionExpired", title: "领取码失效", role: "顾客" },
  { id: "alreadyClaimed", title: "重复领取", role: "顾客" },
  { id: "denyAuth", title: "拒绝授权", role: "顾客" },
  { id: "shopPublic", title: "无会话进店", role: "顾客" },
];

const ORIGINAL_IDS = [
  "enter",
  "tiers",
  "code",
  "wxScan",
  "shop",
  "claim",
  "ticket",
  "show",
  "camera",
  "redeemed",
  "used",
  "expired",
  "staleTicket",
  "review",
  "feedback",
  "manual",
  "stats",
];

const ALL_CATALOG = [
  ...ORIGINAL_IDS.map((id) => ({
    id,
    tag: "原有",
    title: id,
  })),
  ...SUPPLEMENTS.map((s) => ({ id: s.id, tag: "新增", title: s.title, role: s.role })),
];

const TITLE_MAP = {
  enter: "进入获客",
  tiers: "按档点选",
  code: "亮码 V6–V10",
  wxScan: "微信扫码",
  shop: "GANO 店铺",
  claim: "领取+授权",
  ticket: "领到券",
  show: "到店找券",
  camera: "扫码核销",
  redeemed: "核销成功",
  used: "已核销",
  expired: "过期不可核",
  staleTicket: "过期券",
  review: "写评价",
  feedback: "看回写",
  manual: "过期手记",
  stats: "两边账 / 数据",
};

function shellHtml(mode) {
  const data = {
    mode,
    columns: COLUMNS,
    supplements: SUPPLEMENTS,
    catalog: ALL_CATALOG.map((c) => ({
      ...c,
      title: c.title === c.id ? TITLE_MAP[c.id] || c.id : c.title,
    })),
  };

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>丽妍雅集×GANO · ${mode === "A" ? "方案A 泳道故事板" : "方案B 分屏图鉴"}（canvas 1:1）</title>
<style>
  @font-face{
    font-family:"Noto Sans SC";
    src:url("./fonts/NotoSansSC-VF.ttf") format("truetype");
    font-weight:100 900;
    font-style:normal;
    font-display:swap;
  }
  *{box-sizing:border-box}
  body{margin:0;font-family:"Noto Sans SC","Source Han Sans SC",sans-serif;background:#F0F0F0;color:#111}
  .topbar{position:sticky;top:0;z-index:30;background:#fff;border-bottom:1px solid #eee;padding:12px 20px}
  .topbar h1{margin:0;font-size:18px}
  .topbar p{margin:4px 0 0;font-size:12px;color:#888}
  .legend{display:flex;gap:16px;margin-top:8px;font-size:12px}
  .legend b{font-weight:600}
  .legend .o{color:#666}.legend .n{color:#FF6633}
  .section{padding:16px 12px 28px}
  .section h2{margin:0 0 4px;font-size:15px}
  .section .desc{font-size:12px;color:#888;margin-bottom:10px}
  .board{overflow-x:auto;padding-bottom:8px}
  .lane-grid{display:grid;align-items:stretch}
  .lane-head{padding:8px 8px 0;font-size:12px;font-weight:600;color:#666}
  .lane-label{position:sticky;left:0;z-index:5;background:#F0F0F0;border-top:1px solid #e5e5e5;display:flex;align-items:center;padding:0 12px;font-size:12px;font-weight:600}
  .lane-label.split{flex-direction:column;padding:0}
  .lane-label.split>div{flex:1;display:flex;align-items:center;padding:0 12px;width:100%}
  .lane-label.split>div+div{border-top:1px solid #e5e5e5}
  .cell{border-top:1px solid #e5e5e5;background:#eaeaea;display:flex;align-items:center;justify-content:center;padding:8px 0}
  .phone-slot{position:relative;flex-shrink:0;display:flex;flex-direction:column;align-items:center}
  .tag{height:22px;line-height:22px;font-size:11px;font-weight:600;letter-spacing:0.5px}
  .tag.old{color:#666}.tag.new{color:#FF6633}
  .phone-frame{overflow:hidden;flex-shrink:0;background:#fff;box-sizing:border-box}
  .phone-inner{width:390px;height:844px;transform-origin:top left;overflow:hidden;font-family:"Noto Sans SC","Source Han Sans SC",sans-serif}
  .toc{display:flex;flex-wrap:wrap;gap:8px;padding:12px 20px;background:#fff;border-bottom:1px solid #eee}
  .toc a{font-size:12px;padding:4px 10px;border-radius:999px;background:#F5F5F5;color:inherit;text-decoration:none}
  .toc a.new{background:#FFF4EE;color:#FF6633}
  .catalog{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;padding:16px}
  .catalog-item{background:#fff;border:1px solid #eee;border-radius:12px;padding:12px}
  .catalog-item h3{margin:0 0 4px;font-size:14px}
  .catalog-meta{font-size:11px;color:#888;margin-bottom:10px}
  .role-tag{font-size:11px;color:#999;margin-bottom:4px;text-align:center}
  #root{min-height:100vh}
  .loading{padding:40px;text-align:center;color:#888}
</style>
</head>
<body>
<div id="root"><div class="loading">正在加载 canvas 同款页面组件…</div></div>
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.26.0/babel.min.js"></script>
<script type="text/babel" data-presets="react">
${screensJsx}

const DATA = ${JSON.stringify(data, null, 2)};

function PhoneFrame({ id, isNew, scale }) {
  const { Screen, DESIGN_W, DESIGN_H, SCALE } = window.AllianceScreens;
  const s = scale == null ? SCALE : scale;
  const labelH = 22;
  return (
    <div className="phone-slot" style={{ width: DESIGN_W * s, height: DESIGN_H * s + labelH }}>
      <div className={"tag " + (isNew ? "new" : "old")}>{isNew ? "新增" : "原有"}</div>
      <div className="phone-frame" style={{ width: DESIGN_W * s, height: DESIGN_H * s }}>
        <div className="phone-inner" style={{ transform: "scale(" + s + ")" }}>
          <Screen id={id} />
        </div>
      </div>
    </div>
  );
}

function Cell({ screen, isNew }) {
  if (!screen) return <div className="cell" />;
  return (
    <div className="cell">
      <PhoneFrame id={screen} isNew={!!isNew} />
    </div>
  );
}

function StoryboardA() {
  const { DESIGN_W, DESIGN_H, SCALE } = window.AllianceScreens;
  const labelH = 22;
  const colW = Math.round(DESIGN_W * SCALE) + 28;
  const phoneH = Math.round(DESIGN_H * SCALE) + labelH + 12;
  const width = 168 + DATA.columns.length * colW;
  const cols = DATA.columns;

  return (
    <div>
      <div className="topbar">
        <h1>方案 A · 泳道故事板（canvas 1:1 · 390×844 · 无边框）</h1>
        <p>直接运行 canvas 同一套 Screen 组件 · 本地 Noto Sans SC</p>
        <div className="legend">
          <span className="o"><b>原有</b> 文字标签</span>
          <span className="n"><b>新增</b> 文字标签</span>
        </div>
      </div>

      <div className="section">
        <h2>原有主路径</h2>
        <div className="desc">丽妍雅集 → GANO · 顾问发券到老板看数（与 canvas 泳道一致）</div>
        <div className="board">
          <div
            className="lane-grid"
            style={{
              gridTemplateColumns: "168px repeat(" + cols.length + ", " + colW + "px)",
              gridTemplateRows: "36px " + phoneH + "px " + phoneH + "px " + phoneH + "px " + phoneH + "px " + phoneH + "px " + phoneH + "px",
              minWidth: width,
            }}
          >
            <div style={{ position: "sticky", left: 0, zIndex: 5, background: "#F0F0F0" }} />
            {cols.map((col, i) => (
              <div key={col.title} className="lane-head">
                {String(i + 1).padStart(2, "0")} {col.title}
              </div>
            ))}

            <div className="lane-label" style={{ gridColumn: 1, gridRow: 2 }}>丽妍雅集顾问</div>
            <div className="lane-label split" style={{ gridColumn: 1, gridRow: "3 / span 2" }}>
              <div>顾客 · 核销成功</div>
              <div>顾客 · 已过期</div>
            </div>
            <div className="lane-label split" style={{ gridColumn: 1, gridRow: "5 / span 2" }}>
              <div>GANO店员 · 核销成功</div>
              <div>GANO店员 · 已过期</div>
            </div>
            <div className="lane-label" style={{ gridColumn: 1, gridRow: 7 }}>丽妍雅集老板</div>

            {cols.map((col, index) => {
              const c = index + 2;
              return (
                <React.Fragment key={col.title}>
                  <div style={{ gridColumn: c, gridRow: 2 }}><Cell screen={col.advisor} /></div>
                  {col.customer ? (
                    <div style={{ gridColumn: c, gridRow: "3 / span 2" }}><Cell screen={col.customer} /></div>
                  ) : (
                    <>
                      <div style={{ gridColumn: c, gridRow: 3 }}><Cell screen={col.customerOk} /></div>
                      <div style={{ gridColumn: c, gridRow: 4 }}><Cell screen={col.customerExpired} /></div>
                    </>
                  )}
                  {col.gano ? (
                    <div style={{ gridColumn: c, gridRow: "5 / span 2" }}><Cell screen={col.gano} /></div>
                  ) : (
                    <>
                      <div style={{ gridColumn: c, gridRow: 5 }}><Cell screen={col.ganoOk} /></div>
                      <div style={{ gridColumn: c, gridRow: 6 }}><Cell screen={col.ganoExpired} /></div>
                    </>
                  )}
                  <div style={{ gridColumn: c, gridRow: 7 }}><Cell screen={col.boss} /></div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div className="section">
        <h2>逻辑补全 · 文字标签「新增」</h2>
        <div className="desc">P0 + P1：与 canvas 下方补全区一致</div>
        <div className="board">
          <div
            className="lane-grid"
            style={{
              gridTemplateColumns: "120px repeat(" + DATA.supplements.length + ", " + colW + "px)",
              gridTemplateRows: "36px " + (phoneH + 20) + "px",
              minWidth: 120 + DATA.supplements.length * colW,
            }}
          >
            <div style={{ position: "sticky", left: 0, zIndex: 5, background: "#F0F0F0" }} />
            {DATA.supplements.map((item, i) => (
              <div key={item.id} className="lane-head">N{String(i + 1).padStart(2, "0")} {item.title}</div>
            ))}
            <div className="lane-label" style={{ gridColumn: 1, gridRow: 2 }}>补全页</div>
            {DATA.supplements.map((item, index) => (
              <div key={item.id} className="cell" style={{ gridColumn: index + 2, gridRow: 2, flexDirection: "column", gap: 6 }}>
                <div className="role-tag">{item.role}</div>
                <PhoneFrame id={item.id} isNew />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CatalogB() {
  return (
    <div>
      <div className="topbar">
        <h1>方案 B · 分屏图鉴（canvas 1:1 · 390×844 · 无边框）</h1>
        <p>共 {DATA.catalog.length} 屏 · 本地 Noto Sans SC · 与 canvas Screen 同一源码</p>
        <div className="legend">
          <span className="o"><b>原有</b> 文字标签</span>
          <span className="n"><b>新增</b> 文字标签</span>
        </div>
      </div>
      <div className="toc">
        {DATA.catalog.map((item) => (
          <a key={item.id} href={"#" + item.id} className={item.tag === "新增" ? "new" : ""}>
            {item.tag} {item.title}
          </a>
        ))}
      </div>
      <div className="catalog">
        {DATA.catalog.map((item) => (
          <div className="catalog-item" id={item.id} key={item.id}>
            <h3>{item.title}</h3>
            <div className="catalog-meta">{item.tag} · {item.id}{item.role ? " · " + item.role : ""}</div>
            <PhoneFrame id={item.id} isNew={item.tag === "新增"} scale={0.62} />
          </div>
        ))}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(DATA.mode === "A" ? <StoryboardA /> : <CatalogB />);
</script>
</body>
</html>`;
}

fs.writeFileSync("d:/GANO小联盟/alliance-flow-A-storyboard.html", shellHtml("A"), "utf8");
fs.writeFileSync("d:/GANO小联盟/alliance-flow-B-catalog.html", shellHtml("B"), "utf8");
console.log(
  "wrote A+B",
  fs.statSync("d:/GANO小联盟/alliance-flow-A-storyboard.html").size,
  fs.statSync("d:/GANO小联盟/alliance-flow-B-catalog.html").size
);
