import fs from "fs";

const path = "d:/GANO小联盟/alliance-flow-A-storyboard-spec.html";
let s = fs.readFileSync(path, "utf8");

function mustReplace(from, to, label) {
  if (!s.includes(from)) throw new Error("NOT FOUND: " + label + "\n---\n" + from.slice(0, 200));
  s = s.replace(from, to);
}

// ===== Replace TicketNotch with real punch mask helpers =====
mustReplace(
  `function TicketNotch({ side = "left", bg = PAGE, y = "50%" }) {
  const style = side === "left"
    ? { position: "absolute", left: -6, top: y, marginTop: -6, width: 12, height: 12, borderRadius: 6, background: bg }
    : { position: "absolute", right: -6, top: y, marginTop: -6, width: 12, height: 12, borderRadius: 6, background: bg };
  return <div style={style} />;
}

function ShopHeroStrip() {
  return (
    <div style={{ height: 120, background: LINE, display: "flex", gap: 2, overflow: "hidden" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ flex: 1, background: LINE, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="9" cy="10" r="1.6" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M3 16l5-4 4 3 3-2 6 4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ))}
    </div>
  );
}`,
  `/** True side punch (mask = boolean subtract of half-circles). */
function punchSideMask(y = "50%", r = 6) {
  const hole = (pos) => \`radial-gradient(circle \${r}px at \${pos} \${y}, #0000 \${r - 0.5}px, #000 \${r}px)\`;
  return {
    WebkitMaskImage: \`\${hole("0%")}, \${hole("100%")}\`,
    WebkitMaskComposite: "source-in",
    maskImage: \`\${hole("0%")}, \${hole("100%")}\`,
    maskComposite: "intersect",
  };
}

/** True vertical punch (DealCoupon left/right column divider). */
function punchVerticalMask(x = 86, r = 6) {
  const hole = (pos) => \`radial-gradient(circle \${r}px at \${x}px \${pos}, #0000 \${r - 0.5}px, #000 \${r}px)\`;
  return {
    WebkitMaskImage: \`\${hole("0%")}, \${hole("100%")}\`,
    WebkitMaskComposite: "source-in",
    maskImage: \`\${hole("0%")}, \${hole("100%")}\`,
    maskComposite: "intersect",
  };
}

/** Keep dashed line only — notches come from parent mask. */
function TicketPerforation({ inset = 16, color = "#E0E0E0" }) {
  return (
    <div style={{ position: "relative", height: 14, flexShrink: 0 }}>
      <div style={{ position: "absolute", left: inset, right: inset, top: 7, borderTop: \`1px dashed \${color}\` }} />
    </div>
  );
}

function ShopHeroStrip({ height = 120 }) {
  return (
    <div style={{ height, background: LINE, display: "flex", gap: 2, overflow: "hidden" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ flex: 1, background: i === 1 ? "#E8E8E8" : LINE, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="9" cy="10" r="1.6" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M3 16l5-4 4 3 3-2 6 4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ))}
    </div>
  );
}

/** Dianping-style service summary hero (09). */
function ServiceHero({ title = "日本玫丽盼全球化护理一次", price = "480", shop = "凯德晶萃店", tag }) {
  return (
    <div style={{ position: "relative" }}>
      <ShopHeroStrip height={132} />
      <Lift style={{ margin: "-28px 16px 0" }}>
        <div style={{ background: PAPER, borderRadius: CARD_R, border: CARD_EDGE, padding: 14, display: "flex", gap: 12 }}>
          <ImgPlaceholder size={72} radius={8} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: INK, lineHeight: "22px" }}>{title}</div>
            <div style={{ marginTop: 6, display: "flex", alignItems: "baseline" }}>
              <span style={{ color: ORANGE, fontSize: 12 }}>¥</span>
              <span style={{ color: ORANGE, fontSize: 20, fontWeight: 700, marginLeft: 2 }}>{price}</span>
              <span style={{ marginLeft: 8, fontSize: 12, color: MUTED }}>{shop}</span>
            </div>
            {tag ? <div style={{ marginTop: 8 }}><span style={{ background: CHIP, color: ORANGE, fontSize: 11, padding: "2px 8px", borderRadius: 4 }}>{tag}</span></div> : null}
          </div>
        </div>
      </Lift>
    </div>
  );
}

/** Dianping-style stats hero (10). */
function StatsHero() {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ borderRadius: CARD_R, overflow: "hidden", background: "linear-gradient(135deg, #FFF1E8 0%, #FFE4D2 55%, #F7F7F7 100%)", border: CARD_EDGE, padding: "18px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, color: "#B86A3C" }}>联盟两边账</div>
            <div style={{ marginTop: 4, fontSize: 20, fontWeight: 600, color: INK, lineHeight: "28px" }}>西岸中环店</div>
          </div>
          <HelpIcon size={18} />
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
          {[
            ["本店发出", "9"],
            ["已核销", "4"],
            ["对方发来", "4"],
          ].map(([label, num]) => (
            <div key={label} style={{ flex: 1, background: "rgba(255,255,255,0.72)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: ORANGE, lineHeight: "24px" }}>{num}</div>
              <div style={{ marginTop: 2, fontSize: 11, color: MUTED }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`,
  "punch+heroes"
);

// ===== Enter: Dianping shop hero =====
mustReplace(
  `function Enter() {
  return (
    <Shell tab="获客" bg={PAGE}>
      <div style={{ height: "100%", boxSizing: "border-box", padding: 16, background: PAGE, overflowY: "auto" }}>
        <div style={{ fontSize: 12, lineHeight: "18px", color: MUTED }}>获客</div>
        <div style={{ marginTop: 4, fontSize: 20, fontWeight: 600, lineHeight: "28px", color: INK }}>这次合作</div>
        <div style={{ marginTop: 2, fontSize: 12, lineHeight: "18px", color: MUTED }}>林夏 · 西岸中环店</div>
        <Lift style={{ marginTop: 16 }}>
        <div style={{ background: PAPER, borderRadius: CARD_R, border: CARD_EDGE, padding: 16, display: "flex", overflow: "hidden" }}>
          <ImgPlaceholder size={96} radius={8} />
          <div style={{ marginLeft: 12, flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 600, lineHeight: "24px", color: INK }}>GANO HAIR</div>
            <RatingRow score={4.8} reviews="128条" category="美发" compact />
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span style={{ background: CHIP, color: ORANGE, fontSize: 11, lineHeight: "18px", padding: "2px 6px", borderRadius: 4 }}>9 家适用</span>
              <span style={{ background: CHIP, color: ORANGE, fontSize: 11, lineHeight: "18px", padding: "2px 6px", borderRadius: 4 }}>上海 · 苏州</span>
            </div>
          </div>
        </div>
        </Lift>
        <Lift style={{ marginTop: 8 }}>
        <div style={{ background: PAPER, borderRadius: CARD_R, border: CARD_EDGE, padding: "14px 16px", display: "flex", alignItems: "center", overflow: "hidden" }}>
          <ImgPlaceholder size={56} radius={8} />
          <div style={{ marginLeft: 10, flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: INK, lineHeight: "20px" }}>玫丽盼护理体验</div>
            <div style={{ marginTop: 4, display: "flex", alignItems: "baseline" }}>
              <span style={{ color: ORANGE, fontSize: 12 }}>¥</span>
              <span style={{ color: ORANGE, fontSize: 18, fontWeight: 700, marginLeft: 2 }}>480</span>
              <span style={{ marginLeft: 4, fontSize: 12, color: MUTED }}>起</span>
            </div>
          </div>
          <span style={{ fontSize: 13, color: ORANGE, fontWeight: 500, flexShrink: 0 }}>去发券</span>
        </div>
        </Lift>
      </div>
    </Shell>
  );
}`,
  `function Enter() {
  return (
    <Shell tab="获客" bg={PAGE}>
      <div style={{ height: "100%", background: PAGE, overflowY: "auto" }}>
        <div style={{ padding: "12px 16px 0" }}>
          <div style={{ fontSize: 12, lineHeight: "18px", color: MUTED }}>获客</div>
          <div style={{ marginTop: 4, fontSize: 20, fontWeight: 600, lineHeight: "28px", color: INK }}>这次合作</div>
          <div style={{ marginTop: 2, fontSize: 12, lineHeight: "18px", color: MUTED }}>林夏 · 西岸中环店</div>
        </div>
        <div style={{ marginTop: 12 }}>
          <ShopHeroStrip height={140} />
          <Lift style={{ margin: "-24px 16px 0" }}>
            <div style={{ background: PAPER, borderRadius: CARD_R, border: CARD_EDGE, padding: 16 }}>
              <div style={{ display: "flex" }}>
                <ImgPlaceholder size={72} radius={8} />
                <div style={{ marginLeft: 12, flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 600, lineHeight: "24px", color: INK }}>GANO HAIR</div>
                  <RatingRow score={4.8} reviews="128条" category="美发" compact />
                  <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ background: CHIP, color: ORANGE, fontSize: 11, lineHeight: "18px", padding: "2px 6px", borderRadius: 4 }}>9 家适用</span>
                    <span style={{ background: CHIP, color: ORANGE, fontSize: 11, lineHeight: "18px", padding: "2px 6px", borderRadius: 4 }}>上海 · 苏州</span>
                  </div>
                </div>
              </div>
            </div>
          </Lift>
        </div>
        <div style={{ padding: "8px 16px 16px" }}>
          <Lift>
            <div style={{ background: PAPER, borderRadius: CARD_R, border: CARD_EDGE, padding: "14px 16px", display: "flex", alignItems: "center" }}>
              <ImgPlaceholder size={56} radius={8} />
              <div style={{ marginLeft: 10, flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: INK, lineHeight: "20px" }}>玫丽盼护理体验</div>
                <div style={{ marginTop: 4, display: "flex", alignItems: "baseline" }}>
                  <span style={{ color: ORANGE, fontSize: 12 }}>¥</span>
                  <span style={{ color: ORANGE, fontSize: 18, fontWeight: 700, marginLeft: 2 }}>480</span>
                  <span style={{ marginLeft: 4, fontSize: 12, color: MUTED }}>起</span>
                </div>
              </div>
              <span style={{ fontSize: 13, color: ORANGE, fontWeight: 500, flexShrink: 0 }}>去发券</span>
            </div>
          </Lift>
        </div>
      </div>
    </Shell>
  );
}`,
  "Enter hero"
);

// ===== TierCoupon punch =====
mustReplace(
  `function TierCoupon({ title, chip, lines, note, left, total }) {
  const pct = Math.round((left / total) * 100);
  return (
    <Lift kind="coupon" style={{ marginTop: 12 }}>
    <div style={{ position: "relative", background: PAPER, borderRadius: CARD_R, border: CARD_EDGE, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: INK }}>{title}</span>
          {chip ? <span style={{ background: CHIP, color: ORANGE, fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>{chip}</span> : null}
        </div>
        {lines.map(([price, name], idx) => (
          <div key={name} style={{ display: "flex", alignItems: "baseline", marginTop: idx ? 10 : 12 }}>
            <span style={{ color: ORANGE, flexShrink: 0, display: "flex", alignItems: "baseline" }}>
              <span style={{ fontSize: 12, marginRight: 2 }}>¥</span>
              <span style={{ fontSize: 24, fontWeight: 700, lineHeight: "28px" }}>{price}</span>
            </span>
            <span style={{ marginLeft: 10, fontSize: 13, color: INK, lineHeight: "20px" }}>{name}</span>
          </div>
        ))}
        {note ? <div style={{ fontSize: 12, color: MUTED, marginTop: 10, lineHeight: "18px" }}>{note}</div> : null}
      </div>
      <div style={{ position: "relative", height: 14, background: PAPER }}>
        <TicketNotch side="left" y="50%" />
        <TicketNotch side="right" y="50%" />
        <div style={{ position: "absolute", left: 16, right: 16, top: 7, borderTop: "1px dashed #E0E0E0" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", padding: "8px 16px 14px", gap: 10 }}>
        <div style={{ flex: 1, height: 8, borderRadius: 4, background: LINE, overflow: "hidden" }}>
          <div style={{ width: pct + "%", height: "100%", background: left === 0 ? MUTED : ORANGE, borderRadius: 4 }} />
        </div>
        <span style={{ fontSize: 11, color: left === 0 ? MUTED : ORANGE, flexShrink: 0, fontWeight: 500 }}>剩余 {left}/{total}</span>
      </div>
    </div>
    </Lift>
  );
}`,
  `function TierCoupon({ title, chip, lines, note, left, total }) {
  const pct = Math.round((left / total) * 100);
  return (
    <Lift kind="coupon" style={{ marginTop: 12 }}>
    <div style={{ position: "relative", background: PAPER, borderRadius: CARD_R, border: CARD_EDGE, ...punchSideMask("58%") }}>
      <div style={{ padding: "14px 16px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: INK }}>{title}</span>
          {chip ? <span style={{ background: CHIP, color: ORANGE, fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 500 }}>{chip}</span> : null}
        </div>
        {lines.map(([price, name], idx) => (
          <div key={name} style={{ display: "flex", alignItems: "baseline", marginTop: idx ? 10 : 12 }}>
            <span style={{ color: ORANGE, flexShrink: 0, display: "flex", alignItems: "baseline" }}>
              <span style={{ fontSize: 12, marginRight: 2 }}>¥</span>
              <span style={{ fontSize: 24, fontWeight: 700, lineHeight: "28px" }}>{price}</span>
            </span>
            <span style={{ marginLeft: 10, fontSize: 13, color: INK, lineHeight: "20px" }}>{name}</span>
          </div>
        ))}
        {note ? <div style={{ fontSize: 12, color: MUTED, marginTop: 10, lineHeight: "18px" }}>{note}</div> : null}
      </div>
      <TicketPerforation />
      <div style={{ display: "flex", alignItems: "center", padding: "8px 16px 14px", gap: 10 }}>
        <div style={{ flex: 1, height: 8, borderRadius: 4, background: LINE, overflow: "hidden" }}>
          <div style={{ width: pct + "%", height: "100%", background: left === 0 ? MUTED : ORANGE, borderRadius: 4 }} />
        </div>
        <span style={{ fontSize: 11, color: left === 0 ? MUTED : ORANGE, flexShrink: 0, fontWeight: 500 }}>剩余 {left}/{total}</span>
      </div>
    </div>
    </Lift>
  );
}`,
  "TierCoupon punch"
);

fs.writeFileSync(path, s);
console.log("pass1 ok, TicketNotch left?", s.includes("function TicketNotch"), "punchSide?", s.includes("punchSideMask"));
