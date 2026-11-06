import fs from "fs";

const path = "d:/GANO小联盟/alliance-flow-A-storyboard-spec.html";
let s = fs.readFileSync(path, "utf8");

function mustReplace(from, to, label) {
  if (!s.includes(from)) throw new Error("NOT FOUND: " + label + "\n---\n" + from.slice(0, 220));
  s = s.replace(from, to);
}

// Remove any leftover TicketNotch usages by replacing common patterns — StaffCode
mustReplace(
  `        <div style={{ background: PAPER, borderRadius: CARD_R, border: CARD_EDGE, overflow: "hidden" }}>
          <div style={{ background: "#F3E4D6", padding: "20px 16px 16px" }}>
            <div style={{ fontSize: 11, letterSpacing: 1, color: "#8A6A52" }}>GANO HAIR · 联盟礼遇</div>
            <div style={{ marginTop: 8, fontSize: 20, fontWeight: 600, color: "#3A2A22", lineHeight: "28px" }}>丽妍雅集会员专属</div>
            <div style={{ marginTop: 6, fontSize: 12, lineHeight: "18px", color: "#6B5344" }}>一次护理体验 · 到店凭券核销</div>
          </div>
          <div style={{ position: "relative", height: 14, background: PAPER }}>
            <TicketNotch side="left" />
            <TicketNotch side="right" />
            <div style={{ position: "absolute", left: 16, right: 16, top: 7, borderTop: "1px dashed #E0E0E0" }} />
          </div>`,
  `        <div style={{ background: PAPER, borderRadius: CARD_R, border: CARD_EDGE, ...punchSideMask("38%") }}>
          <div style={{ background: "#F3E4D6", padding: "20px 16px 16px" }}>
            <div style={{ fontSize: 11, letterSpacing: 1, color: "#8A6A52" }}>GANO HAIR · 联盟礼遇</div>
            <div style={{ marginTop: 8, fontSize: 20, fontWeight: 600, color: "#3A2A22", lineHeight: "28px" }}>丽妍雅集会员专属</div>
            <div style={{ marginTop: 6, fontSize: 12, lineHeight: "18px", color: "#6B5344" }}>一次护理体验 · 到店凭券核销</div>
          </div>
          <TicketPerforation />`,
  "StaffCode punch"
);

// AllianceDrop
mustReplace(
  `    <div style={{ position: "relative", background: CHIP, borderRadius: CARD_R, border: CARD_EDGE, overflow: "hidden" }}>
      <AllianceMark />
      <div style={{ padding: "22px 16px 0", textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: 0.5, color: ORANGE }}>丽妍雅集会员专属礼遇</div>
        <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", justifyContent: "center", color: ORANGE }}>
          <span style={{ fontSize: 14, fontWeight: 500, marginRight: 4 }}>¥</span>
          <span style={{ fontSize: 40, fontWeight: 700, lineHeight: "44px" }}>480</span>
        </div>
        <div style={{ marginTop: 4, fontSize: 15, fontWeight: 600, color: INK }}>日本玫丽盼全球化护理一次</div>
        <div style={{ marginTop: 4, fontSize: 12, color: MUTED }}>9店通用 · 到店核销</div>
      </div>
      <div style={{ position: "relative", height: 14, marginTop: 12 }}>
        <TicketNotch side="left" bg={PAPER} />
        <TicketNotch side="right" bg={PAPER} />
        <div style={{ position: "absolute", left: 16, right: 16, top: 7, borderTop: "1px dashed rgba(255,96,2,0.28)" }} />
      </div>`,
  `    <div style={{ position: "relative", background: CHIP, borderRadius: CARD_R, border: CARD_EDGE, ...punchSideMask("62%") }}>
      <AllianceMark />
      <div style={{ padding: "22px 16px 0", textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: 0.5, color: ORANGE }}>丽妍雅集会员专属礼遇</div>
        <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", justifyContent: "center", color: ORANGE }}>
          <span style={{ fontSize: 14, fontWeight: 500, marginRight: 4 }}>¥</span>
          <span style={{ fontSize: 40, fontWeight: 700, lineHeight: "44px" }}>480</span>
        </div>
        <div style={{ marginTop: 4, fontSize: 15, fontWeight: 600, color: INK }}>日本玫丽盼全球化护理一次</div>
        <div style={{ marginTop: 4, fontSize: 12, color: MUTED }}>9店通用 · 到店核销</div>
      </div>
      <div style={{ marginTop: 12 }}>
        <TicketPerforation color="rgba(255,96,2,0.28)" />
      </div>`,
  "AllianceDrop punch"
);

// DealCoupon — vertical punch, remove fake circles
mustReplace(
  `function DealCoupon({ title, price, meta = [], action = "立即使用", disabled = false }) {
  return (
    <Lift kind="coupon" style={{ marginTop: 12 }}>
    <div style={{ position: "relative", background: disabled ? LINE : CHIP, borderRadius: CARD_R, border: CARD_EDGE, overflow: "hidden" }}>
      <AllianceMark muted={disabled} />
      <div style={{ display: "flex", alignItems: "center", minHeight: 100, paddingTop: 6 }}>
        <div style={{ width: 92, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "18px 6px 16px" }}>
          <div style={{ display: "flex", alignItems: "baseline", color: disabled ? MUTED : ORANGE }}>
            <span style={{ fontSize: 12, marginRight: 2 }}>¥</span>
            <span style={{ fontSize: 28, fontWeight: 700, lineHeight: "32px" }}>{price}</span>
          </div>
          <div style={{ marginTop: 2, fontSize: 11, color: disabled ? MUTED : ORANGE }}>会员礼遇</div>
        </div>
        <div style={{ position: "relative", alignSelf: "stretch", width: 0, margin: "10px 0" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, borderLeft: "1px dashed rgba(0,0,0,0.12)" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0, padding: "18px 12px 16px 14px", display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: disabled ? MUTED : INK, lineHeight: "20px" }}>{title}</div>
            {meta.map((line) => (
              <div key={line} style={{ marginTop: 4, fontSize: 11, color: MUTED, lineHeight: "16px" }}>{line}</div>
            ))}
          </div>
          {action ? (
            <span style={{ marginLeft: 8, flexShrink: 0, height: 28, padding: "0 10px", borderRadius: 14, background: disabled ? MUTED : ORANGE, color: "#FFFFFF", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center" }}>{action}</span>
          ) : null}
        </div>
      </div>
      <div style={{ position: "absolute", left: 86, top: -6, width: 12, height: 12, borderRadius: 6, background: PAPER }} />
      <div style={{ position: "absolute", left: 86, bottom: -6, width: 12, height: 12, borderRadius: 6, background: PAPER }} />
    </div>
    </Lift>
  );
}`,
  `function DealCoupon({ title, price, meta = [], action = "立即使用", disabled = false }) {
  return (
    <Lift kind="coupon" style={{ marginTop: 12 }}>
    <div style={{ position: "relative", background: disabled ? LINE : CHIP, borderRadius: CARD_R, border: CARD_EDGE, ...punchVerticalMask(86, 6) }}>
      <AllianceMark muted={disabled} />
      <div style={{ display: "flex", alignItems: "center", minHeight: 100, paddingTop: 6 }}>
        <div style={{ width: 92, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "18px 6px 16px" }}>
          <div style={{ display: "flex", alignItems: "baseline", color: disabled ? MUTED : ORANGE }}>
            <span style={{ fontSize: 12, marginRight: 2 }}>¥</span>
            <span style={{ fontSize: 28, fontWeight: 700, lineHeight: "32px" }}>{price}</span>
          </div>
          <div style={{ marginTop: 2, fontSize: 11, color: disabled ? MUTED : ORANGE }}>会员礼遇</div>
        </div>
        <div style={{ position: "relative", alignSelf: "stretch", width: 0, margin: "10px 0" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, borderLeft: "1px dashed rgba(0,0,0,0.12)" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0, padding: "18px 12px 16px 14px", display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: disabled ? MUTED : INK, lineHeight: "20px" }}>{title}</div>
            {meta.map((line) => (
              <div key={line} style={{ marginTop: 4, fontSize: 11, color: MUTED, lineHeight: "16px" }}>{line}</div>
            ))}
          </div>
          {action ? (
            <span style={{ marginLeft: 8, flexShrink: 0, height: 28, padding: "0 10px", borderRadius: 14, background: disabled ? MUTED : ORANGE, color: "#FFFFFF", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center" }}>{action}</span>
          ) : null}
        </div>
      </div>
    </div>
    </Lift>
  );
}`,
  "DealCoupon punch"
);

// MqCoupon
mustReplace(
  `    <div style={{ position: "relative", background: PAPER, borderRadius: CARD_R, border: CARD_EDGE, overflow: "hidden" }}>
      <AllianceMark muted={!!disabled} />
      <div style={{ display: "flex", padding: "22px 12px 10px 0" }}>
        <div style={{ width: 92, flexShrink: 0, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", color: disabled ? MUTED : ORANGE }}>
            <span style={{ fontSize: 13, marginRight: 2 }}>¥</span>
            <span style={{ fontSize: 30, fontWeight: 700, lineHeight: "36px" }}>480</span>
          </div>
          <div style={{ fontSize: 11, color: disabled ? MUTED : ORANGE }}>会员礼遇</div>
        </div>
        <div style={{ flex: 1, minWidth: 0, paddingTop: 4, paddingRight: 12, borderLeft: "1px dashed rgba(0,0,0,0.12)", paddingLeft: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", color: disabled ? MUTED : INK }}>日本玫丽盼全球化护理一次</div>
          <div style={{ marginTop: 6, fontSize: 12, lineHeight: "18px", color: disabled ? MUTED : ORANGE }}>{expire}</div>
        </div>
      </div>
      <div style={{ position: "relative", height: 12 }}>
        <TicketNotch side="left" />
        <TicketNotch side="right" />
        <div style={{ position: "absolute", left: 12, right: 12, top: 6, borderTop: "1px dashed rgba(0,0,0,0.12)" }} />
      </div>`,
  `    <div style={{ position: "relative", background: PAPER, borderRadius: CARD_R, border: CARD_EDGE, ...punchSideMask("55%") }}>
      <AllianceMark muted={!!disabled} />
      <div style={{ display: "flex", padding: "22px 12px 10px 0" }}>
        <div style={{ width: 92, flexShrink: 0, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", color: disabled ? MUTED : ORANGE }}>
            <span style={{ fontSize: 13, marginRight: 2 }}>¥</span>
            <span style={{ fontSize: 30, fontWeight: 700, lineHeight: "36px" }}>480</span>
          </div>
          <div style={{ fontSize: 11, color: disabled ? MUTED : ORANGE }}>会员礼遇</div>
        </div>
        <div style={{ flex: 1, minWidth: 0, paddingTop: 4, paddingRight: 12, borderLeft: "1px dashed rgba(0,0,0,0.12)", paddingLeft: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 500, lineHeight: "20px", color: disabled ? MUTED : INK }}>日本玫丽盼全球化护理一次</div>
          <div style={{ marginTop: 6, fontSize: 12, lineHeight: "18px", color: disabled ? MUTED : ORANGE }}>{expire}</div>
        </div>
      </div>
      <TicketPerforation inset={12} color="rgba(0,0,0,0.12)" />`,
  "MqCoupon punch"
);

// CouponSheet big ticket — punch on outer card
mustReplace(
  `        <Lift kind="coupon" style={{ margin: 16 }}>
        <div style={{ background: PAPER, borderRadius: CARD_R, border: CARD_EDGE, overflow: "hidden" }}>
          <Poster />
          <div style={{ padding: "14px 16px 16px" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: INK, lineHeight: "22px" }}>日本玫丽盼全球化护理一次</div>`,
  `        <Lift kind="coupon" style={{ margin: 16 }}>
        <div style={{ background: PAPER, borderRadius: CARD_R, border: CARD_EDGE, ...punchSideMask("52%") }}>
          <Poster />
          <div style={{ padding: "14px 16px 16px" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: INK, lineHeight: "22px" }}>日本玫丽盼全球化护理一次</div>`,
  "CouponSheet punch open"
);

mustReplace(
  `            <div style={{ position: "relative", height: 14, margin: "12px -16px 0" }}>
              <TicketNotch side="left" />
              <TicketNotch side="right" />
              <div style={{ position: "absolute", left: 16, right: 16, top: 7, borderTop: "1px dashed #E0E0E0" }} />
            </div>
            <div
              onClick={(event) => { event.stopPropagation(); setZoom(true); }}
              style={{ marginTop: 12, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
            >`,
  `            <div style={{ margin: "12px -16px 0" }}>
              <TicketPerforation />
            </div>
            <div
              onClick={(event) => { event.stopPropagation(); setZoom(true); }}
              style={{ marginTop: 12, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
            >`,
  "CouponSheet perforation"
);

// Review with ServiceHero
mustReplace(
  `function Review() {
  return (
    <Shell tab="获客" bg={PAGE}>
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: "scroll", scrollbarWidth: "thin" }}>
          <Lift style={{ margin: 16 }}>
          <div style={{ background: PAPER, borderRadius: CARD_R, border: CARD_EDGE, padding: 16 }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: INK }}>这次服务</div>
            <div style={{ marginTop: 6, fontSize: 13, color: MUTED }}>日本玫丽盼全球化护理一次</div>
            <div style={{ marginTop: 16, fontSize: 13, color: "#333333" }}>备注</div>`,
  `function Review() {
  return (
    <Shell tab="获客" bg={PAGE}>
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: "scroll", scrollbarWidth: "thin" }}>
          <ServiceHero tag="待评价" />
          <Lift style={{ margin: "12px 16px 16px" }}>
          <div style={{ background: PAPER, borderRadius: CARD_R, border: CARD_EDGE, padding: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: INK }}>这次服务</div>
            <div style={{ marginTop: 6, fontSize: 13, color: MUTED }}>填写备注与评价，回写到丽妍雅集</div>
            <div style={{ marginTop: 16, fontSize: 13, color: "#333333" }}>备注</div>`,
  "Review hero"
);

// Feedback
mustReplace(
  `function Feedback() {
  return (
    <Shell tab="获客" bg={PAGE}>
      <div style={{ padding: 16 }}>
        <div style={{ color: INK, fontSize: 20, fontWeight: 600 }}>GANO回写</div>
        <div style={{ color: MUTED, fontSize: 12, marginTop: 4 }}>西岸中环店 · 林夏</div>
        <Lift style={{ marginTop: 8 }}>
        <div style={{ background: PAPER, borderRadius: CARD_R, border: CARD_EDGE, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: INK, fontSize: 13, fontWeight: 600 }}>凯德晶萃店</span>
            <span style={{ color: MUTED, fontSize: 12 }}>刚做完</span>
          </div>
          <div style={{ color: INK, fontSize: 15, fontWeight: 600, marginTop: 8 }}>日本玫丽盼全球化护理一次</div>
          <div style={{ color: ORANGE, fontSize: 13, fontWeight: 600, marginTop: 4 }}>¥480</div>
          <div style={{ color: "#333333", fontSize: 13, lineHeight: "20px", marginTop: 8 }}>头皮敏感，手法放轻了</div>
          <div style={{ marginTop: 8 }}>
            <span style={{ background: CHIP, color: ORANGE, fontSize: 12, padding: "2px 8px", borderRadius: 4 }}>满意</span>
          </div>
        </div>
        </Lift>
      </div>
    </Shell>
  );
}`,
  `function Feedback() {
  return (
    <Shell tab="获客" bg={PAGE}>
      <div style={{ height: "100%", overflowY: "auto", background: PAGE }}>
        <div style={{ padding: "12px 16px 0" }}>
          <div style={{ color: INK, fontSize: 20, fontWeight: 600 }}>GANO回写</div>
          <div style={{ color: MUTED, fontSize: 12, marginTop: 4 }}>西岸中环店 · 林夏</div>
        </div>
        <div style={{ marginTop: 12 }}>
          <ServiceHero tag="满意" />
        </div>
        <div style={{ padding: "12px 16px 16px" }}>
          <Lift>
            <div style={{ background: PAPER, borderRadius: CARD_R, border: CARD_EDGE, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: INK, fontSize: 13, fontWeight: 600 }}>凯德晶萃店</span>
                <span style={{ color: MUTED, fontSize: 12 }}>刚做完</span>
              </div>
              <div style={{ color: "#333333", fontSize: 13, lineHeight: "20px", marginTop: 10 }}>头皮敏感，手法放轻了</div>
              <div style={{ marginTop: 10, fontSize: 12, color: MUTED }}>已同步到丽妍雅集获客记录</div>
            </div>
          </Lift>
        </div>
      </div>
    </Shell>
  );
}`,
  "Feedback hero"
);

// Manual
mustReplace(
  `function Manual() {
  return (
    <Shell tab="获客" bg={PAGE}>
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: INK }}>未进系统</div>
        <div style={{ marginTop: 8, fontSize: 13, lineHeight: "20px", color: MUTED }}>过期券不核销。若仍接待，只记在店里。</div>
        <Lift style={{ marginTop: 12 }}>
        <div style={{ background: PAPER, borderRadius: CARD_R, border: CARD_EDGE, borderTop: "1px dashed #DDDDDD", padding: "14px 12px" }}>`,
  `function Manual() {
  return (
    <Shell tab="获客" bg={PAGE}>
      <div style={{ height: "100%", overflowY: "auto", background: PAGE }}>
        <div style={{ padding: "12px 16px 0" }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: INK }}>未进系统</div>
          <div style={{ marginTop: 8, fontSize: 13, lineHeight: "20px", color: MUTED }}>过期券不核销。若仍接待，只记在店里。</div>
        </div>
        <div style={{ marginTop: 12 }}>
          <ServiceHero tag="系统未核销" />
        </div>
        <div style={{ padding: "12px 16px 16px" }}>
        <Lift>
        <div style={{ background: PAPER, borderRadius: CARD_R, border: CARD_EDGE, padding: "14px 12px" }}>`,
  "Manual hero open"
);

mustReplace(
  `            <span style={{ flex: 1, fontSize: 13, color: ORANGE }}>系统未核销</span>
          </div>
        </div>
        </Lift>
        <div style={{ marginTop: 12, fontSize: 12, color: MUTED }}>丽妍雅集收不到这条。</div>
      </div>
    </Shell>
  );
}

function TiersEmpty`,
  `            <span style={{ flex: 1, fontSize: 13, color: ORANGE }}>系统未核销</span>
          </div>
        </div>
        </Lift>
        <div style={{ marginTop: 12, fontSize: 12, color: MUTED }}>丽妍雅集收不到这条。</div>
        </div>
      </div>
    </Shell>
  );
}

function TiersEmpty`,
  "Manual hero close"
);

// Stats hero
mustReplace(
  `  return (
    <Shell tab="获客" bg={PAGE}>
      <div style={{ height: "100%", overflowY: "scroll", scrollbarWidth: "thin", padding: 16, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 20, fontWeight: 600, color: INK }}>数据</span>
          <HelpIcon size={18} />
        </div>
        <div style={{ marginTop: 2, fontSize: 12, color: MUTED }}>西岸中环店</div>
        <Lift style={{ marginTop: 12 }}>`,
  `  return (
    <Shell tab="获客" bg={PAGE}>
      <div style={{ height: "100%", overflowY: "scroll", scrollbarWidth: "thin", padding: 16, boxSizing: "border-box" }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: INK }}>数据</div>
        <div style={{ marginTop: 12 }}><StatsHero /></div>
        <Lift style={{ marginTop: 12 }}>`,
  "Stats hero"
);

// StaffCodeV35 leftover TicketNotch if any
if (s.includes("TicketNotch")) {
  // Replace remaining TicketNotch blocks generically
  s = s.replace(
    /<div style=\{\{ position: "relative", height: 14(?:, background: PAPER)? \}\}>\s*<TicketNotch side="left"[^/]*\/>\s*<TicketNotch side="right"[^/]*\/>\s*<div style=\{\{ position: "absolute", left: 16, right: 16, top: 7, borderTop: "1px dashed #E0E0E0" \}\} \/>\s*<\/div>/g,
    `<TicketPerforation />`
  );
  s = s.replace(
    /<div style=\{\{ position: "relative", height: 14(?:, marginTop: 12)? \}\}>\s*<TicketNotch[\s\S]*?<\/div>/g,
    `<TicketPerforation />`
  );
  s = s.replace(
    /<div style=\{\{ position: "relative", height: 14, margin: "12px -16px 0" \}\}>\s*<TicketNotch[\s\S]*?<\/div>/g,
    `<div style={{ margin: "12px -16px 0" }}><TicketPerforation /></div>`
  );
}

const leftover = (s.match(/TicketNotch/g) || []).length;
fs.writeFileSync(path, s);
console.log("pass2 done, TicketNotch leftover=", leftover);
console.log("ServiceHero", s.includes("function ServiceHero"), "StatsHero", s.includes("function StatsHero"));
