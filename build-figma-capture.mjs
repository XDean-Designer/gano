import fs from "fs";
import { execSync } from "child_process";

execSync("node extract-screens.mjs", { cwd: "d:/GANO小联盟", stdio: "inherit" });
const screensJsx = fs.readFileSync("d:/GANO小联盟/alliance-screens.jsx", "utf8");

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>GANO 联盟 · Figma Capture</title>
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
  /* dormant overlays: none of our screens use parked translate sheets, but keep rule */
  .capture-mode .mask:not(.show),
  .capture-mode .sheet:not(.show),
  .capture-mode .dialog:not(.show){display:none !important}
  #frame{
    width:390px;
    height:844px;
    overflow:hidden;
    background:#FFFFFF;
    font-family:"Noto Sans SC","Source Han Sans SC",sans-serif;
    color:#111111;
  }
  .dev-chrome{padding:8px 12px;font-size:12px;color:#666;border-bottom:1px solid #eee}
</style>
</head>
<body>
<div class="dev-chrome" id="dev">Figma capture</div>
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
console.log("wrote figma-capture.html", html.length);
