# Agent Dialog — 對話 Flow 內容

---

## HERO FLOW（首頁主流程）

### Step 1 — 選擇角色 `step1-persona`

**Agent：**
> Hi, I'm the Mlytics Cortex.
> What's the most pressing problem you want to solve?

**選項（Pills）：**
| 按鈕文案 | 對應角色 |
|---|---|
| Content isn't earning enough | publisher |
| Ads miss purchase-ready users | brand |
| Infrastructure lacks AI | developer |

---

### Step 2 — 介紹 `step2-intro`（auto-advance）

**Agent：**
> Let me show you what the Mlytics Cortex does.

---

### Step 3 — Demo 掃描 `step3-scan`（auto-advance）

**Agent：**
> Analyzing the article's content structure and reader intent signals...

→ 同時顯示 **ArticleScanDemo**（依 persona 選用不同文章）

- Publisher / Brand：使用 `media-ai` 文章
- Developer：使用 `media-ai` 文章，顯示 Intent Strength 標籤

---

### Step 4 — 個人化說明 `step4-personalized`（auto-advance）

| 角色 | Agent 訊息 |
|---|---|
| publisher | Each of these 5 follow-up articles is an entry point to capture reader intent. Human writing costs $250/piece. Mlytics Cortex costs $0.10. |
| brand | 2 of these 5 questions are strong intent signals — readers actively comparing products, ready to decide. We embed these intent questions across content owner pages. When a reader clicks, Mlytics Cortex captures the signal and places your brand exactly where purchase intent is highest. |
| developer | This entire flow — article analysis, content generation, intent classification — runs on Decisive Engine with decision latency < 50ms. Can your current infrastructure do this? |

---

### Step 4b — 個人化問題 `step4b-question`

| 角色 | Agent 問題 | 選項 |
|---|---|---|
| publisher | How many articles can your site produce per month? | 100+ / 300+ / 700+ / 1000+ / 5000+ / 10K+ |
| brand | Which verticals do you primarily focus on? | BFSI / FMCG / Automotive / Tech & Telco / Travel & Hospitality / Real Estate / Health & Wellness / Luxury & Fashion |
| developer | What's your approximate monthly CDN spend? | < $500/mo / $500–$2K/mo / $2K–$10K/mo / $10K+/mo |

---

### Step 5 — CTA `step5-cta`

| 角色 | Agent 訊息 |
|---|---|
| publisher | Your content is already generating intent signals — across 15M+ MAU. Let's start capturing them. |
| brand | Your audience is already in our network — 15M+ MAU, intent-classified. Let's put your brand in front of them. |
| developer | Every delivery decision you make could feed an AI flywheel — at <50ms, across 15M+ MAU. Let's show you how. |

**CTA 按鈕（依 persona 對應）：**
- See content owner plan → `/content-owners`
- See brand plan → `/brands`
- See developer plan → `/developers`


## Demo 文章資料

### 主文章（Demo 掃描對象）

| ID | 標題 | 分類 |
|---|---|---|
| media-ai | How Can AI Optimize Digital Assets For Media In Southeast Asia? | Media & Technology |

### 延伸文章（`media-ai`，Publisher / Brand / Developer 使用）

| # | 標題 | Intent Strength |
|---|---|---|
| 1 | How does AI automate content creation for Southeast Asian media? | Low Intent |
| 2 | What role does AI play in personalizing content for users in Malaysia and Singapore? | Low Intent |
| 3 | How does AI enrichment of metadata improve digital asset management? | Mid Intent |
| 4 | What are the primary data privacy concerns for AI in Southeast Asian media? | High Intent |
| 5 | How does AI-powered automated metadata generation streamline asset searchability? | High Intent |
