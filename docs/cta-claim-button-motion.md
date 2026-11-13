# 「立即领取」按钮提示动效 · 前端交付说明

| 项 | 内容 |
|----|------|
| 适用页面 | 04 GANO 店铺 · 联盟券卡 CTA「立即领取」 |
| 演示页 | [`cta-motion-options.html`](../cta-motion-options.html)（本地预览为准） |
| 设计稿 CTA | Figma `132:2488`，**294 × 40**，圆角 20 |
| 文档目的 | 让前端**像素级还原**梳条扫光 + 克制涟漪；不改领取链路 |

UI / 动效以演示页与本说明为准；像素样式不复述整张券面。

---

## 1. 目标与播放规则

**目标**：在未领取状态下，用克制、可持续循环的动效提示「这里可点」，不抢券面标题与价格注意力。

**播放时机**

| 状态 | 行为 |
|------|------|
| 券卡进入视口且未领取 | 开始播放（梳条 + 涟漪） |
| 券卡离开视口 | 暂停或停止 |
| 用户点击「立即领取」/ 已领取 | **立即停止**，不再循环 |
| `prefers-reduced-motion: reduce` | **关闭全部动效**，只显示静态按钮 |

动效为纯装饰，**不改变**按钮尺寸、点击热区、跳转（→ 06）。

---

## 2. 视觉结构（两层）

```
┌─ .cta-wrap（相对定位，与按钮同大）─────────────┐
│  · ripple ×2     ← 在按钮外缘扩散（可超出 wrap） │
│  ┌─ .cta（overflow:hidden）─────────────────┐  │
│  │  · .bar-sweep  ← 斜向梳条（被按钮裁切）   │  │
│  │  · .label      ← 「立即领取」文字最上层     │  │
│  └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

| 层 | 位置 | 作用 |
|----|------|------|
| 斜向梳条 | **按钮内部** | `#FF9602` / 40% 斜条铺满，持续向右平移 |
| 克制涟漪 | **按钮外部边缘** | 两道半透明橙环从边缘浅浅外扩后消隐 |
| 文案 | 按钮内最顶层 | 始终清晰可读，不被梳条盖住 |

---

## 3. 按钮本体（静态）

| 属性 | 值 |
|------|-----|
| 尺寸 | **294 × 40**（宽随卡内边距可 100%，高度固定 40） |
| 圆角 | **20**（胶囊） |
| 背景 | 线性渐变 `90deg`：`#FF7802` → `#FF6002` |
| 文字 | 「立即领取」`#FFFFFF`，15 / Medium(500)，字距约 0.6px |
| 裁切 | `overflow: hidden`（梳条被圆角裁切） |
| 层叠 | `isolation: isolate`；文字 `z-index` 高于梳条 |

---

## 4. 斜向梳条（核心参数）

### 4.1 图案

| 参数 | 值 | 说明 |
|------|-----|------|
| 条颜色 | `#FF9602` | |
| 不透明度 | **40%** | 即 `rgba(255, 150, 2, 0.4)` |
| 单条宽度 | **30px** | |
| 条间隙 | **30px**（透明） | |
| 重复周期 | **60px** | 条 + 隙，无缝循环位移量 |
| 倾斜 | **`skewX(-25deg)`** | 竖条整体左倾约 25° |
| 铺满方式 | `repeating-linear-gradient(90deg, …)` 再整体 skew | 条先竖直重复，再倾斜 |

渐变定义（倾斜前的竖直重复）：

```css
background: repeating-linear-gradient(
  90deg,
  rgba(255, 150, 2, 0.4) 0,
  rgba(255, 150, 2, 0.4) 30px,
  transparent 30px,
  transparent 60px
);
```

### 4.2 层几何

梳条层需**大于按钮**，避免倾斜后四角露白：

| 属性 | 建议值 |
|------|--------|
| 定位 | `position: absolute`；相对按钮 |
| 垂直 | `top: -40%`；`bottom: -40%` |
| 水平 | `left: -50%`；`width: 220%` |
| 指针 | `pointer-events: none` |
| z-index | 低于文字（如 1），文字为 3 |

### 4.3 运动（向右、无缝）

| 参数 | 值 |
|------|-----|
| 方向 | **向右** |
| 位移 | `translateX(0)` → `translateX(+60px)`（刚好一个周期） |
| 时长 | **2.0s** |
| 缓动 | **`linear`** |
| 循环 | **`infinite`** |
| 合成 | 每一帧保持 `skewX(-25deg)`，再叠加 `translateX` |

```css
@keyframes bars-right {
  from { transform: skewX(-25deg) translateX(0); }
  to   { transform: skewX(-25deg) translateX(60px); }
}
animation: bars-right 2s linear infinite;
```

**注意**：位移必须是 **±60px（或条+隙周期）**；改条宽/间隙时，关键帧位移必须同步改，否则会出现跳帧接缝。

---

## 5. 克制涟漪

### 5.1 形态

| 参数 | 值 |
|------|-----|
| 数量 | **2** 道，错峰播放 |
| 形状 | 与按钮同圆角的椭圆环（`border-radius: 999px`） |
| 边框 | `1.5px solid rgba(255, 96, 2, 0.62)` |
| 柔光 | `box-shadow: 0 0 8px rgba(255, 96, 2, 0.18)` |
| 定位 | 相对 `.cta-wrap` 居中：`left/top 50%` + `translate(-50%, -50%)` |
| 初始尺寸 | 宽高 = 按钮 100%（贴齐按钮边缘） |

**重要**：涟漪节点放在 **按钮外的 wrap** 上，不要放进 `overflow: hidden` 的按钮内，否则外扩会被裁掉。

### 5.2 时间轴（单道）

| 参数 | 值 |
|------|-----|
| 周期 | **2.6s** |
| 缓动 | `cubic-bezier(0.25, 0.6, 0.3, 1)` |
| 循环 | `infinite` |
| 第二道延迟 | **1.3s**（半周期错峰，任一时点大约只醒目一道） |

关键帧：

| 时间 | 宽 | 高 | opacity |
|------|----|----|---------|
| 0% | 100% | 100% | **0.55** |
| 35% | 100% + **12px** | 100% + **10px** | **0.38** |
| 85% | 100% + **16px** | 100% + **14px** | **0.05** |
| 100% | 100% + **16px** | 100% + **14px** | **0** |

幅度刻意克制：最大只比按钮大约 **+16 / +14 px**，不要做成大范围水波。

```css
@keyframes ripple {
  0%   { width: 100%; height: 100%; opacity: 0.55; }
  35%  { width: calc(100% + 12px); height: calc(100% + 10px); opacity: 0.38; }
  85%  { width: calc(100% + 16px); height: calc(100% + 14px); opacity: 0.05; }
  100% { width: calc(100% + 16px); height: calc(100% + 14px); opacity: 0; }
}
```

---

## 6. 层级与 DOM 建议

推荐结构（类名可改，层级关系勿改）：

```html
<div class="cta-wrap">
  <div class="ripple"></div>
  <div class="ripple d2"></div>
  <div class="cta">
    <span class="bar-sweep" aria-hidden="true"></span>
    <span class="label">立即领取</span>
  </div>
</div>
```

| 节点 | z-index 建议 | overflow |
|------|--------------|----------|
| `.cta-wrap` | — | 可见（允许涟漪外扩） |
| `.ripple` | 1 | — |
| `.cta` | 3 | **hidden** |
| `.bar-sweep` | 1（相对 cta） | — |
| `.label` | 3（相对 cta） | — |

---

## 7. 微信小程序落地注意

| 点 | 说明 |
|----|------|
| 实现方式 | 优先 **WXSS / CSS animation**；与演示页同参数即可 |
| 同层渲染 | `<map>` 同页时注意原生组件层级；CTA 为普通 view 时一般无冲突 |
| 暂停 | 用类名切换 `animation-play-state: paused`，或移除 animation |
| rpx | 30px / 60px / 16px 等动效尺寸建议按 **750 稿**换算，或固定 px 与设计稿一致；**周期秒数、透明度、角度不要换算错** |
| 性能 | 仅 transform / opacity；避免改 width 引发整页回流时，涟漪可用 `scale` 近似（若改 scale，需重标定视觉幅度与演示页一致后再用） |

> 若改用 `scale` 实现涟漪，必须与上表关键帧视觉对齐后再合入；默认交付口径以 **宽高关键帧** 为准（与演示页一致）。

---

## 8. 验收清单

前端自测通过以下全部项即可合入：

- [ ] 按钮静态：294×40（或等价宽×40）、圆角 20、渐变 `#FF7802 → #FF6002`、白字「立即领取」
- [ ] 梳条色为 `#FF9602`，肉眼约为 **40%** 透明叠在橙底上
- [ ] 多条斜条均匀铺满按钮，倾斜约 **-25°**
- [ ] 梳条**持续向右**移动，速度约 **2s 走完一个条+隙周期**，接缝无跳动
- [ ] 按钮圆角处梳条被裁切干净，无直角溢出
- [ ] 文字始终在最上层，不被梳条「洗白」或遮挡
- [ ] 两道涟漪错峰约 **1.3s**，外扩幅度小（约 +16px 量级），不冲进大片券面留白
- [ ] 涟漪不被按钮 `overflow` 裁掉
- [ ] 离开视口 / 领取后停止；系统「减少动态效果」开启时无动画

---

## 9. 附录：关键 CSS（与演示页一致）

```css
.cta-wrap {
  position: relative;
  width: 100%;
  height: 40px;
}

.cta {
  position: relative;
  z-index: 3;
  width: 100%;
  height: 40px;
  border-radius: 20px;
  background: linear-gradient(90deg, #FF7802 0%, #FF6002 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.6px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  isolation: isolate;
}

.cta .label {
  position: relative;
  z-index: 3;
}

.cta .bar-sweep {
  position: absolute;
  top: -40%;
  bottom: -40%;
  left: -50%;
  width: 220%;
  background: repeating-linear-gradient(
    90deg,
    rgba(255, 150, 2, 0.4) 0,
    rgba(255, 150, 2, 0.4) 30px,
    transparent 30px,
    transparent 60px
  );
  transform: skewX(-25deg) translateX(0);
  animation: bars-right 2s linear infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes bars-right {
  from { transform: skewX(-25deg) translateX(0); }
  to   { transform: skewX(-25deg) translateX(60px); }
}

.ripple {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  border: 1.5px solid rgba(255, 96, 2, 0.62);
  box-shadow: 0 0 8px rgba(255, 96, 2, 0.18);
  animation: ripple 2.6s cubic-bezier(0.25, 0.6, 0.3, 1) infinite;
  pointer-events: none;
  z-index: 1;
}

.ripple.d2 {
  animation-delay: 1.3s;
}

@keyframes ripple {
  0%   { width: 100%; height: 100%; opacity: 0.55; }
  35%  { width: calc(100% + 12px); height: calc(100% + 10px); opacity: 0.38; }
  85%  { width: calc(100% + 16px); height: calc(100% + 14px); opacity: 0.05; }
  100% { width: calc(100% + 16px); height: calc(100% + 14px); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .cta .bar-sweep,
  .ripple {
    animation: none !important;
  }
}
```

**对照演示**：打开 [`cta-motion-options.html`](../cta-motion-options.html)，暂停 / 重播按钮可辅助联调。参数变更时先改演示页，再同步本文与生产代码。
