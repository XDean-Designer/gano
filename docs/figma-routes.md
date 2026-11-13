# Figma 准确路由

| 项 | 值 |
|----|-----|
| 文件 | [gYtPZtAsGCSg3c2pUdtnGT](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT) |
| 排布 | 5 行泳道：①顾问 ②顾客 ③店员 ④异常 ⑤经营 |
| 设计稿 | 390×844 · 主色 `#FF6002` |
| 对照 PRD | [`prd-剑琅美遇-联盟核销.md`](./prd-剑琅美遇-联盟核销.md) §5 / §6.1b / §11.1 |

URL 规则：`https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id={node}`，其中 `:` → `-`（例 `302:143` → `302-143`）。

---

## A 向 · ① 顾问发码

| 编号 | 名称 | node-id | 路由 |
|------|------|---------|------|
| 00 | 小程序首页 | `198:436` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=198-436) |
| 01 | 进入获客 | `75:2` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=75-2) |
| 02 | 按档点选 | `76:2` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=76-2) |
| 02b | 档位已发完 | `244:201` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=244-201) |
| 03a | 亮码 V3–V5 | `193:17` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=193-17) |
| 03b | 亮码 V6–V10 | `77:2` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=77-2) |

## A 向 · ② 顾客领取与到店

| 编号 | 名称 | node-id | 路由 |
|------|------|---------|------|
| 03c | 微信扫码 | `78:2` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=78-2) |
| 04 | GANO 店铺 | `79:2` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=79-2) |
| 05 | 领取详情 | `80:2` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=80-2) |
| 05-V35 | 领取详情 V3–V5 | `226:201` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=226-201) |
| 06a | 领到券 V3–V5 | `195:17` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=195-17) |
| 06b | 领到券 | `81:2` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=81-2) |
| 06z | 核销码放大 | `246:201` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=246-201) |
| 07a | 到店找券 | `82:2` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=82-2) |
| 07b | 出示核销码 | `270:144` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=270-144) |
| 08e | 核销成功-顾客 | `212:201` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=212-201) |

## A 向 · ③ 店员核销

| 编号 | 名称 | node-id | 路由 |
|------|------|---------|------|
| 07s | 扫码核销 | `83:2` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=83-2) |
| 08x | 核销前确认 | `517:150` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=517-150) |
| 08a | 核销成功 | `84:2` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=84-2) |

## A 向 · ④ 异常 / 边界态

| 编号 | 名称 | node-id | 路由 |
|------|------|---------|------|
| 04b | 领取码失效 | `294:144` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=294-144) |
| 05b | 重复领取 | `215:201` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=215-201) |
| 05c | 领取售罄 | `250:201` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=250-201) |
| 08c | 过期不可核 | `86:2` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=86-2) |
| 09c | 过期手记 | `90:2` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=90-2) |

## A 向 · ⑤ 经营 · 对账与明细

| 编号 | 名称 | node-id | 路由 |
|------|------|---------|------|
| 10 | 两边账 / 数据 | `91:2` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=91-2) |
| 10·按门店克隆 | 两边账（按门店子泳道） | `437:142` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=437-142) |
| 11-亮 | 每日·亮码 | `169:17` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=169-17) · 标题右复制报表 |
| 11-扫 | 每日·扫码 | `418:142` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=418-142) · 标题右复制报表 |
| 11-领 | 每日·领取 | `418:425` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=418-425) · 标题右复制报表 |
| 11-亮 | 每日·亮码 | `169:17` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=169-17) · L2→L3 顾问号 · 标题右复制报表 |
| 11-扫 | 每日·扫码 | `418:142` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=418-142) · L2→L3 **顾问号** · 标题右复制报表 |
| 11-领 | 每日·领取 | `418:425` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=418-425) · L2→L3 **顾问号** · 标题右复制报表 |
| 11 | 每日·被核销 | `168:17` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=168-17) · L2→L3 核销员 ›→12 · 标题右复制报表（四态均可） |
| 11c-亮 | 按门店·亮码 | `433:152` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=433-152) · 店卡→L3 · 标题右复制报表 |
| 11c-扫 | 按门店·扫码 | `433:247` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=433-247) · 店卡→L3 **顾问号** · 标题右复制报表 |
| 11c-领 | 按门店·领取 | `433:342` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=433-342) · 店卡→L3 **顾问号** · 标题右复制报表 |
| 11c | 按门店·被核销 | `178:17` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=178-17) · L3 ›→12 · 标题右复制报表 |
| 11d | 发来·每日·被核销 | `294:155` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=294-155) · 标题右复制报表 |
| 11e | 发来·按门店·被核销 | `418:330` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=418-330) · 标题右复制报表 · chevron 已修 |
| 12 | 当日详情 | `171:17` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=171-17) · 表头顾客·**核销门店**·项目 · 唯一顾客号列表 |
| 13 | 订单明细 | `172:17` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=172-17) · 本单人员四人号 |
| 11-日期 | 日期 Sheet | `247:201` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=247-201) |
| 11-时间 | 时间范围 Sheet | `432:253` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=432-253) |
| 11-门店 | 门店 Sheet | `432:142` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=432-142) |
| 11-漏斗 | 漏斗筛选 Sheet（每日） | `251:201` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=251-201) |
| 11-漏斗·按门店 | 漏斗筛选 Sheet（按门店） | `437:296` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=437-296) |
| 11-空态 | 数据空态 | `252:201` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=252-201) |

## B 向 · GANO → 丽妍购卡礼（关键帧）

| 编号 | 名称 | node-id | 路由 |
|------|------|---------|------|
| B01 | 进入获客 | `302:143` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=302-143) |
| B02 | 按档点选 | `302:403` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=302-403) |
| B03-满5000 | 亮码 · 满 5000 | `302:488` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=302-488) |
| B03-满10000 | 亮码 · 满 10000 | `302:535` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=302-535) |
| B05 | 领取详情 | `302:587` / `302:677` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=302-587) · [变体](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=302-677) |
| B06 | 领到券 | `302:775` / `302:992` | [打开](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=302-775) · [变体](https://www.figma.com/design/gYtPZtAsGCSg3c2pUdtnGT?node-id=302-992) |

---

## 不出独立帧 / 已删

**不出稿**（系统效果或同壳态）：非顾问首页 · 无会话进店 · 一线无数据 Tab · 无合作空态 · Toast · 亮码轮换中 · 07「已失效」按钮态。

**已删帧**：`08-已核销` · `08-过期券` · `09-写评价` · `09-看回写`（`89:2`）· 原店员评价 `88:2` · **店长模式**（原 10m/20–22，node 如 `680:142`/`674:142`/`673:142`/`672:142`；稿内已无）。

节点以 Figma 最新稿为准；若稿面改动，同步更新本表与 PRD。
