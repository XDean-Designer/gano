/**
 * Extract phone Screen components from canvas.tsx into browser-runnable JSX.
 */
import fs from "fs";

const src = fs.readFileSync("d:/GANO小联盟/gano-rubis-alliance-flow.canvas.tsx", "utf8");

const orangeBlock = src.match(/const ORANGE[\s\S]*?const UI_FONT = [^;]+;/)[0];
const screenFn = src.slice(src.indexOf("function Screen("), src.indexOf("function Shell("));
const shellStart = src.indexOf("function Shell(");
const afterScreens = src.indexOf("const OPEN_QR");
const screensBlock = src.slice(shellStart, afterScreens);
const qrBlock = src.slice(src.indexOf("const OPEN_QR"));

let out = `/* auto-generated from gano-rubis-alliance-flow.canvas.tsx — do not edit by hand */
const { useState } = React;

${orangeBlock}

${screenFn}
${screensBlock}
${qrBlock}
`;

// Strip TypeScript annotations Babel standalone may choke on
out = out
  .replace(/: Parameters<typeof Stack>\[[^\]]+\]\["children"\]/g, "")
  .replace(/: \{[^}]*Parameters[^}]*\}/g, "")
  .replace(/function Screen\(\{ id \}: \{ id: string \}\)/g, "function Screen({ id })")
  .replace(/function Shell\(\{[\s\S]*?\}\) \{/, "function Shell({ children, tab, bg = PAGE }) {")
  .replace(/function TabBar\(\{ active \}: \{ active: "[^"]+" \| "[^"]+" \}\)/g, "function TabBar({ active })")
  .replace(/function TierCoupon\(\{[\s\S]*?total,\n\}: \{[\s\S]*?total: number;\n\}\)/g, "function TierCoupon({ title, chip, lines, note, left, total })")
  .replace(/function ShopTabs\(\{ active \}: \{ active: "[^"]+" \| "[^"]+" \}\)/g, "function ShopTabs({ active })")
  .replace(/function SaleRow\(\{ name, price \}: \{ name: string; price: string \}\)/g, "function SaleRow({ name, price })")
  .replace(/function MqCoupon\(\{ disabled, expire, foot, reason \}: \{ disabled\?: boolean; expire: string; foot: string; reason\?: string \}\)/g, "function MqCoupon({ disabled, expire, foot, reason })")
  .replace(/function ResultSheet\(\{ title, children \}: \{ title: string; children[^}]*\}\)/g, "function ResultSheet({ title, children })")
  .replace(/function CouponSheet\(\{ success \}: \{ success: boolean \}\)/g, "function CouponSheet({ success })")
  .replace(/function FakeQr\(\{ size \}: \{ size: number \}\)/g, "function FakeQr({ size })")
  .replace(/const GANO_MENU: \[string, string\]\[\]/g, "const GANO_MENU")
  .replace(/const shops: \[string, string\]\[\]/g, "const shops")
  .replace(/\(event: \{ stopPropagation: \(\) => void \}\)/g, "(event)")
  .replace(/ as const/g, "")
  .replace(/imageRendering: "pixelated" as const/g, 'imageRendering: "pixelated"')
  .replace(/const funnel = \(items: \[string, number\]\[\]\) =>/g, "const funnel = (items) =>")
  .replace(/const review = \(title: string, line: string\) =>/g, "const review = (title, line) =>")
  .replace(/\?: "[^"]+" \| "[^"]+";/g, "")
  .replace(/\?: string;/g, "")
  .replace(/\?: boolean;/g, "")
  .replace(/children: Parameters[^;]+;/g, "")
  .replace(/^\s*children;\s*$/gm, "")
  .replace(/^\s*tab\?:.+$/gm, "")
  .replace(/^\s*bg\?:.+$/gm, "")
  .replace(/\n\}: \{\n\}\)/g, ")")
  .replace(/\n\}: \{\n  \}\)/g, ")");

// Fix any remaining `: { ... }` param type blocks after destructuring
out = out.replace(/\}\s*:\s*\{[\s\S]*?\}\)\s*\{/g, "}) {");

out += `
window.AllianceScreens = { Screen, DESIGN_W, DESIGN_H, SCALE, ORANGE };
`;

fs.writeFileSync("d:/GANO小联盟/alliance-screens.jsx", out, "utf8");

// sanity: leftover TS-ish
const leftover = [...out.matchAll(/: (string|number|boolean|\{)/g)].slice(0, 20).map((m) => m[0] + " @" + m.index);
console.log("wrote", out.length, "leftover samples", leftover);
