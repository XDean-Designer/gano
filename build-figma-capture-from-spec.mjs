import fs from "fs";

const spec = fs.readFileSync("d:/GANO小联盟/alliance-flow-A-storyboard-spec.html", "utf8");
const start = spec.indexOf("const { useState } = React;");
const end = spec.indexOf("window.AllianceScreens");
if (start < 0 || end < 0) throw new Error("cannot find screen block in spec html");
// Include AllianceScreens assignment line
const assignEnd = spec.indexOf(";", end) + 1;
let screensJsx = spec.slice(start, assignEnd).trim() + "\n";

// Strip storyboard-only SCALE if present — keep DESIGN_W/H
// Ensure AllianceScreens exposes Screen
if (!screensJsx.includes("window.AllianceScreens")) {
  throw new Error("AllianceScreens missing");
}

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>GANO 联盟 · Figma Capture（规范版）</title>
<style>
  @font-face{
    font-family:"Noto Sans SC";
    src:url("./fonts/NotoSansSC-VF.ttf") format("truetype");
    font-weight:100 900;
    font-style:normal;
    font-display:swap;
  }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;background:#FFFFFF;font-family:"Noto Sans SC","Source Han Sans SC",sans-serif}
  .capture-mode .dev-chrome{display:none !important}
  .capture-mode .mask:not(.show),
  .capture-mode .sheet:not(.show),
  .capture-mode .dialog:not(.show){display:none !important}
  #frame{
    width:390px;
    height:844px;
    overflow:hidden;
    background:#FFFFFF;
    font-family:"Noto Sans SC","Source Han Sans SC",sans-serif;
    color:#333333;
  }
  .dev-chrome{padding:8px 12px;font-size:12px;color:#666;border-bottom:1px solid #eee}
</style>
</head>
<body>
<div class="dev-chrome" id="dev">Figma capture · spec</div>
<div id="frame"></div>
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.26.0/babel.min.js"></script>
<script type="text/babel" data-presets="react">
${screensJsx}

(function () {
  const params = new URLSearchParams(location.search);
  const cap = params.get("capture");
  if (location.hash.indexOf("figmacapture=") >= 0 || cap) {
    document.documentElement.classList.add("capture-mode");
  }
  const mount = document.getElementById("frame");
  const root = ReactDOM.createRoot(mount);
  if (!cap) {
    document.getElementById("dev").textContent = "缺少 ?capture=";
    root.render(React.createElement("div", { style: { padding: 24 } }, "Set ?capture=<screenId>"));
    return;
  }
  document.getElementById("dev").textContent = "capture=" + cap;
  const Screen = window.AllianceScreens.Screen;
  root.render(React.createElement(Screen, { id: cap }));
})();
</script>
</body>
</html>`;

fs.writeFileSync("d:/GANO小联盟/figma-capture.html", html, "utf8");
fs.writeFileSync("d:/GANO小联盟/alliance-screens-spec.jsx", screensJsx, "utf8");
console.log("wrote figma-capture.html from spec", html.length, "screensJsx", screensJsx.length);
