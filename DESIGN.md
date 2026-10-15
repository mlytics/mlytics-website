# Mlytics 官網設計系統（DESIGN.md）

本文件是 mlytics-website 所有 UI 規則的**唯一依據**。內容是 An 裁決後的**目標標準**，不是現況描述：

- 每條規則寫三件事：**用在哪**、**寫法**（逐字的 class／token）、**禁止什麼**。
- 現況與標準不同時，規則下方會有一行「現況偏離：見 §10 DATAI-xxx」。偏離的寫法**不可當範本照抄**，以本文件為準；修正票完成後該行會刪除。
- 每條規則後有隱藏的來源註記（`<!-- src: ... -->`），指向盤點項目 id 與專案決策編號，供維護者追溯，閱讀時可忽略。
- token 與 class 一律寫在反引號內；`__tests__/design-system/design-md-coverage.test.ts` 會檢查 `app/site-base.css` 的每個 token 與元件類別都出現在本文件，避免文件過期。

---

## 0. 給 AI 的使用說明

1. **動工前完整讀完本文件**，不可只讀部分章節。
   <!-- src: #28, 附錄 A §0 -->
2. **文件沒寫到的情況，先停下告知**：說明「哪件事沒涵蓋、打算參照哪一頁、會用哪些數值」，經確認後才動工；做完把新規則補進本文件（附來源註記）。不可自行找「最像的頁面」照做。
   <!-- src: #28 -->
3. **AI Mode 頁（`/ai-mode-playground/`）是例外，不可照抄**：它的字級與間距沿用原型，不計入任何全站慣例。
   <!-- src: tok-ai-mode, page-ai-mode, #20, #28 -->
4. **「現況偏離」不可當範本**：標有「現況偏離」的規則，網站上看到的寫法是待修的，照本文件的標準寫。
   <!-- src: #28, 附錄 A §0 -->
5. **展示**：`npm run storybook` 只在本機開啟，用來看元件的樣子；**規則以本文件為準**，Storybook 與本文件不一致時以本文件為準並回報。
   <!-- src: #30 -->
6. **量間距、量字級以瀏覽器實測為準**，不要用 class 推算（例：行內小標籤上的 `mb-*` 不會產生間距）。
   <!-- src: #29 方法學, mol-heading-group-eyebrow-gap -->
7. **畫面以外的約定**（追蹤、結構化資料、sitemap、導覽列、CSS 入口檔）在第 7 章，無障礙在第 8 章，新增頁面照第 9 章 SOP；核准例外與待修清單在第 10 章。照抄任何現有程式前，先查 §10.2 待修清單。
   <!-- src: #28, 附錄 A §7–§10 -->

---

## 1. 設計原則

- **簡潔俐落、置中為主、區塊少**。
  - 用在哪：所有頁面與區塊。
  - 寫法：區塊內容預設置中；能少一個區塊就少一個。
  - 禁止：為單一區塊做局部最佳化而偏離既有慣例——**對齊既有慣例優先於局部最佳化**。新數值一律先查本文件，沒有就依 §0 第 2 點詢問。
  <!-- src: #9, #28 -->
- **裝飾（光暈、漸層）以深色區塊為主**。
  - 用在哪：深色區塊（`.section-dark`）可用光暈與漸層；淺底區塊只能用 §2「光暈與漸層」的唯一標準淺底配方。
  - 禁止：在淺底區塊自訂光暈配色或透明度。
  <!-- src: tok-gradient, #31-5 -->

---

## 2. Tokens

所有 token 與共用類別定義在 `app/site-base.css`：`@theme` 區塊（會產生 Tailwind class）與 `:root` 區塊（legacy 變數）。CSS 有兩個入口檔，都 import 這份檔案：`app/globals.css` 是網站入口（排除 DESIGN.md 與 Storybook 檔案，避免文件裡的 class 進到網站 CSS），`.storybook/storybook.css` 是 Storybook 入口（額外掃描 story 與 DESIGN.md）。新增或修改 token 一律改 `app/site-base.css`。

### 2.1 顏色 token

**規則：只用 `app/site-base.css` 的顏色 token，不新增顏色、不寫死色碼。**
- 用在哪：所有文字、底色、框線、圖示。
- 寫法：一律 Tailwind class，例如 `text-ink-muted`、`bg-primary`、`border-line`。白色用 Tailwind 的 `text-white`／`bg-white`。SVG 屬性（`fill`、`stroke`）可寫 `var(--color-*)`。
- 禁止：`style={{ color: 'var(--…)' }}` 這類 inline 寫法（同一顏色兩種寫法容易改漏）；寫死 hex（包含 `#fff`／`#FFFFFF`）；Tailwind 內建灰色與紅色（`text-gray-*`、`border-gray-*`、`text-red-*` 等）。
- 現況偏離：見 §10 DATAI-623（inline 寫法、寫死白色 14 處、`/book-a-demo/` 表單與導覽列的 Tailwind 灰、email 錯誤提示的 Tailwind 紅）
<!-- src: tok-color-core, tok-color-two-syntaxes, tok-color-hex-residue, tok-color-tailwind-gray, tok-color-error-red -->

| token | 值 | 用途 | 禁止／注意 |
|---|---|---|---|
| `--color-primary` | `#225D59` | 主色：行動按鈕底色、淺底上的強調文字、主色小標籤 | 不可當深底上的文字色（對比不足） |
| `--color-primary-dark` | `#1A3D3A` | 與 `--bg-dark` **同值兩名**。深色區塊一律用 `.section-dark`；`bg-primary-dark` 只用於元件內的小面積深底 | 不可把整個區塊寫成 `bg-primary-dark`，也不可在 `.section-dark` 上再疊 `bg-primary-dark` |
| `--color-primary-light` | `#2d7a74` | **只限現有兩處**：首頁世界地圖點陣的訊號點（`components/home/WorldMapDots.tsx`）與 `.pill-btn--dark` 滑過時的框線 | 不可用在其他地方；需要新用途先問 An <!-- src: #32-1 --> |
| `--color-gold` | `#F59E0B` | 數字亮點、強調標籤 | 不當一般文字色 |
| `--color-gold-light` | `#FCD34D` | 目前零使用 | 新用途先詢問 |
| `--color-warn` | `#D97706` | 痛點／問題段落 | 只用於痛點段落；不當錯誤提示色 |
| `--color-warn-deep` | `#B45309` | 痛點段落的深一階（小標籤、圖表線） | 同上 |
| `--color-surface` | `#FAFAFA` | 淺灰面（卡片底） | 不用於區塊交替（見 §6） |
| `--color-ink` | `#1A1A1A` | 淺底主要文字 | — |
| `--color-ink-muted` | `#6B6B6B` | 淺底次要文字、說明文字 | — |
| `--color-ink-subtle` | `#9B9B9B` | — | **不可用於文字**（白底對比 2.78:1，不過 AA）；需要淡一階的文字一律用 `text-ink-muted` |
| `--color-on-dark` | `#A8C5C3` | 深底上的文字 | 不可放在白色或淺底面板上當文字色 |
| `--color-line` | `#E5E5E5` | 框線、淺底上的分隔線 | — |

<!-- src: tok-color-accents, tok-color-primary-dark-alias, cross-contrast-ink-subtle, cross-contrast-primary-on-dark, cross-contrast-ondark-on-white, #29-8 -->
- 現況偏離：見 §10 DATAI-622（`text-ink-subtle` 當文字、主色字放在深底、淡綠字放在白面板）、DATAI-623（`/developers/` 頁尾 CTA 在 `.section-dark` 上多疊 `bg-primary-dark`）

### 2.2 錯誤色（核准新增，尚未加入 site-base.css）

**規則：錯誤提示用兩個專用錯誤色 token，依底色選用。** 這是「只用既有 token」的核准例外。
- 用在哪：表單與 email 欄的錯誤訊息、錯誤狀態框線。
- 寫法：淺底用 `#B91C1C`（白底對比 6.47:1）、深底用 `#FCA5A5`（深底對比 6.24:1）。建議名稱 `--color-error`／`--color-error-on-dark`，由修正票加入 `app/site-base.css` 後改用對應 class。
- 禁止：用 `warn`（琥珀，語意是痛點段落）或 Tailwind 內建紅表示錯誤；在深底用淺底那一個紅（反之亦然）。
- 現況偏離：見 §10 DATAI-623（`InlineEmailCTA` 目前用 `text-red-500`、`border-red-400`）
<!-- src: tok-color-error-red-token, tok-color-error-red, #29-8, #31-2 -->

### 2.3 透明度

**規則：透明色只能用兩個基色，且只用固定階梯。**
- 用在哪：半透明底色、框線、深底文字。
- 寫法：只准 primary `rgba(34,93,89,α)` 與 on-dark `rgba(168,197,195,α)`；能用 class 時用 Tailwind 透明度寫法（例：`bg-primary/8`）。α 只用階梯 **.06／.08／.12／.25／.4／.55／.6／.7／.85**；階梯外的值就近對齊到階梯。
  - 深底上的文字 α **≥ .85**（.85 在 `--bg-dark` 上約 5.16:1，過 AA）。
  - 主色底上的文字一律用白色。
  - 淺底分隔線用 `border-line`；深底分隔線用 on-dark .12。
- 禁止：黑色透明、白色透明、金色／琥珀／灰色等其他顏色的透明（淺底分隔線不可用黑色透明）。
- **例外（核准）**：
  1. 導覽列捲動後的 `bg-white/80` 加 `backdrop-blur-sm`。
  2. §2.4 的**標準淺底光暈配方**（薄荷 `rgba(240,248,247,0.97)`→白 `rgba(255,255,255,0.65)`），只限逐字照抄該配方，不可拿其中的薄荷或白色透明用在別處。
  3. /brands/ 痛點段落的琥珀光暈與琥珀短線（§2.4），只限痛點段落。
  4. §2.14 的深底卡片 hover 發光配方（含階梯外的 .28、.24），只限逐字照抄。
- 現況偏離：見 §10 DATAI-622（深底文字 α 低於 .85、比較卡編號、.75 文字）、DATAI-623（非基色透明、階梯外的值、淺底分隔線用黑色透明、`app/site-base.css` 階梯註解尚未列入 .6）
<!-- src: tok-alpha-nonbase, tok-alpha-off-ladder, tok-alpha-pill-border-06, tok-on-dark-085, atom-divider, cross-contrast-card-number, #31-3, #31-4 -->

### 2.4 光暈、漸層、模糊與透明效果

**規則：光暈以深色區塊為主；淺底只能用唯一標準配方。**
- 用在哪：區塊背景的裝飾（光暈）、遮罩與流程線、導覽列背景、按鈕狀態。
- 寫法：
  - **深色區塊光暈**：可用，只用 primary 與 on-dark 兩個基色。
  - **淺底區塊光暈**：只能用首頁 Hero（`components/home/HeroSection.tsx:36-37`）與 /content-owners/ AI Mode 入口（`components/ui/PlaygroundCTASection.tsx:88-89`）現有的薄荷→白漸層，**逐字照抄**：
    ```
    radial-gradient(ellipse 85% 75% at 50% 45%, rgba(240,248,247,0.97) 0%, rgba(255,255,255,0.65) 65%, transparent 100%)
    ```
  - **例外（核准）**：/brands/ 痛點段落的琥珀光暈與琥珀短線（`components/pages/brands/BrandPainSection.tsx:180`、`:186`），痛點段落專用，與 `--color-warn`／`--color-warn-deep` 同一語意。
  - **淡出遮罩**：標誌跑馬燈左右兩側。
  - **流程線**：首頁流程圖的 primary→gold 垂直線（`components/home/IntentPipeline.tsx:146`）。
  - **背景模糊**：只有導覽列（`backdrop-blur-sm`）。
  - **透明效果**：實心按鈕滑過 `hover:opacity-90`；送出中 `disabled:opacity-60`。
- 禁止：淺底自訂光暈（改透明度、換顏色、換形狀）；光暈用兩基色以外的顏色（上述琥珀例外除外）；導覽列以外使用背景模糊。
- 現況偏離：見 §10 DATAI-623（標誌跑馬燈淡出遮罩寫死 `#FFFFFF`；其他非基色光暈，包括首頁流程圖金色小圓點的發光）
<!-- src: tok-gradient, tok-blur, tok-opacity, #31-5 -->

### 2.5 legacy 變數（`:root`）

**規則：`:root` 的 legacy 變數只供 `app/site-base.css` 自己的 `.section-*`、捲軸與 `body` 規則使用。**

| 變數 | 值 | 目前用在 |
|---|---|---|
| `--primary` | `#225D59` | 捲軸 |
| `--bg-light` | `#FAFAFA` | `body` 底色、`.section-light` |
| `--bg-white` | `#FFFFFF` | `.section-white` |
| `--bg-dark` | `#1A3D3A` | `.section-dark`（與 `--color-primary-dark` 同值） |
| `--text-primary` | `#1A1A1A` | `body` 文字色 |
| `--text-dark-primary` | `#FAFAFA` | `.section-dark` 文字色 |

- 用在哪：只在 `app/site-base.css` 內部。
- 寫法：新程式一律用 §2.1 的 `@theme` token。
- 禁止：在元件或頁面的程式裡引用這些變數。
- 現況偏離：AI Mode 頁（例外頁）的 CSS 檔引用 legacy 變數，見 §10 DATAI-630
<!-- src: tok-legacy-root-vars-site, tok-ai-mode-legacy-vars -->

### 2.6 字型

**規則：只用系統字型 stack。**
- 用在哪：全站所有文字。
- 寫法：`body` 已設定 `-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", sans-serif`，元件不需另設字型。
- 禁止：載入其他字型（Google Fonts 等）、在元件上另設 `font-family`。
- 現況偏離：見 §10 DATAI-623（`app/layout.tsx` 載入未使用的 Geist 字型）
<!-- src: tok-font-family -->

### 2.7 字級（依角色）

**規則：字級依文字角色決定，一個角色一種字級；最小 12px。**

- 用在哪：所有文字，依下表角色選字級。
- 寫法：照下表「寫法」欄逐字使用。

| 角色 | 字級 | 寫法 |
|---|---|---|
| h1（Hero 標題） | 手機 36、≥768 為 48 | `text-4xl md:text-5xl font-bold` |
| 首頁 Hero h1（首頁專屬） | 另加 ≤420px 為 27 與負字距 | 加 `max-[420px]:text-[27px]` 與 `tracking-tight`；只限首頁 Hero |
| 404／錯誤頁標題 | 同 Hero h1（48） | `text-4xl md:text-5xl` |
| 404 的「404」與錯誤頁的「!」大字 | — | `text-7xl`，**白色** |
| h2（區塊標題） | 30／36（≥768）／48（≥1024） | `.section-heading` |
| 展示大字句（區塊中段重點句） | 手機 36、≥768 為 60 | `text-4xl md:text-6xl` |
| 卡片標題 | 24 | `text-h3`（DATAI-556 修好前不產生樣式，見 §2.8）；首頁身分卡標題也是 24。**DATAI-556 完成前不得新增卡片標題**；需要時先問 An <!-- src: #32-3 --> |
| 法律頁條文小標 | 20 | `text-xl font-bold` |
| 內文 | 16 | `text-base` |
| 輔助文字 | 14 | `text-sm` |
| 小標籤（eyebrow） | 12 | `.label-eyebrow` |
| 按鈕 | 14／600 | `text-sm font-semibold` |
| FAQ 題目 | 16／600 | `text-base font-semibold` |

- 禁止：小於 12px 的字（包括 `text-[10px]` 與 SVG `fontSize="10"`）；為單一區塊自訂字級。
- 已接受取捨：桌機 h1 與 h2 同為 48。
- 現況偏離：見 §10 DATAI-556（6 張卡片標題與首頁身分卡標題不是 24、10px 字）、DATAI-626（/developers/ h1、404／錯誤頁標題目前 `text-3xl md:text-4xl`）、DATAI-622（「404」與「!」目前是主色）、DATAI-620（首頁 Flywheel h2 未用 `.section-heading`）
<!-- src: tok-text-size-scale, tok-caption-12-floor, mol-display-statement, page-legal, page-404, org-hero-h1-standard, org-hero-home, tok-breakpoint-420, #29-6, #29-7, #31-1, #31-10 -->

### 2.8 字級 token（目前失效）

`app/site-base.css` 的 `@theme` 定義了六個字級 token，但**目前全部失效**：Tailwind v4 的字級命名空間是 `--text-*`，`--font-size-*` 不會產生 `text-display`、`text-h1`……等 class，寫了也沒有效果。

| token | 值 |
|---|---|
| `--font-size-display` | `clamp(2.5rem, 6vw, 4rem)` |
| `--font-size-h1` | `clamp(2rem, 5vw, 3rem)` |
| `--font-size-h2` | `2.25rem` |
| `--font-size-h3` | `1.5rem` |
| `--font-size-small` | `0.875rem` |
| `--font-size-caption` | `0.75rem` |

- 用在哪：目前不可用於任何地方。
- 寫法：DATAI-556 修正後改名為 `--text-*`，屆時 `text-h3` 才會是 24px。
- 禁止：在 DATAI-556 完成前新增任何 `text-display`／`text-h1`／`text-h2`／`text-h3`／`text-small`／`text-caption` 用法；也不要自行在 `app/site-base.css` 補 `--text-*`。
- DATAI-556 改名為 `--text-*` 時，`display`／`h1`／`h2` 三個 token 的**值改成與 §2.7 的實際標題角色一致**（角色字級是響應式：h1 36／48、h2 30／36／48；實作值由 DATAI-556 提案、截圖交 An 確認）。`h3`、`small`、`caption` 的值不變。
- 目前除了 AI Mode 頁（例外頁，`DecisionFlow.module.css` 以 `var(--font-size-h2)` 引用）以外，沒有任何地方用到這幾個 token。改值會讓 AI Mode 頁的標題大小跟著變，所以 DATAI-556 必須和 DATAI-630（AI Mode 頁對齊）協調。
<!-- src: #32-2 -->
- 現況偏離：見 §10 DATAI-556
<!-- src: tok-font-size-token-broken, #29-6, #30-5 -->

### 2.9 字重、行高、字距

- 用在哪：所有文字，依下表角色選字重、行高、字距。
- 寫法：照下表「寫法」欄逐字使用。

| 項目 | 標準 | 寫法 |
|---|---|---|
| 字重 400 | 內文 | 預設，不寫 |
| 字重 500 | 表單標籤、導覽連結 | `font-medium` |
| 字重 600 | 小標籤、按鈕、FAQ 題目 | `font-semibold` |
| 字重 700 | 標題 | `font-bold` |
| 字重 900 | 大數字、價格 | `font-black` |
| 行高 | 內文 relaxed；標題 tight／snug；大數字 none | `leading-relaxed`；`leading-tight`／`leading-snug`；`leading-none` |
| 字距 | 小標籤 0.1em；大數字 -0.04em；負字距標題只限首頁 Hero | `.label-eyebrow` 內建 0.1em；大數字 `letterSpacing: '-0.04em'`；`tracking-tight` 只用於首頁 Hero |

- 禁止：上表以外的字重用途；首頁 Hero 以外使用 `tracking-tight`。
<!-- src: tok-font-weight, tok-leading, tok-tracking -->

### 2.10 間距刻度

**規則：間距只用 4px 刻度（Tailwind 整數級：`1`＝4px、`2`＝8px……），不在刻度上的值一律往下取。**
- 用在哪：margin、padding、gap 等所有間距。
- 寫法：Tailwind 整數級 class，例如 `mb-3`、`px-6`、`gap-4`。
- 禁止：半級（`py-1.5`、`mt-0.5`、`gap-2.5` 等）與方括號任意值（例如寫成方括號的 13px），以下例外除外。
- **例外**：
  1. 手機選單按鈕 `p-[11px]`／`-mr-[11px]`：讓 22px 圖示湊成 44px 點擊範圍。
  2. /partnership/ 勾勾 2px 下移置中。
  3. **按鈕以整顆高度為準**：按鈕高度符合規格（44／40／36）即可，內距不套「往下取」，例如輸入框內送出鈕的 `py-2.5` 保留；外框按鈕可用扣掉 1px 框線的 `calc()` 內距，例如 `py-[calc(0.5rem-1px)]`。
- AI Mode 頁不計入本規則的慣例；其 14／9／7px 另由 DATAI-630 處理（分享區 An 核准的 14px 除外）。
- 現況偏離：見 §10 DATAI-621（非按鈕的半級與任意值、`.label-eyebrow-pill` 內距 6px）
<!-- src: tok-spacing, tok-ai-mode-spacing, #29-4, #29-7, #30-4 -->

### 2.11 區塊上下距

**規則：區塊依角色用固定的上下距。**

- 用在哪：每個頁面區塊（`<section>`）的上下內距。
- 寫法：照下表「寫法」欄逐字使用。

| 區塊角色 | 上下距 | 寫法 |
|---|---|---|
| 一般內容區塊 | 平板與手機 64、桌機（≥1024）112 | `py-16 lg:py-28` |
| Hero | 上 128、下 48 | `pt-32 pb-12` |
| 頁尾 CTA | 上下 64 | `py-16` |
| FAQ 區塊 | 上 32、下 64（桌機 80） | `pt-8 pb-16 lg:pb-20` |
| FAQ 接在深色區塊之後 | 上方改用一般區塊距離 | — |

- 禁止：一般內容區塊用其他上下距（例如 `py-16 lg:py-20`、`py-20 lg:py-28`）。
- 注意：首頁等目前手機為 80 的區塊，修正後會變 64。
- 現況偏離：見 §10 DATAI-619
<!-- src: tpl-section-rhythm, tpl-section-rhythm-112, tpl-section-rhythm-infra, org-faq-top-after-dark, #29-1, #30-1 -->

### 2.12 容器寬

**規則：容器寬依內容角色決定。**

- 用在哪：區塊內的內容容器。
- 寫法：照下表「寫法」欄逐字使用。

| 角色 | 寬度 | 寫法 |
|---|---|---|
| 一般內容 | 1024 | `max-w-5xl mx-auto px-6` |
| 首頁內容（首頁專屬） | 1152 | `max-w-6xl` |
| Hero、法律頁內文 | 768 | `max-w-3xl` |
| 表單 | 512 | `max-w-lg` |
| 預約頁 Hero | 672 | `max-w-2xl` |
| 404 | 512／576 | `max-w-lg`／`max-w-xl` |
| 區塊標題下方說明 | 576 | `max-w-xl`（置中時加 `mx-auto`） |
| 頁尾 | 跟各頁內容寬（首頁 1152、內頁 1024） | — |

- 禁止：上表以外的容器寬；/developers/ 合作夥伴區不再用 896。
- 例外：/decisive-engine/ Hero 的文字區 768，底部膠囊列維持 1024。
- 現況偏離：見 §10 DATAI-619（頁尾寬、/developers/ 合作夥伴區）、DATAI-620（說明文字寬度）、DATAI-626（/decisive-engine/ Hero）
<!-- src: tpl-container-widths, tpl-container-home-6xl, tpl-container-footer, tpl-container-infra, tok-max-w, #29-2, #30-2, #31-9 -->

### 2.13 圓角與框線

- 用在哪：按鈕、膠囊、卡片、表單欄位等所有有圓角或框線的元素。
- 寫法：照下表「寫法」欄逐字使用。

| 角色 | 寫法 |
|---|---|
| 藥丸（按鈕、膠囊） | `rounded-full` |
| 卡片 | `rounded-2xl`（16px） |
| 卡片內層元件 | `rounded-xl`（12px） |
| 小元件、表單欄位 | `rounded-lg`（8px） |
| 框線 | 一律 1px（`border`、`border-t` 等） |

- 禁止：行動按鈕用藥丸以外的圓角（方角滿版按鈕也改藥丸）；1px 以外的框線粗細。
- 現況偏離：見 §10 DATAI-624（4 顆方角滿版按鈕、`.pill-btn` 的 1.5px 框線）
<!-- src: tok-rounded, tok-border-width, #29-9 -->

### 2.14 陰影

**規則：卡片預設扁平（只有框線）；需要陰影時只用三級。**
- 用在哪：卡片、浮出的面板與下拉選單。
- 寫法：`shadow-sm`／`shadow-lg`／`shadow-xl`。
- 禁止：自訂 `boxShadow`。
- 現況偏離：見 §10 DATAI-623（/content-owners/ 比較卡改 `shadow-sm`、步驟面板改 `shadow-lg`）
- **例外（核准）：深底卡片 hover 發光**。用在哪：深色區塊內的卡片，滑鼠移上時。寫法：逐字照抄 /partnership/（`components/pages/partnership/PartnershipEarnings.tsx:65`）與 /content-owners/（`components/pages/publishers/LayerOverview.tsx:41`）現有配方：
  ```
  boxShadow: '0 0 0 1px rgba(168,197,195,0.28), 0 6px 28px rgba(34,93,89,0.24)'
  ```
  未 hover 時為 `'0 0 0 1px transparent'`。禁止：用在淺底卡片，或改動配方的透明度與尺寸。<!-- src: #32-4 -->
- 首頁流程圖金色小圓點的發光（`components/home/IntentPipeline.tsx:154`）不算陰影，屬於 §2.4 的**深色區塊光暈**，照 §2.4 只用兩基色；它不是本節「禁止自訂 `boxShadow`」的例外。
- 現況偏離：見 §10 DATAI-623（金色小圓點的發光目前用金色）
<!-- src: tok-shadow, tok-gradient, #31-5, #31-7 -->

### 2.15 圖層與斷點

- 用在哪：疊層元素（導覽列、選單、背景裝飾）與響應式排版。

| 項目 | 標準 |
|---|---|
| 圖層 | `z-0`／`z-10`／`z-20`／`z-50`（導覽列）／`z-[60]`（滿版選單，必須在導覽列之上） |
| 斷點 | `sm` 480（`--breakpoint-sm: 30rem`，不是 Tailwind 預設的 640）、`md` 768、`lg` 1024 |
| 首頁專屬斷點 | `max-[420px]` 只限首頁 Hero |

- 寫法：`--breakpoint-sm` 已在 `app/site-base.css` 改為 480px，`sm:` 即 480px 起。
- 禁止：上表以外的圖層值與斷點。
<!-- src: tok-z, tok-breakpoint-sm-480, tok-breakpoint-420 -->

### 2.16 動態

**規則：過場短、只動實際變化的屬性；JS 動畫必須處理減少動態。**
- 用在哪：滑過、展開等狀態過場，以及區塊進場動畫。
- 寫法：
  - 只過場實際會變的屬性（例如 `transition-colors`、`transition-opacity`、`transition-transform`）。
  - 過場時間：**要指定時間時**只用 `duration-200`／`duration-300`；沒有指定時沿用 Tailwind 預設時間。按鈕與表單欄位照第 3 章的標準字串寫，不另加 `duration-*`。
  - 進場動畫：framer-motion 0.5 秒、`easeOut`、淡入上移；卡片依序延遲 0.1 秒。
  - 減少動態：CSS 由 `app/site-base.css` 的 `prefers-reduced-motion` 規則全站處理；JS 動畫要自行處理（規則見 §8）。
- 禁止：`transition-all`。
- 現況偏離：見 §10 DATAI-624（13 處 `transition-all`）、DATAI-627（JS 動畫未處理減少動態）
<!-- src: tok-duration, tok-transition-all, tok-motion, cross-reduced-motion-js, Task 4 review I1 -->

### 2.17 圖示

**規則：圖示用 lucide（`lucide-react`）；功能圖示 22px。**
- 用在哪：所有功能圖示。
- 寫法：`size={22}`。需要底座時用大號底座：48px、`rounded-2xl`、`bg-primary`、白色圖示，底座內圖示同為 22（標準寫法見 `components/pages/decisive-engine/EngineUseCases.tsx:45`：`w-12 h-12 rounded-2xl bg-primary text-white`）。
- 例外（核准）：/developers/ 規格卡的圖示不加底座。
- 禁止：其他圖示庫。
- 圖示尺寸依角色：

| 角色 | 尺寸 | 例 |
|---|---|---|
| 小控制（例：下拉箭頭、國碼選單的放大鏡） | 12 | `size={12}` |
| 行內勾勾 | 14 | `size={14}` |
| 功能圖示 | 22 | `size={22}` |
| 狀態大圖示（例：表單送出成功） | 32 | `size={32}` |

- 例外（核准）：首頁流程圖的 32px 圓形小底座，保留為**流程圖專用小底座**（不可用在其他地方），框線 1px。完整元件規則寫在第 3 章。
- 流程圖小底座內圖示 15（底座專用，不作為一般圖示尺寸）。
- 現況偏離：見 §10 DATAI-625（首頁身分卡改用大號 48 實心底座；/book-a-demo/ 國碼選單的放大鏡 13 → 12；流程圖小底座框線 2px → 1px）
<!-- src: tok-icon-size, atom-icon-badge, atom-icon-badge-none, #29-5, #32-5, #32-6 -->

### 2.18 `app/site-base.css` 元件類別索引

`app/site-base.css` 定義的共用類別。完整的元件規則寫在第 3–6 章；此處列出每個類別的角色。

| 類別 | 角色 | 注意 |
|---|---|---|
| `.label-eyebrow` | 區塊小標籤：12px／600／大寫／字距 0.1em | 換色用 `Eyebrow` 元件參數，不用 className 覆寫（現況偏離：見 §10 DATAI-625） |
| `.label-eyebrow-md` | 14px 版小標籤，現況用於 /brands/ 較大的標示文字 | — |
| `.label-eyebrow-pill` | Hero 小膠囊（小標籤放在藥丸內） | 9 處統一用此類別並補上框線 .6（現況偏離：見 §10 DATAI-625）；內距 6px 改 4px 刻度（現況偏離：見 §10 DATAI-621） |
| `.section-heading` | 區塊標題 h2：30／36／48、700 | 所有 h2 都用它（現況偏離：見 §10 DATAI-620） |
| `.section-white` | 白色區塊底 | — |
| `.section-dark` | 深色區塊底（`--bg-dark`）與淺色文字 | 深色區塊一律用它，不用 `bg-primary-dark` |
| `.section-light` | 淺灰區塊底（`--bg-light`） | 不用於區塊交替（現況偏離：見 §10 DATAI-619，/decisive-engine/ 淺灰改白） |
| `.pill-btn` | 淺底外框藥丸按鈕 | 只留一份定義，對齊導覽列外框按鈕（1px 框、600 字重、同高、不用 `transition: all`）（現況偏離：見 §10 DATAI-624） |
| `.pill-btn--dark` | 深底外框藥丸按鈕，只作深底次要按鈕 | 與旁邊主要按鈕同高（現況偏離：見 §10 DATAI-624） |
| `.nf-cdn`／`.nf-default` | 404 頁的兩個版本切換（由 `app/not-found.tsx` 的 inline script 決定） | 只用於 404 |
| `.ping-ring` | 首頁世界地圖點陣的擴散圈動畫 | 只用於世界地圖點陣 |
| `.animate-marquee` | 標誌跑馬燈的捲動動畫（滑鼠移上暫停） | 只用於標誌跑馬燈 |

<!-- src: atom-eyebrow-section, atom-eyebrow-pill, atom-eyebrow-override-risk, tok-alpha-pill-border-06, mol-heading-group, mol-heading-flywheel, atom-btn-secondary-outline, atom-btn-dark-secondary, tpl-order-de-surface, #29-7, #29-9 -->

---

## 3. Atoms

按鈕依**類型**定義，不依出現的位置定義：先看要做的是哪一種按鈕，再照該類型的寫法。每顆可互動元素的 className 後面都要再加上 §3.7 的焦點外框。
<!-- src: atom-btn-font, #29-9 -->

### 3.1 按鈕類型總覽

| 類型 | 高度 | 用在哪 | 規則 |
|---|---|---|---|
| 實心藥丸・標準 | 44 | 獨立的行動按鈕（AI Mode 入口區、產品頁頁尾 CTA、404／錯誤頁、手機滿版選單底部） | §3.2 |
| 實心藥丸・輸入框內 | 40 | email 欄內的送出鈕（只在 `InlineEmailCTA` 內） | §3.2 |
| 實心藥丸・導覽列 | 36 | 導覽列（桌機右側、手機導覽列） | §3.2 |
| 滿版藥丸 | 44 | 按鈕要撐滿卡片或表單寬時 | §3.3 |
| 外框藥丸（淺底次要） | 與旁邊實心同高 | 淺底、與實心按鈕並排的次要行動 | §3.4 |
| 深底外框 | 與旁邊實心同高 | 深底、與實心按鈕並排的次要行動 | §3.5 |
| 控制類 | 依元件 | FAQ 題目列、步驟清單、輪播點、選單開關、下拉鈕、首頁流程列 | §3.6 |

- 不是按鈕：/content-owners/ 的「Talk to us」大卡片屬於**卡片家族**（§4.1），不套按鈕規則；導覽列與頁尾的文字連結屬於各自的 Organism（§5.1、§5.2）。
- 全站行動按鈕只有藥丸一種形狀（`rounded-full`），一律 14／600（`text-sm font-semibold`）。
- 圖示按鈕：全站只有頁尾 LinkedIn 一顆，規則見 §5.2。
- 內容區的資訊小膠囊見 §3.14；內文連結見 §3.15（都不是按鈕）。<!-- src: #33 -->
<!-- src: atom-btn-primary, atom-btn-inline-submit, atom-btn-block, atom-btn-secondary-outline, atom-btn-dark-secondary, atom-btn-font, buttons.json A1–A9／B1–B6, #29-9 -->

### 3.2 實心藥丸（行動）

**規則：主色底白字的藥丸，三種高度各有固定位置；高度由內距＋行高決定，寫法逐字照下表。**
- 用在哪：
  - **標準 44**：獨立的行動按鈕。深淺底共用同一顆，不另做深底版。
  - **輸入框內 40**：只用於 email 欄內的送出鈕（`InlineEmailCTA`），配合藥丸輸入框的高度。
  - **導覽列 36**：只用於導覽列。
- 寫法：

| 高度 | 標準寫法（新程式照抄） | 取自 |
|---|---|---|
| 44 | `inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold text-white bg-primary transition-opacity hover:opacity-90` | `components/ui/PlaygroundCTASection.tsx:72` |
| 40 | `shrink-0 px-4 md:px-5 py-2.5 rounded-full text-sm font-semibold transition-[opacity,transform] hover:opacity-90 active:scale-[0.98] bg-primary text-white disabled:opacity-60 whitespace-nowrap` | `components/ui/InlineEmailCTA.tsx:116` |
| 36 | `px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 bg-primary` | `components/layout/Nav.tsx:32` 的 `PRIMARY_BTN` |

  - 三種高度的標準寫法和原始碼都只差一處：原始碼的 `transition-all` 依 §2.16 改成只過場實際變化的屬性。44 與 36 滑過只變透明度 → `transition-opacity`；40 滑過變透明度、按下（`active:scale-[0.98]`）變縮放 → `transition-[opacity,transform]`。過場時間都沿用預設，畫面不變。原始碼現況：44 為 `inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold text-white bg-primary transition-all hover:opacity-90`；40 為 `shrink-0 px-4 md:px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] bg-primary text-white disabled:opacity-60 whitespace-nowrap`；36 為 `px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 bg-primary`。
  - `active:scale-[0.98]`（按下微縮）**只屬於 40 送出鈕**的現況寫法，保留在這顆上；不是通則，不加到 44、36 或其他按鈕。<!-- src: Task 4 review #10 -->
  - 40 的 `py-2.5` 是 §2.10 的按鈕例外，保留。
  - 送出中的狀態用 `disabled:opacity-60`（§2.4）。
  - 導覽型按鈕要呼叫 `trackCTA`（第 7 章）。
- 禁止：方角或 12px 圓角（`rounded-xl`）；用 `h-*` 定高；inline 上色（`style={{ background: 'var(--color-primary)' }}`）；把 36 或 40 用在獨立 CTA、把 44 塞進導覽列；在深底另做一顆不同顏色的主要按鈕。
- 已接受取捨：深底上主色按鈕的形狀對比約 1.55:1，不處理。
- 現況偏離：見 §10 DATAI-624（13 行 `transition-all`；404、錯誤頁與 /book-a-demo/ 送出鈕的 inline 上色；手機滿版選單底部兩顆用 `h-11` 定高）、DATAI-628（部分導覽型按鈕沒有 `trackCTA`）
<!-- src: atom-btn-primary, atom-btn-inline-submit, atom-btn-font, cross-dark-primary-shape, tok-transition-all, buttons.json A1／A2／A3, #29-9(1), #30-4 -->

### 3.3 滿版藥丸

**規則：按鈕要撐滿卡片或表單寬時，用標準 44 實心藥丸加 `w-full`。**
- 用在哪：卡片底部的單一行動（例：首頁身分卡「See … plan」）、表單送出（例：/book-a-demo/「Get a Personalized Demo」）。
- 寫法：`w-full inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-semibold text-white bg-primary transition-opacity hover:opacity-90`（＝§3.2 標準 44 加 `w-full`）。
- 禁止：方角或 `rounded-xl`；inline 上色；另訂高度。
- 現況偏離：見 §10 DATAI-624（首頁身分卡 3 顆與 /book-a-demo/ 送出 1 顆目前是 `rounded-xl` 方角、inline 上色）
<!-- src: atom-btn-block, page-book-a-demo, buttons.json A7, #29-9(2) -->

### 3.4 外框藥丸（淺底次要）

**規則：淺底的次要行動用白底、1px 主色框、主色字的藥丸；永遠與旁邊的實心按鈕同高；全站只有這一份定義。**
- 用在哪：淺底上、與實心按鈕並排的次要行動（例：導覽列「Book a Demo」、手機滿版選單底部「Book a Demo」）。
- 寫法：以導覽列外框按鈕為準，用扣掉 1px 框線的 `calc()` 內距讓高度與旁邊實心相同（§2.10 例外 3）：

| 旁邊的實心 | 標準寫法 | 取自 |
|---|---|---|
| 36（導覽列） | `px-[calc(1rem-1px)] py-[calc(0.5rem-1px)] rounded-full text-sm font-semibold border border-primary bg-white text-primary transition-colors hover:bg-primary hover:text-white` | `components/layout/Nav.tsx:41-42` 的 `SECONDARY_BTN`（原始碼的 `transition-all` 依 §2.16 改 `transition-colors`） |
| 44 | `inline-flex items-center justify-center px-[calc(1.5rem-1px)] py-[calc(0.75rem-1px)] rounded-full text-sm font-semibold border border-primary bg-white text-primary transition-colors hover:bg-primary hover:text-white` | 由 §3.2 標準 44 的內距各扣 1px 框線推得（DATAI-624 把手機選單外框那顆改成此寫法） |

  - `app/site-base.css` 的 `.pill-btn` 由 DATAI-624 對齊上表（1px 框、600 字重、同高、不用 `transition: all`），之後只留一份定義。
- 禁止：1.5px 框線；字重 500；與旁邊實心按鈕不同高；用在深底（改用 §3.5）。
- 注意：DATAI-624 完成前，現行 `.pill-btn` 是現況偏離，不可當範本（§0 第 4 點）；新寫淺底外框一律用上表字串。
- 現況偏離：見 §10 DATAI-624（`.pill-btn` 與導覽列外框按鈕兩份定義；手機選單外框鈕用 `h-11` 定高；`transition-all`）
<!-- src: atom-btn-secondary-outline, buttons.json A4／A5, #29-9(4), #30-4 -->

### 3.5 深底外框

**規則：深底的次要行動用 `.pill-btn--dark`；只作次要按鈕，與旁邊主要按鈕同高。**
- 用在哪：深色區塊內、與實心按鈕並排的次要行動（例：404 CDN 版「Contact Us」）。
- 寫法：`pill-btn pill-btn--dark`（`.pill-btn--dark` 疊在 `.pill-btn` 上）。顏色由類別提供：透明底、on-dark 字、on-dark .4 框；滑過為主色 .6 底、白字、`--color-primary-light` 框。字級 14／600、框線 1px、高度與旁邊主要按鈕相同——這三點要等 DATAI-624 統一 `.pill-btn` 定義後由類別提供。
- 注意：DATAI-624 完成前，現行類別無法與 44 實心同高（404 CDN 版用 inline 覆寫，屬現況偏離，不可當範本，§0 第 4 點）；這段期間需要新增深底外框時，依 §0 第 2 點先詢問。<!-- src: Task 4 review #14 -->
- 禁止：當主要按鈕；用在淺底；用 inline `style` 覆寫內距或字重。
- 頁尾不放任何按鈕（§5.2）。
- 現況偏離：見 §10 DATAI-624（404 CDN 版用 inline 覆寫內距與字重；`.pill-btn` 的 1.5px 框線與 `transition: all`）
<!-- src: atom-btn-dark-secondary, org-footer, buttons.json A6, #26, #32-1 -->

### 3.6 控制類

**規則：可點的一定是 `<button>`（頁內操作）或 `<a>`（換頁）；控制類不是行動按鈕，不套 §3.2–§3.5 的樣式。**
- 用在哪與寫法：

| 控制 | 標準版 | 規格 |
|---|---|---|
| FAQ 題目列 | `components/pages/brands/BrandFAQ.tsx:79-96` | 見 §4.4；要有 `aria-expanded`＋`aria-controls`（第 8 章） |
| 步驟清單 | `components/pages/publishers/KnowledgeBaseSection.tsx:129-159` | `<button>`，要有 tab 語意與鍵盤操作（第 8 章）；輪播行為見 §5.7 |
| 輪播點 | `components/pages/publishers/KnowledgeBaseSection.tsx:219-228` | 點擊範圍維持 5×5（**明確接受**的例外，可能不符 WCAG 2.5.8）；要有可讀的標籤 |
| 選單開關（漢堡／關閉） | `components/layout/Nav.tsx:293-304`、`:344-352` | `-mr-[11px] p-[11px]`＋22px 圖示，湊成 44×44 點擊範圍（§2.10 例外 1） |
| 下拉鈕（國碼選單） | `app/book-a-demo/BookADemoForm.tsx:52-61` | 外觀同表單欄位（§3.10）；選單內放大鏡圖示 12（§2.17） |
| 首頁流程列 | `components/home/IntentPipeline.tsx:164-190` | 改為真正的 `<button>`，外觀不變；節點用流程圖專用小底座（§3.12） |

- 禁止：可點的 `<div>`（`onClick` 加在 `<div>` 上）；把控制類做成藥丸行動按鈕的樣子。
- 現況偏離：見 §10 DATAI-627（FAQ 與步驟清單缺 aria 狀態與鍵盤操作；首頁流程列是可點的 `<div>`；輪播點缺標籤）、DATAI-624（輪播點 `transition-all`）、DATAI-625（放大鏡 13→12）
<!-- src: cross-aria-disclosure, buttons.json B1–B6, #29-9(6), #29-9(7), #32-5 -->

### 3.7 焦點外框

**規則：全站所有互動元素用同一個焦點外框：導覽列的 `FOCUS_RING`（2px 主色、間距 2px）。**
- 用在哪：連結、按鈕、控制類、表單欄位（包括 email 欄）。
- 寫法：在元素 className 後加上 `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`（`components/layout/Nav.tsx:29` 的 `FOCUS_RING`）。
- 禁止：`outline-none`／`focus:outline-none` 拿掉外框（表單欄位也不行）；只靠框線變色表示焦點；各元件自訂焦點樣式。
- 注意：深底上的主色外框對比要在瀏覽器實測，不足時回報，不要自行換色。
- 現況偏離：見 §10 DATAI-625（目前只有導覽列有；/book-a-demo/ 欄位、國碼搜尋框與 email 欄拿掉外框）
<!-- src: atom-focus, atom-focus-form -->

### 3.8 小標籤（Eyebrow）

**規則：區塊小標籤一律用 `Eyebrow` 元件；換色用元件參數；與 h2 的距離為「緊」。**
- 用在哪：區塊標題（h2）上方的大寫小字；頁尾欄標題。
- 寫法：`<Eyebrow>`（`components/ui/Eyebrow.tsx`，渲染 `.label-eyebrow`：12／600／大寫／字距 0.1em）。顏色依底色選參數：
  - 淺底：預設（主色）——`<Eyebrow>`
  - 深底：`dark`（on-dark）——`<Eyebrow dark>`
  - 痛點段落：`color="var(--color-warn-deep)"`（例：`components/pages/brands/BrandPainSection.tsx:58`；該行的 `className="mb-3"` 不要抄）
  - 頁尾欄標題：`<Eyebrow color="rgba(168,197,195,0.85)">`（`components/layout/Footer.tsx:30`、`:39`、`:46`）。on-dark .85 在階梯上、符合深底文字 ≥.85，而且是用元件參數換色，合規；只用於頁尾欄標題。<!-- src: #33（controller 裁定 #17） -->
  - 與 h2 的距離「緊」：小標籤維持行內元素，**不加 `block`、不加 `mb-*`**（畫面上字到字約 16px）。行內元素上的 `mb-*` 本來就不會生效（§0 第 6 點）。
  - `.label-eyebrow-md`（14px）：現況只用於 /brands/ 深色區塊「Your audience didn't disappear.」這行較大的標示文字（`components/pages/brands/BrandGEOSection.tsx:102`）。
- 禁止：用 className 覆寫顏色（例如 `className="text-on-dark/55"`，靠 tailwind-merge 剃掉預設色才生效，元件一改就失效）；加 `block mb-3` 拉開距離；深底小標籤 α 低於 .85。
- 現況偏離：見 §10 DATAI-625（4 處用 className 覆寫顏色）、DATAI-620（7 處「鬆」）、DATAI-622（深底小標籤 on-dark .55）
<!-- src: atom-eyebrow-section, atom-eyebrow-override-risk, mol-heading-group-eyebrow-gap, tok-on-dark-085 -->

### 3.9 Hero 小膠囊

**規則：深色 Hero 的 h1 上方小膠囊一律用 `.label-eyebrow-pill`。**
- 用在哪：深色 Hero（§5.3）的 h1 上方，以及 404 CDN 版。
- 寫法：`<span className="label-eyebrow-pill mb-4 bg-primary/40 text-on-dark">`（取自 /partnership/ `components/pages/partnership/PartnershipHero.tsx:9`）。1px primary .6 框線由 DATAI-625 補進 `.label-eyebrow-pill` 類別，之後不再另寫框線；類別內距由 DATAI-621 從 6px 改到 4px 刻度。
- 禁止：手寫一份（`inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full`＋inline 底色／字色／框線）；inline `style` 補框線。
- 現況偏離：見 §10 DATAI-625（8 處手寫、類別缺框線）、DATAI-621（類別內距 6px）
<!-- src: atom-eyebrow-pill, tok-alpha-pill-border-06 -->

### 3.10 輸入框

**規則：多欄位表單用方角欄位；單欄 email 用 `InlineEmailCTA` 的藥丸欄。**
- 用在哪：表單欄位用於 /book-a-demo/ 這類多欄位表單；email 欄只透過 `InlineEmailCTA`（§4.7）使用。
- 寫法：
  - 表單欄位：`w-full px-3 py-2 text-sm border border-line rounded-lg focus:border-primary transition-colors`，再加 §3.7 焦點外框（取自 `app/book-a-demo/BookADemoForm.tsx:20`，拿掉原始碼的 `focus:outline-none`）。8px 圓角、1px line 框、14px、聚焦框線變主色。
  - 表單標籤：`block text-xs font-medium text-ink-muted mb-1`（取自 `app/book-a-demo/BookADemoForm.tsx:21`，Tailwind 灰改 `text-ink-muted`）。
  - email 欄：藥丸外框（`rounded-full border border-line bg-white`）、聚焦時 `focus-within:border-primary`、內嵌 §3.2 的 40 送出鈕（`components/ui/InlineEmailCTA.tsx:101-117`）。
  - 錯誤狀態：用 §2.2 錯誤色，依輸入框所在底色選淺底或深底那一個。
  - 提示文字（placeholder）也是文字，不可用 `text-ink-subtle`（§2.1）。
- 禁止：其他圓角或框色；Tailwind 內建灰／紅；拿掉焦點外框；自己再做一個 email 欄。
- 現況偏離：見 §10 DATAI-625（欄位拿掉焦點外框）、DATAI-623（表單標籤與國碼選單用 Tailwind 灰；email 錯誤用 Tailwind 紅）、DATAI-622（email 欄提示文字用 ink-subtle）
<!-- src: atom-input, atom-focus-form, tok-color-tailwind-gray, tok-color-error-red-token, cross-contrast-ink-subtle -->

### 3.11 分隔線

**規則：分隔線 1px；淺底用 `border-line`，深底用 on-dark .12。**
- 用在哪：區塊內或同色相鄰區塊之間的細線、列表列線、Hero 底線。
- 寫法：淺底 `border-line`（例：`border-t border-line`）；深底 on-dark .12，用 class 寫法（例：`border-t border-on-dark/12`，§2.3）。
- 禁止：黑色或白色透明的線（例如 `rgba(0,0,0,0.08)`、`border-white/8`）；1px 以外的粗細。
- 現況偏離：見 §10 DATAI-623（淺底分隔線與三頁 FAQ 列線用黑色透明；頁尾用白 .08；各頁 Hero 底線與深底細線用 inline `rgba(168,197,195,0.12)` 寫法）<!-- src: Task 4 review I2 -->
<!-- src: atom-divider, tok-border-width -->

### 3.12 圖示底座

**規則：圖示底座只有兩種：大號底座（一般卡片）與流程圖專用小底座。**
- 用在哪與寫法：
  - **大號底座**：卡片內的功能圖示。`w-12 h-12 rounded-2xl bg-primary text-white`，內放 22px 圖示（`components/pages/decisive-engine/EngineUseCases.tsx:45`）。/developers/ 規格卡的圖示不加底座（核准例外）。
  - **流程圖專用小底座**：只用於首頁流程圖（`components/home/IntentPipeline.tsx`）每一層的節點。32px 圓形：`w-8 h-8 rounded-full flex items-center justify-center bg-primary-dark`，框線 1px（顏色跟各層，依 §2.3 只用兩基色），內放 `size={15}` 的 `text-on-dark` 圖示。
- 禁止：其他尺寸或形狀的底座（例如 32px 淡底方塊）；把流程圖小底座用在流程圖以外；2px 框線。
- 現況偏離：見 §10 DATAI-625（首頁身分卡用 32px 淡底小方塊，改大號 48；流程圖小底座框線 2px → 1px）、DATAI-623（流程圖各層的金色底與框改兩基色）
<!-- src: atom-icon-badge, atom-icon-badge-none, tok-icon-size, #29-5, #32-6 -->

### 3.13 NumberTicker

**規則：數字需要從 0 滾到目標值的動畫時，用共用元件 `NumberTicker`。**
- 用在哪：卡片數字的計數動畫（例：/content-owners/ 痛點數據 `components/pages/publishers/ZeroClickSection.tsx:51`）。
- 寫法：`<NumberTicker value={…} suffix="…" duration={…} />`（`components/ui/NumberTicker.tsx`；`duration` 預設 1200ms）；字級與顏色由外層決定（§4.5）。
- 禁止：在元件內寫死字級或顏色。
- **例外（核准）**：首頁 Flywheel 的展示大數字用元件內自己的 `CountUp`（`components/home/FlywheelSection.tsx:7`），保留，不改用 `NumberTicker`；只限這一處，不可照抄到其他地方。<!-- src: An 2026-10-15 裁決（Task 4 review #15） -->
- JS 動畫要處理減少動態（第 8 章）。
<!-- src: mol-stat-cell, 附錄 A §3 -->

### 3.14 資訊小膠囊（內容區）

**規則：區塊內容裡的分類、方案類型、適用對象等圓角小標籤，統一為高 24、無框的藥丸。**
- 用在哪：內容區（卡片內、方案卡角落、Hero 底部的功能列等）的資訊標籤。不是按鈕、不可點；Hero h1 上方那顆是 §3.9 的 Hero 小膠囊，不在此列。
- 寫法：字 12／600、內距上下 4・左右 12、高 24：
  - 淺底：`px-3 py-1 rounded-full text-xs font-semibold bg-primary/8 text-primary`
  - 深底：`px-3 py-1 rounded-full text-xs font-semibold bg-on-dark/8 text-on-dark`
- 禁止：加框線；其他高度或內距；小於 12px 的字；白色透明底；inline `style` 上色。
- 現況偏離：見 §10 DATAI-625（尺寸與框線統一）：/decisive-engine/ Hero 底部 5 個（`components/pages/decisive-engine/DecisiveEngineHero.tsx:56`，有框、高 30）、/partnership/ 方案卡 2 個（`components/pages/partnership/PartnershipMembership.tsx:55`、`:117`，有框、高 30）、首頁流程 5 個（`components/home/IntentPipeline.tsx:185`，10px、高 19）、/decisive-engine/ 決策迴圈卡片 12 個（`components/pages/decisive-engine/DecisionLoop.tsx:85`，高 24 但左右內距 10）。這 5 行（`DecisiveEngineHero.tsx:56`、`PartnershipMembership.tsx:55`、`:117`、`IntentPipeline.tsx:185`、`DecisionLoop.tsx:85`）的內距**不由 DATAI-621 往下取**，一律照本節 `px-3 py-1`，由 DATAI-625 處理。`IntentPipeline.tsx:185` 另有：白色 .08 底改 `bg-on-dark/8`（DATAI-623）、10px 字改 12（DATAI-556），三張票的施工順序由 DATAI-625 協調
<!-- src: #33（An 2026-10-15 決策頁 3 q11 選 a）, decisions-2026-10-15c/questions.json -->

### 3.15 內文連結

**規則：段落或清單裡的文字連結依位置分兩種；深底連結目前沒有標準。**
- 用在哪與寫法：
  - **一行一個的清單連結**：`text-primary underline-offset-4 hover:underline`（平常無底線、滑過出現；現有例子 `components/pages/decisive-engine/EngineFAQ.tsx:149`）。
  - **句子中間的連結**：`text-primary underline underline-offset-4 hover:no-underline`（平常就畫底線、滑過消失）。原因：主色字與旁邊灰色內文的對比只有 1.42:1，只靠顏色無法分辨（WCAG 要求 ≥3:1）。
  - **深底上的內文連結**：目前沒有；需要時依 §0 第 2 點詢問 An。
  - 字級與字重跟所在內文，不另設；另加 §3.7 焦點外框。
- 禁止：句中連結不畫底線；把內文連結做成按鈕或膠囊的樣子；自訂其他連結顏色。
- 現況偏離：無。
<!-- src: #33（An 2026-10-15 決策頁 3 q13 選 c）, decisions-2026-10-15c/questions.json -->

---

## 4. Molecules

### 4.1 卡片外框

**規則：卡片＝16px 圓角＋1px 框線，預設扁平。**
- 用在哪：內容區的卡片（規格、方案、步驟、案例等）。「Talk to us」大卡片也屬於卡片家族。
- 寫法：
  - **淺底卡片**：`rounded-2xl border border-line`，底色 `bg-surface` 或 `bg-white`（例：`components/pages/partnership/PartnershipMembership.tsx:37` 的 `rounded-2xl p-8 bg-surface border border-line`）。
  - **深色區塊內的卡片**：`rounded-2xl`、primary .25 底、on-dark .12 框，用 class 寫法（例：`rounded-2xl border border-on-dark/12 bg-primary/25`）；滑過時用 §2.14 的深底卡片 hover 發光。
  - 卡片內層元件 `rounded-xl`、小元件 `rounded-lg`（§2.13）；卡片標題 24（§2.7，DATAI-556 完成前不新增卡片標題）；圖示底座見 §3.12；內距見 §4.2。
- 禁止：其他圓角；自訂 `boxShadow`（§2.14）；深色區塊卡片用 inline `rgba` 寫法或階梯外的透明度。
- 現況偏離：見 §10 DATAI-623（/partnership/、/content-owners/ 深色卡片目前 inline primary .22 底、on-dark .1 框）、DATAI-628（「Talk to us」記錄名稱與畫面文字不同）
<!-- src: mol-card, tok-alpha-off-ladder, buttons.json A8, #29-9(3), #32-4 -->

### 4.2 卡片內距

**規則：卡片內距只有三級：小卡 20、一般 24、大卡 32。**
- 用在哪與寫法：

| 級別 | 寫法 | 現有例子 |
|---|---|---|
| 小卡 20 | `p-5` | 統計數字卡 `ZeroClickSection.tsx:44`、規格卡 `DeveloperSpecs.tsx:42`、分類卡 `ContentOwnerVerticals.tsx:82`、`:144` |
| 一般 24 | `p-6` | 首頁身分卡 `IdentityCards.tsx:86`、`IntentRefinerySection.tsx:33`、`BrandPainSection.tsx:70`、`:141`、`EngineUseCases.tsx:39` |
| 大卡 32 | `p-8` | `DecisionLoop.tsx:59`、方案卡 `PartnershipMembership.tsx:37`、`:97`、`PartnershipResponsibilities.tsx:45`、`:80` |

- 選級時對照上表的同類卡片；拿不準時依 §0 第 2 點詢問。
- 禁止：`p-7`（28）或其他內距。
- 現況偏離：見 §10 DATAI-625（3 處 `p-7` 改 `p-6`：/decisive-engine/ `EngineAdvantages.tsx:43`、/partnership/ `PartnershipEarnings.tsx:38`、/content-owners/ `LayerOverview.tsx:14`）
<!-- src: mol-card-padding, #31-8 -->

### 4.3 區塊標題組

**規則：標題組＝小標籤＋h2（`.section-heading`）＋說明；置中為主，旁邊有圖表時靠左。**
- 用在哪：每個內容區塊的開頭，以及頁尾 CTA（§5.4）。
- 寫法（置中，淺底）：
  ```
  <div className="text-center">
    <Eyebrow>…</Eyebrow>
    <h2 className="section-heading mb-4 text-ink">…</h2>
    <p className="text-base max-w-xl mx-auto text-ink-muted">…</p>
  </div>
  ```
  - 深底：小標籤 `<Eyebrow dark>`、h2 `section-heading text-white mb-4`、說明改 `text-on-dark`。
  - 靠左：旁邊是圖表或流程的雙欄版面（例：`components/home/IntentRefinerySection.tsx:20-26`）；容器不加 `text-center`，說明不加 `mx-auto`。
  - 小標籤 → h2「緊」（§3.8）；h2 → 說明 16（`mb-4`，含頁尾 CTA）；說明寬 576（`max-w-xl`）。
  - 標題組與下方內容（卡片、表格、列表等）的距離 **48**：標題組容器加 `mb-12`（例：`components/pages/brands/BrandFAQ.tsx:54` 的 `text-center mb-12`）。量法：說明文字底部（沒有說明時是 h2 底部）到下方第一個內容元素頂部，手機與桌機相同。
  - 不適用：標題組下方直接接按鈕或 email 欄（32，`mb-8`，§5.4 頁尾 CTA 與 §5.6 AI Mode 入口）；首頁靠左雙欄的 Intent Refinery（`components/home/IntentRefinerySection.tsx`，桌機旁邊是圖表）；法律頁條文小標（§6.5）。<!-- src: #33 -->
- 禁止：h2 不用 `.section-heading` 而自訂字級；h2 下方用 `mb-3`／`mb-2`／`mb-5`；說明用 `max-w-3xl` 或不限寬；小標籤加 `block mb-*`。
- 現況偏離：見 §10 DATAI-620（6 個頁尾 CTA 與一處 h2 → 說明不是 16；16 處說明寬不是 576；7 處小標籤「鬆」；首頁 Flywheel h2 沒用 `.section-heading`）
- 現況偏離：見 §10 DATAI-620（標題組 → 內容距離不是 48 的 11 處：44（`mb-11`）`components/pages/decisive-engine/DecisionLoop.tsx:40`、`DecisiveEnginePageCTA.tsx:22`、`EngineAdvantages.tsx:23`、`EngineComparison.tsx:24`、`EngineUseCases.tsx:23`；40（`mb-10`）`components/pages/developers/DeveloperSpecs.tsx:25`、`components/home/FlywheelSection.tsx:61`、`components/pages/publishers/KnowledgeBaseSection.tsx:103`、`components/pages/publishers/ZeroClickSection.tsx:24`；56（`mb-14`）`components/pages/publishers/LayerOverview.tsx:98`、`components/pages/partnership/PartnershipEarnings.tsx:109`）<!-- src: #33 -->
<!-- src: mol-heading-group, mol-heading-group-left, mol-heading-group-desc-width, mol-heading-group-h2-gap, mol-heading-group-eyebrow-gap, mol-heading-flywheel, #29-3, #30-2 -->

### 4.4 FAQ 單題

**規則：FAQ 每一題照 /brands/ 的寫法；三頁一致。**
- 用在哪：FAQ 區塊（§5.5）內的每一題。
- 寫法（標準版 `components/pages/brands/BrandFAQ.tsx:69-115`）：
  - 列線：每題上下 1px `border-line`。
  - 題目列：`<button className="w-full flex items-center justify-between gap-4 py-5 text-left">`＋§3.7 焦點外框＋`aria-expanded`／`aria-controls`。
  - 題目文字：`text-base font-semibold leading-snug text-ink`（16／600）。
  - 加號：`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 bg-primary/8`，展開時旋轉 45°。
  - 答案：`pb-5 text-sm md:text-base leading-relaxed text-ink-muted`（手機 14、≥768 為 16）。
- 禁止：黑色透明列線；用 `<div>` 當題目列；題目改用其他字級。
- 現況偏離：見 §10 DATAI-623（列線用 `rgba(0,0,0,0.08)`）、DATAI-627（缺 `aria-expanded`／`aria-controls`）、DATAI-625（缺焦點外框）
<!-- src: mol-faq-item, atom-divider, cross-aria-disclosure -->

### 4.5 統計數字

**規則：數字分兩類——展示大數字與卡片數字；方案價格另計。**
- 用在哪與寫法：

| 類別 | 用在哪 | 寫法 |
|---|---|---|
| 展示大數字 | 整個區塊的主角（深色區塊） | `font-black tabular-nums leading-none text-white`＋`letterSpacing: '-0.04em'`；字級用 clamp：首頁 `clamp(2.5rem, 7vw, 4.5rem)`（`components/home/FlywheelSection.tsx:98-100`）、/brands/ `clamp(2rem, 11vw, 9rem)`（`components/pages/brands/BrandGEOSection.tsx:116-118`） |
| 卡片數字・主角 | 數字是卡片的主角（例：/content-owners/ 痛點數據） | 48／700：`text-4xl md:text-5xl font-bold`（`components/pages/publishers/ZeroClickSection.tsx:49`）；痛點段落用 `text-warn` |
| 卡片數字・規格之一 | 數字只是規格之一（例：/developers/ 規格卡） | 20／700：`text-xl font-bold text-primary`（`components/pages/developers/DeveloperSpecs.tsx:50`，省略原始碼排版用的 `mb-1`） |
| 方案價格 | 方案卡價格 | 36／900：`text-4xl font-black text-primary`（`components/pages/partnership/PartnershipMembership.tsx:50`） |

- 計數動畫用 `NumberTicker`（§3.13）。
- 禁止：上表以外的數字字級；用 inline `style` 上色。
- 現況偏離：見 §10 DATAI-623（/content-owners/ 卡片數字用 inline `var(--color-warn)` 上色）
<!-- src: mol-stat-cell, mol-stat-cell-size, tok-tracking -->

### 4.6 展示大字句

**規則：區塊中段的重點句可用 60px 展示大字。**
- 用在哪：區塊中段的一句重點句（例：/brands/「Where is your brand when people ask AI?」、/developers/「Every request builds the intelligence layer.」）。
- 寫法：`text-4xl md:text-6xl font-bold leading-tight`（手機 36、≥768 為 60），淺底 `text-ink`、深底 `text-white`（`components/pages/brands/BrandPainSection.tsx:204`、`components/pages/developers/AILayerSection.tsx:178`）。
- 禁止：拿展示大字當區塊標題（區塊標題用 `.section-heading`）；其他字級。
<!-- src: mol-display-statement, cross-heading-order -->

### 4.7 email 輸入組（`InlineEmailCTA`）

**規則：所有 email 等候名單一律用共用元件 `InlineEmailCTA`。**
- 用在哪：首頁 Hero、首頁頁尾 CTA 與 4 個受眾頁（/brands/、/content-owners/、/developers/、/partnership/）的頁尾 CTA。/decisive-engine/ 例外（§5.4 產品頁變體）。
- 寫法：`<InlineEmailCTA ctaLabel="…" pageName="…" className="mx-auto" />`（`components/ui/InlineEmailCTA.tsx`）。`ctaLabel` 是 `trackCTA` 的位置名稱，沿用該頁既有字串；`pageName` 送給 HubSpot。元件內含藥丸 email 欄（§3.10）、40 送出鈕（§3.2）、錯誤提示與成功狀態。
- 禁止：自己另做 email 欄或送出鈕；改送出鈕高度。
- 現況偏離：見 §10 DATAI-623（錯誤提示用 Tailwind 紅）、DATAI-625（email 欄拿掉焦點外框）、DATAI-622（提示文字用 ink-subtle）、DATAI-624（送出鈕 `transition-all`）
<!-- src: org-page-cta, atom-input, atom-btn-inline-submit -->

---

## 5. Organisms

每個 Organism 標明**標準版**（檔案路徑）。照抄標準版之前，**先看 §10 待修清單有沒有該元件的待修項目**：有待修時，照本章寫的標準寫，不照原始碼現況。

### 5.1 導覽列

- 標準版：`components/layout/Nav.tsx`（全站唯一，不另做）。
- 規格：
  - 高 65px；`fixed`、`z-50`；底色 `bg-white/80` 加 `backdrop-blur-sm`（§2.3 核准例外）；底線 1px `border-line`。
  - 連結 14／500 `text-ink-muted`、滑過主色；目前頁 14／600 主色。
  - 入口排法（#26）：≥1024 右側為 [Book a Demo 外框 36｜Try AI Mode 實心 36]（主按鈕在最右）；<1024 在 Logo 與漢堡鈕之間只放實心 Try AI Mode 36；中間不放 AI Mode 文字連結。
  - 滿版選單（`z-[60]`）：上方 Logo＋關閉鈕、連結逐列 `border-line` 分隔、底部 [Book a Demo 外框 44｜Try AI Mode 實心 44] 等寬並排。
  - 追蹤位置：桌機 `nav`、手機導覽列 `nav_mobile_header`、滿版選單 `nav_mobile`。
- 技術約束（改導覽列必讀）：滿版選單必須是 `<nav>` 的**兄弟元素**（`<nav>` 帶 transform／backdrop-blur，會困住 fixed 子元素）；選單內不可含 `<nav>`／`<header>`（AI Mode 頁以 `header, nav` 找導覽列）；導覽列高度維持 65px；斷點一律 `matchMedia('(min-width: 64rem)')`。選單的 dialog、焦點陷阱、Esc、捲動鎖等行為見 #26 與第 8 章。
- 禁止：在 Hero 或頁面其他位置另放 Try AI Mode 入口；改變按鈕順序。
- 現況偏離：見 §10 DATAI-623（底線用 Tailwind 灰 `border-gray-100/50`）、DATAI-624（`transition-all`；選單底部兩顆用 `h-11`）
<!-- src: org-nav, org-nav-entry, #26 -->

### 5.2 頁尾

- 標準版：`components/layout/Footer.tsx`。
- 規格：深色（`.section-dark`）；品牌區＋ Solutions／Resources／Legal 三欄；欄標題用 `<Eyebrow color="rgba(168,197,195,0.85)">`（合規，見 §3.8）；連結 14px on-dark、滑過白色；目前頁白色 600；**AI Mode 連結固定在 Partnership 與 Contact 之間**；寬度跟各頁內容（首頁 1152、內頁 1024，§2.12）。
- 禁止：放任何按鈕（包括 Try AI Mode 與外框次要按鈕）；寫死白色。
- 現況偏離：見 §10 DATAI-619（寬度固定 1152）、DATAI-623（目前頁連結寫死 `#fff`；分隔線白 .08；LinkedIn 滑過白 .1）、DATAI-621（LinkedIn 圖示鈕 `p-1.5`）
<!-- src: org-footer, tpl-container-footer, #7, #26 -->

### 5.3 Hero

- 標準版：以 /brands/（`app/brands/page.tsx:28-41`）為準；/content-owners/、/book-a-demo/ 結構相同（/book-a-demo/ 的 h1 少 `text-balance`，屬現況偏離）。Hero 沒有共用元件，各頁自己寫，照標準版的結構。
- 規格：深色、上 128／下 48、底部 1px on-dark .12 細線、768 容器、小膠囊＋h1＋說明，置中：
  ```
  <div className="section-dark pt-32 pb-12 text-center border-b border-on-dark/12">
    <div className="max-w-3xl mx-auto px-6">
      <span className="label-eyebrow-pill mb-4 bg-primary/40 text-on-dark">…</span>
      <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4 text-balance">…</h1>
      <p className="text-base max-w-xl mx-auto text-on-dark">…</p>
    </div>
  </div>
  ```
  （h1 取自 `app/brands/page.tsx:36`；底線依 §2.3 改 class 寫法；小膠囊見 §3.9。）
  - /book-a-demo/ 的 Hero 容器為 672（`max-w-2xl`，§2.12）。
  - **例外（核准）**：/decisive-engine/ Hero 文字區 768，底部膠囊列維持 1024（`max-w-5xl`）。
  - **首頁 Hero 是首頁專屬**（`components/home/HeroSection.tsx`：白底、標準淺底光暈、h1 另加 ≤420px 27px 與 `tracking-tight`），不可照抄到其他頁。
- 禁止：其他上下距；省略底部細線；h1 用其他字級；Hero 內放 Try AI Mode。
- 現況偏離：見 §10 DATAI-626（/developers/、/partnership/、/decisive-engine/ 的下距、細線與 h1；/privacy-policy/、/terms-of-service/、/book-a-demo/ 的 h1 少 `text-balance`；404／錯誤頁標題）、DATAI-625（小膠囊手寫）、DATAI-623（inline `style` 上色；底線用 inline `rgba` 寫法）<!-- src: Task 4 review I2, I3 -->
<!-- src: org-hero-structure, org-hero-h1-standard, org-hero-home, org-hero-h1-h2-clash, page-book-a-demo, #26, #29-2, #31-9 -->

### 5.4 頁尾 CTA

- 標準版：`components/pages/brands/BrandPageCTA.tsx`（6 頁中的 5 頁與首頁同一結構）。
- 規格：深色、上下 64、置中、標題組＋`InlineEmailCTA`：
  ```
  <section className="section-dark py-16 text-center">
    <div className="max-w-5xl mx-auto px-6">
      <h2 className="section-heading text-white mb-4">…</h2>
      <p className="text-base max-w-xl mx-auto mb-8 text-on-dark">…</p>
      <InlineEmailCTA ctaLabel="…" pageName="…" className="mx-auto" />
    </div>
  </section>
  ```
  （首頁容器 `max-w-6xl`。）
  - **產品頁變體**（/decisive-engine/，`components/pages/decisive-engine/DecisiveEnginePageCTA.tsx:55-68`）：email 欄改成連到 /book-a-demo 的 §3.2 標準 44 實心「Contact Us」，必須呼叫 `trackCTA`。
- 禁止：在 `.section-dark` 上再疊 `bg-primary-dark`；自做 email 欄。
- 現況偏離：見 §10 DATAI-620（h2 → 說明目前 12、說明不限寬）、DATAI-628（產品頁「Contact Us」沒有 `trackCTA`）、DATAI-623（/developers/ 多疊 `bg-primary-dark`）、DATAI-624（產品頁按鈕寫法）
<!-- src: org-page-cta, org-de-cta-form, mol-heading-group-h2-gap, cross-trackcta -->

### 5.5 FAQ 區塊

- 標準版：`components/pages/brands/BrandFAQ.tsx`（與 `ContentOwnerFAQ.tsx`、`EngineFAQ.tsx` 三份一致）。
- 規格：白底 `section-white pt-8 pb-16 lg:pb-20`（§2.11；**接在深色區塊之後時，上方改用一般區塊距離**）；1024 容器；置中標題組「FAQ」＋「Common questions.」（`.section-heading`）；每題照 §4.4。
- **必帶 FAQPage JSON-LD**（`components/pages/brands/BrandFAQ.tsx:35-49`）。
- 照抄標準版時注意：`BrandFAQ.tsx:60` 的 `<Eyebrow className="mb-3">` 不要抄（§3.8，小標籤不加 `mb-*`）。
- 禁止：沒有 JSON-LD 的 FAQ；自訂題目樣式。
- 現況偏離：見 §10 DATAI-619（/decisive-engine/ FAQ 緊接深色區塊、上方只有 32）、DATAI-623（列線）、DATAI-627（aria）、DATAI-625（焦點外框）
<!-- src: org-faq-group, org-faq-top-after-dark, cross-faq-jsonld -->

### 5.6 AI Mode 入口區

- 標準版：`components/ui/PlaygroundCTASection.tsx`（/content-owners/ 與 /brands/ 共用，不複製）。
- 規格：兩種放法，用 `variant` 參數選，不另做第二份：
  - `variant="standalone"`（預設）：自己是一個白底區塊，背景用 §2.4 標準淺底光暈（/content-owners/）。
  - `variant="embedded"`：只輸出內容，放進既有的 `.section-dark` 區塊（/brands/ 方案區塊第四段）。放在淺底會變白字白底，禁止。
  - 標題組照 §4.3；按鈕是 §3.2 標準 44，呼叫 `trackCTA(ctaLabel, trackingPosition)`。
- 禁止：用 className 覆寫小標籤顏色；embedded 放在淺底。
- 現況偏離：見 §10 DATAI-622（深底小標籤 on-dark .55）、DATAI-625（小標籤用 className 覆寫）、DATAI-620（小標籤「鬆」、說明寬）、DATAI-619（區塊上下距）
<!-- src: org-playground-entry -->

### 5.7 自動輪播

- 標準版：首頁流程圖（`components/home/IntentPipeline.tsx:160-205`）。
- 規格：自動切換；**滑鼠移上暫停、點擊後永久停止**、捲出畫面時不輪播；開啟減少動態時停止自動切換（第 8 章）。/content-owners/ 步驟面板要與首頁流程一致。
- 禁止：點擊後重新開始計時；用固定高度裁切內容。
- 現況偏離：見 §10 DATAI-629（/content-owners/ 步驟面板點擊後會繼續輪播；說明最後一行被固定高度切掉）、DATAI-627（輪播未處理減少動態；首頁流程列不是 `<button>`）
<!-- src: org-home-pipeline-carousel, page-content-owners, cross-reduced-motion-js -->

### 5.8 其他 Organism

| 元件 | 檔案 | 角色 | 待修 |
|---|---|---|---|
| Logo 跑馬燈 | `components/home/LogoMarquee.tsx` | 首頁「Trusted by」標誌捲動列，用 `.animate-marquee`，左右淡出遮罩 | DATAI-623（遮罩寫死 `#FFFFFF`）、DATAI-621（`mb-1.5`） |
| Flywheel | `components/home/FlywheelSection.tsx` | 首頁專屬深色區塊，含展示大數字（§4.5） | DATAI-620（h2 改 `.section-heading`）、DATAI-623（金色短線）、DATAI-619（手機上下距） |
| 世界地圖點陣 | `components/home/WorldMapDots.tsx` | 首頁 Hero 背景點陣，訊號點用 `--color-primary-light`、擴散圈用 `.ping-ring` | DATAI-627（`setInterval` 未處理減少動態） |
| 預約表單 | `app/book-a-demo/BookADemoForm.tsx` | /book-a-demo/ 多欄位表單：欄位 §3.10、送出 §3.3；送出記錄 `contact_form_submit` 事件（維持，不用 `trackCTA`） | DATAI-624（送出鈕）、DATAI-623（Tailwind 灰）、DATAI-625（焦點外框、放大鏡 12）、DATAI-621（`gap-2.5`、`ml-0.5`） |
| 換頁捲回頂端 | `components/layout/ScrollToTop.tsx` | 換頁時捲回頁首，沒有畫面 | — |

- 規則：上表元件各只有一份，需要相同功能時重用，不另寫；改動前先看「待修」欄與 §10。
<!-- src: tok-gradient, tok-color-hex-residue, tok-spacing, mol-heading-flywheel, page-book-a-demo, cross-trackcta, #32-1 -->

---

## 6. Templates

### 6.1 共同規則

**規則：頁面以深白交替排列；不用淺灰交替。**
- 用在哪：所有頁面的區塊順序（AI Mode 頁除外）。
- 寫法：
  - 深色 Hero 開頭、深白交替、深色頁尾 CTA 收尾；FAQ 白底。
  - 同色區塊相鄰時，可用細線區隔（淺底 `border-line`、深底 on-dark .12，§3.11），也可不區隔。
  - 深色區塊用 `.section-dark`、白色區塊用 `.section-white`；上下距見 §2.11、容器見 §2.12；導覽列與頁尾由 `app/layout.tsx` 提供。
- 禁止：用 `.section-light`（淺灰）做區塊交替。
- 現況偏離：見 §10 DATAI-619（/decisive-engine/ 淺灰交替改白）
<!-- src: tpl-order-alternation, tpl-order-content-owners, tpl-order-de-surface, #29-7 -->

### 6.2 受眾頁（照 /brands/）

- 標準版：`app/brands/page.tsx`。
- 區塊順序：深 Hero（§5.3）→ 白 痛點 → 深 方案（含 AI Mode 入口 `variant="embedded"`）→ 白 比較＋細線＋FAQ（§5.5）→ 深 頁尾 CTA（§5.4）。
- /content-owners/、/developers/、/partnership/ 屬同一類；/content-owners/ 的連續同色區塊已接受（同色相鄰可細線或不區隔）。
- 禁止：深色 Hero 以外的開頭；淺灰區塊；省略頁尾 CTA；有 FAQ 卻不帶 JSON-LD。
- 現況偏離：見 §10 DATAI-619（區塊上下距）、DATAI-626（/developers/、/partnership/ Hero）
<!-- src: tpl-order-alternation, tpl-order-content-owners, page-brands -->

### 6.3 產品頁（照 /decisive-engine/，改白底後）

- 標準版：`app/decisive-engine/page.tsx`（DATAI-619 把淺灰區塊改白之後）。
- 區塊順序：深 Hero（膠囊列 1024 例外）→ 白 決策迴圈 → 白 優勢 → 白 比較 → 白 使用案例 → 深 結果區 → 白 FAQ（上方用一般區塊距離）→ 深 頁尾 CTA（產品頁變體「Contact Us」，§5.4）。
- 連續白底之間可用細線區隔或不區隔（§6.1）。
- 禁止：淺灰交替；FAQ 緊貼深色區塊（上方只留 32）；頁尾 CTA 改回 email 欄（產品頁用「Contact Us」變體）。
- 現況偏離：見 §10 DATAI-619（淺灰交替、FAQ 上方距離、區塊上下距）、DATAI-626（Hero）、DATAI-628（頁尾按鈕追蹤）
<!-- src: tpl-order-de-surface, page-decisive-engine, org-faq-top-after-dark, org-de-cta-form -->

### 6.4 首頁（首頁專屬，不可照抄）

- 標準版：`app/page.tsx`。
- 區塊順序：白 Hero（`HeroSection`）→ 白 身分卡 → 深 Flywheel → 白 Intent Refinery → 深 頁尾 CTA（白／白／深／白／深）。
- 首頁專屬項目：白底全螢幕 Hero 與其 h1 寫法（≤420px 27px、`tracking-tight`）、內容與頁尾 1152（`max-w-6xl`）、標準淺底光暈的首頁 Hero 用法。這些只限首頁，其他頁不可用。
- 禁止：把首頁的 1152 容器、白底全螢幕 Hero 或白／白開頭用在其他頁。
- 現況偏離：見 §10 DATAI-619（手機上下距 80 → 64）、DATAI-620（Flywheel h2）、DATAI-625（身分卡圖示底座）、DATAI-624（身分卡按鈕）、DATAI-628（身分卡按鈕追蹤）、DATAI-556（身分卡標題 18 → 24）
<!-- src: tpl-order-home, tpl-container-home-6xl, org-hero-home, page-home -->

### 6.5 法律頁

- 標準版：`app/privacy-policy/page.tsx`、`app/terms-of-service/page.tsx`。
- 結構：深 Hero（§5.3）→ 白 條文區（一般區塊上下距；容器 768 `max-w-3xl`）。
- 條文小標 20：`text-xl font-bold mb-3 text-ink`；條文內文 14：`text-sm leading-relaxed text-ink-muted`。
- 禁止：條文小標用 `.section-heading`；inline `style` 上色。
- 現況偏離：見 §10 DATAI-623（約 80 處 inline `var()` 上色）、DATAI-619（條文區上下距）
<!-- src: page-legal, tok-color-two-syntaxes -->

### 6.6 表單頁

- 標準版：`app/book-a-demo/page.tsx`。
- 結構：深 Hero（容器 672 `max-w-2xl`）→ 白 表單區（一般區塊上下距；容器 512 `max-w-lg`）。表單欄位 §3.10、送出用滿版藥丸 §3.3。
- 禁止：表單區用其他容器寬；方角送出鈕；自做另一套欄位樣式。
- 現況偏離：見 §10 DATAI-619（表單區上下距）、DATAI-624（送出鈕）、DATAI-623、DATAI-625
<!-- src: page-book-a-demo, tpl-container-widths -->

### 6.7 404／錯誤頁

- 標準版：`app/not-found.tsx`＋`components/not-found/NotFoundContent.tsx`、`app/error.tsx`。
- 結構：單一深色區塊置中：`flex-1 section-dark flex items-center justify-center text-center px-6 pt-32 pb-16`；容器 512（`max-w-lg`，一般 404 與錯誤頁）或 576（`max-w-xl`，404 CDN 版）。
  - 大字「404」／「!」：`text-7xl font-bold`，**白色**。
  - 標題：`text-4xl md:text-5xl font-bold text-white`（同 Hero 48）。
  - 說明：`text-base mb-8 text-on-dark`。
  - 按鈕：§3.2 標準 44 實心；CDN 版另有 §3.5 深底外框。
  - 兩個 404 版本以 `.nf-cdn`／`.nf-default` 切換（只用於 404）。
- 禁止：大字用主色；標題用 36；按鈕 inline 上色。
- 現況偏離：見 §10 DATAI-626（標題目前 36）、DATAI-622（大字目前主色）、DATAI-624（按鈕寫法、深底外框 inline 覆寫）、DATAI-628（404 按鈕追蹤）
<!-- src: page-404, page-error, #31-1 -->

### 6.8 AI Mode 頁

- `/ai-mode-playground/` 是例外，版型、字級與間距不可照抄、不計入任何慣例（§0 第 3 點）；對齊另由 DATAI-630 處理。
<!-- src: tpl-ai-mode, #20, #28 -->

---

## 7. 行為契約與技術約束

本章寫的是畫面以外、改程式時一定要守的約定。違反時畫面可能看起來正常，但追蹤、搜尋收錄或樣式會無聲失效。

### 7.1 CTA 點擊追蹤（`trackCTA`）

**規則：每個導覽型 CTA（點了會換頁或前往預約頁的按鈕與卡片）都要呼叫 `trackCTA(label, position)`。**
- 用在哪：行動按鈕（§3.2、§3.3）、外框按鈕（§3.4、§3.5）、「Talk to us」這類可點的大卡片。
- 寫法：在 `onClick` 呼叫 `trackCTA`（`lib/analytics.ts:28`，送出 GA4 `click_cta` 事件，參數 `cta_label`／`cta_position`／`page_audience`）。
  - `label`＝**畫面上的按鈕文字**（例：`trackCTA('Book a Demo', 'nav')`，`components/layout/Nav.tsx:267`）。
  - `position`＝按鈕位置，沿用既有命名（例：導覽列 `nav`、手機導覽列 `nav_mobile_header`、滿版選單 `nav_mobile`、/content-owners/ 區塊 `content_owners_section`）；共用元件由參數傳入（例：`PlaygroundCTASection` 的 `trackingPosition`、`InlineEmailCTA` 的 `ctaLabel`）。
- 不適用（維持現狀）：`InlineEmailCTA` 只在送出成功後記錄（`components/ui/InlineEmailCTA.tsx:48`）；/book-a-demo/ 表單送出記錄 `contact_form_submit` 事件；錯誤頁「Try again」是重試，不是 CTA。
- 禁止：導覽型 CTA 不呼叫 `trackCTA`；`label` 與畫面文字不同。
- 現況偏離：見 §10 DATAI-628（首頁身分卡 3 顆、/decisive-engine/ 頁尾「Contact Us」、404 三顆沒有 `trackCTA`；「Talk to us」卡片記錄成「Get Started」）
<!-- src: cross-trackcta, lib/analytics.ts:27, #26, #31-11 -->

### 7.2 FAQ 結構化資料

**規則：每個 FAQ 區塊都要輸出 FAQPage JSON-LD。**
- 用在哪：所有 FAQ 區塊（§5.5）。
- 寫法：照 `components/pages/brands/BrandFAQ.tsx:35-49`，在區塊內放 `<script type="application/ld+json">`，`@type: 'FAQPage'`，`mainEntity` 由畫面渲染用的**同一個題目陣列**產生（每題 `Question`＋`acceptedAnswer`），確保結構化資料與畫面文字一致。
- 禁止：沒有 JSON-LD 的 FAQ；JSON-LD 另寫一份與畫面不同的題目或答案。
- 現況：三個 FAQ（/brands/、/content-owners/、/decisive-engine/）都已符合。
<!-- src: cross-faq-jsonld, org-faq-group -->

### 7.3 新頁面進 sitemap 與 llms.txt

**規則：新增頁面時，同時加進 `public/sitemap.xml` 與 `public/llms.txt`。**
- 寫法：
  - `public/sitemap.xml`：加一個 `<url>`，`<loc>` 用 `https://www.mlytics.com/<路徑>/`（結尾斜線，與既有項目一致）。
  - `public/llms.txt`：加一行 Markdown 連結 `- [名稱](https://www.mlytics.com/<路徑>)：一句說明`，放在對應段落。
- CI 把關：`__tests__/public/llms-sitemap.test.ts` 檢查 sitemap 裡的每一頁（首頁除外）都在 llms.txt 有連結，漏加會讓 CI 失敗。
- 注意：**頁面有沒有加進 sitemap 本身沒有自動檢查**，要人工確認（§9 檢查表）。
- 未定案：現有 /book-a-demo/、/privacy-policy/、/terms-of-service/ 都不在 sitemap；哪些類型的新頁面可以不列入 sitemap 尚未決定，遇到時依 §0 第 2 點詢問。<!-- src: 文件未定案清單 #18 -->
<!-- src: 附錄 A §7, __tests__/public/llms-sitemap.test.ts, #2, #8 -->

### 7.4 導覽列的技術約束

**規則：改 `components/layout/Nav.tsx` 前必讀；以下每一條違反都會讓導覽列或 AI Mode 頁壞掉。**
- 滿版選單必須是 `<nav>` 的**兄弟元素**：`<nav>` 帶 transform／`backdrop-blur`，會成為 fixed 子元素的定位容器，選單會被困在 65px 導覽列內。
- 選單內不可含 `<nav>`／`<header>`：AI Mode 頁的 `useNavOffset` 以 `header, nav` 找導覽列。
- 導覽列高度維持 65px。
- 桌機斷點一律用 `matchMedia('(min-width: 64rem)')`（`Nav.tsx:27` 的 `DESKTOP_QUERY`），與 Tailwind `lg:` 一致。
- 選單的行為：dialog／`aria-modal`、開啟時焦點到關閉鈕、關閉回漢堡鈕、Tab 焦點陷阱、Esc 關閉、背景捲動鎖＋`inert`、換頁與放大到桌機寬度自動關閉、減少動態時不淡入淡出、淡出期間不可點、關閉後 250ms 內忽略重開。改動後這些行為都要保留。
- 入口排法與追蹤位置見 §5.1。
- 禁止：把選單移進 `<nav>`；在選單內加 `<nav>`／`<header>`；改導覽列高度；另寫一套斷點判斷。
<!-- src: #26, org-nav, org-nav-entry -->

### 7.5 Tailwind v4 與樣式的無聲失效陷阱

**規則：以下寫法不會報錯，但樣式會被靜默丟棄或被蓋掉；寫完一律在瀏覽器確認 computed style。**
1. **自訂 token 撞 Tailwind 內建色名**：例如自訂 `--color-amber` 會無聲失效，所以痛點色叫 `warn`（`app/site-base.css:25-28` 註解）。新 token 不可用 Tailwind 內建色系名稱。
2. **字級 token 必須叫 `--text-*`**：`--font-size-*` 不會產生 class（§2.8，DATAI-556 處理）。
3. **自訂 class 內的 `text-wrap` 要用 `@apply`**：例如 `.section-heading` 寫 `@apply text-balance;`（`app/site-base.css:121`），不要手寫 `text-wrap` 屬性。
4. **`Eyebrow` 靠 `cn()`（tailwind-merge）合併 class**（`lib/utils.ts`）：用 className 覆寫顏色會靠 tailwind-merge 剃掉預設色才生效，元件一改就失效。換色一律用元件參數（§3.8）。
5. **未分層的自訂 class 會蓋過 Tailwind utilities**：`app/site-base.css` 的 `.pill-btn` 等類別不在 `@layer` 內，同一元素上的 Tailwind 內距 class 會被它蓋掉（`components/layout/Nav.tsx:34-40` 註解）。不要在 `.pill-btn` 上疊內距 utilities 調高度（§3.4、§3.5）。
- 現況偏離：見 §10 DATAI-556（字級 token 失效）、DATAI-625（4 處小標籤用 className 覆寫顏色）、DATAI-624（`.pill-btn` 定義）
<!-- src: 附錄 A §7, tok-font-size-token-broken, atom-eyebrow-override-risk, atom-btn-secondary-outline -->

### 7.6 量測以瀏覽器為準

**規則：間距、字級、顏色、對比一律在瀏覽器量 computed style 與畫面，不用 class 推算。**
- 用在哪：寫新區塊、驗收修正票、回報偏離。
- 寫法：在 375／768／1280 三種寬度量；間距量「字到字」或「元素邊到元素邊」的實際距離。
- 典型陷阱：行內小標籤（`<Eyebrow>` 是 `<span>`）上的 `mb-*` 不會產生間距；`block mb-3` 才會（所以標題組的「鬆」來自 `block`，§3.8）。
- 禁止：只看原始碼的 class 就判定符合標準。
<!-- src: #29 方法學, mol-heading-group-eyebrow-gap -->

### 7.7 CSS 入口檔與掃描範圍

**規則：token 與共用類別只寫在 `app/site-base.css`；`app/globals.css` 只放 import 與掃描設定。**
- 三個檔案的分工：
  - `app/site-base.css`：所有 token（`@theme`、`:root`）、共用類別（§2.18）、`body`、捲軸、減少動態規則。
  - `app/globals.css`：網站的 CSS 入口，只做 `@import "tailwindcss"`、`@import "./site-base.css"`，以及用 `@source not` 排除 `DESIGN.md`、`stories/`、`.storybook/`、`*.stories.tsx`、`*.mdx`。
  - `.storybook/storybook.css`：Storybook 的入口，同樣 import `app/site-base.css`，另外用 `@source` 掃描 story 檔與 `DESIGN.md`。
- 為什麼排除：Tailwind v4 會掃描所有未被 gitignore 的檔案，文件與 story 裡的範例 class 會流進網站 CSS，讓網站外觀在沒改任何頁面的情況下改變。所以文件與 Storybook 的 class 只進 Storybook 的 CSS，不進網站 CSS。
- 寫法：
  - 新增或修改 token、共用類別：改 `app/site-base.css`。
  - 新增一種文件或 story 檔案類型：同時在 `app/globals.css` 加 `@source not` 排除，並在 `.storybook/storybook.css` 加 `@source`。
  - `storybook-static/`（Storybook 建置輸出）必須留在 `.gitignore`，否則會被網站 CSS 掃到。
- 注意：有 5 處程式註解仍寫「globals.css」（`components/not-found/NotFoundContent.tsx:16`、`components/not-found/variantScript.ts:19`、`components/layout/Nav.tsx:34`、`components/pages/ai-mode-playground/AiModePlayground.tsx:87`、`components/pages/ai-mode-playground/ExperiencePanel.module.css:339`），規則實際都已在 `app/site-base.css`，讀到時以 `site-base.css` 為準。
- 禁止：在 `app/globals.css` 寫任何樣式規則；在文件或 story 用網站沒有的 class 卻不排除掃描。
<!-- src: #32, app/globals.css, .storybook/storybook.css, assumption-check 第 2 輪 #3（storybook-static 實測） -->

### 7.8 Storybook

**規則：Storybook 只在本機看元件的樣子；新增共用元件要同時處理 Storybook。**
- Storybook **不經過 `app/layout.tsx`**：沒有導覽列、頁尾、GA 與 HubSpot 追蹤、全站 JSON-LD。依賴這些的元件，在 story 裡要自己提供需要的外層。好處是在 Storybook 點按鈕不會送出追蹤。
- 新增共用元件時：
  - 沒有待修項目 → 同時加 story。
  - 有待修項目 → 列入 Storybook 的待修元件清單（`stories/_data/registry.ts`），寫上修正票號；修正票完成後再換成 story。
- CI 會渲染每一個 story 並跑無障礙檢查（`__tests__/design-system/stories-render.test.tsx`），任一 story 出錯會讓 CI 失敗。
- 規則以本文件為準（§0 第 5 點）。
<!-- src: #30, 附錄 A §7 -->

---

## 8. 無障礙

### 8.1 文字對比

**規則：文字對比達 WCAG AA。**
- 用在哪：所有文字，包括提示文字（placeholder）與 SVG 圖表文字。
- 寫法：
  - 一般文字 ≥4.5:1；大字（24px 以上，或 18.66px 以上粗體）≥3:1。
  - 深底（`--bg-dark`）上的淡綠字透明度 ≥.85（§2.3）。
  - `text-ink-subtle` 不可用於文字（§2.1），淡一階的文字用 `text-ink-muted`。
  - 主色底上的文字一律白色（§2.3）。
  - 疊在半透明卡片上的文字，用實際合成後的背景色計算對比。
- 禁止：只靠目測判斷對比；用透明度把文字調淡到低於上述門檻。
- 現況偏離：見 §10 DATAI-622
<!-- src: cross-contrast-list, cross-contrast-ink-subtle, tok-on-dark-085, cross-contrast-card-number -->

### 8.2 鍵盤焦點

**規則：所有互動元素用全站同一個焦點外框，表單欄位也要有。**
- 寫法與禁止：見 §3.7。深底上的外框對比要實測，不足時回報。
- 現況偏離：見 §10 DATAI-625
<!-- src: atom-focus, atom-focus-form -->

### 8.3 語意與鍵盤操作

**規則：可點的元素一定是 `<button>`（頁內操作）或 `<a>`（換頁），並讓讀屏軟體知道狀態。**
- 用在哪與寫法：
  - 可展開的題目（FAQ）：題目列是 `<button>`，加 `aria-expanded`（展開狀態）＋`aria-controls`（指向答案區塊的 id）。
  - 步驟清單（分頁式）：用 tab 語意（`role="tab"`、`aria-selected` 標記目前選中項），可用方向鍵切換。
  - 輪播點：要有可讀的標籤（例：第幾張）。
  - 滿版選單：dialog 語意與焦點管理（§7.4）。
  - 句中連結要畫底線，不可只靠顏色分辨（§3.15）。
- 禁止：`onClick` 加在 `<div>`／`<span>` 上；可展開或可切換的元件沒有狀態屬性。
- 現況偏離：見 §10 DATAI-627（FAQ 與步驟清單缺狀態屬性與鍵盤操作；首頁流程列是可點的 `<div>`；輪播點缺標籤）
<!-- src: cross-aria-disclosure, #29-9(7), #26, #33 -->

### 8.4 減少動態

**規則：使用者開啟「減少動態效果」時，動畫要停。**
- CSS：`app/site-base.css` 的 `prefers-reduced-motion` 規則已把全站 CSS 動畫與過場壓到 0.01ms，不需另寫。
- JS 動畫要自行處理，分三類：
  1. **位移**（上移、縮放等）：要停。
  2. **淡入**：framer-motion 的全站設定只停位移、不停淡入，淡入要另外處理。
  3. **`setInterval` 自動輪播**（Hero 標題輪播、流程與步驟輪播、地圖光點）：停止自動切換。
  - 現有範例：導覽列滿版選單用 framer-motion 的 `useReducedMotion`（`components/layout/Nav.tsx:64`），減少動態時不淡入淡出。
- 禁止：新增 JS 動畫卻不處理減少動態。
- 現況偏離：見 §10 DATAI-627（34 個使用 framer-motion 的檔案只有導覽列處理；4 個 `setInterval` 輪播未處理）
<!-- src: cross-reduced-motion-js, tok-motion -->

### 8.5 點擊範圍

**規則：可點元素的點擊範圍至少 24×24。**
- 寫法：小圖示按鈕用內距補足點擊範圍（例：手機選單開關 `p-[11px]`＋22px 圖示＝44×44，§2.10 例外 1）。
- 例外（已明確接受）：輪播點維持 5×5（可能不符 WCAG 2.5.8，§3.6）。
- 禁止：新增小於 24×24 的可點元素。
<!-- src: 附錄 A §8, #29 明確接受的取捨 -->

### 8.6 已接受的取捨

以下兩點已知不理想，An 已明確接受，不需回報、也不要自行修正：
- 深底上主色按鈕的形狀對比約 1.55:1（§3.2）。
- 桌機 h1 與 h2 同為 48（§2.7）。
<!-- src: cross-dark-primary-shape, #29 明確接受的取捨, #26 -->

---

## 9. 新增頁面 SOP

**規則：新頁面照第 6 章的骨架組，用第 3–5 章既有的元件，上線前逐項跑完檢查表。**

1. **選骨架**（第 6 章）：受眾頁照 /brands/（§6.2）、產品頁照 /decisive-engine/（§6.3）、法律頁（§6.5）、表單頁（§6.6）。首頁（§6.4）與 AI Mode 頁（§6.8）**不可當骨架**。
2. **組區塊**：Hero（§5.3）、標題組（§4.3）、卡片（§4.1、§4.2）、FAQ（§5.5）、頁尾 CTA（§5.4）都用既有寫法或共用元件；照抄標準版前先看 §10 有沒有待修項目。
3. **文件沒寫到的**：停下，依 §0 第 2 點詢問，確認後才做，做完把新規則補進本文件。
4. **上線前檢查表**：
   - [ ] metadata：頁面 export `metadata`，含 `title`、`description`、`openGraph`（`title`／`description`／`url`）、`twitter`、`alternates.canonical`（照 `app/brands/page.tsx:9-22`；`title` 會自動加上 `| Mlytics Cortex`）。
   - [ ] sitemap：`public/sitemap.xml` 已加入（§7.3；沒有自動檢查）。
   - [ ] llms.txt：`public/llms.txt` 已加入連結（§7.3；CI 會擋）。
   - [ ] FAQ JSON-LD：有 FAQ 就有 FAQPage JSON-LD（§7.2）。
   - [ ] `trackCTA`：每個導覽型 CTA 都有，`label` 與畫面文字一致（§7.1）。
   - [ ] 375／768／1280 三種寬度都沒有水平捲動。
   - [ ] 對比：文字對比達 AA（§8.1），在瀏覽器實測。
   - [ ] 焦點：用 Tab 鍵走過所有互動元素，每一個都看得到焦點外框（§8.2）；可展開／可切換元件有狀態屬性（§8.3）。
   - [ ] 減少動態：開啟系統「減少動態效果」後，JS 動畫與輪播都停（§8.4）。
   - [ ] 測試：`npx vitest run --dir ./__tests__` 全部通過，`npm run build` 成功。
<!-- src: 附錄 A §9, app/brands/page.tsx, app/layout.tsx -->

---

## 10. 例外與待修清單

### 10.1 核准例外

以下是 An 核准、**只限列出的位置**的例外。不可延伸到其他地方；需要類似的例外時依 §0 第 2 點詢問。

| 例外 | 範圍與寫法 | 依據 |
|---|---|---|
| AI Mode 頁（`/ai-mode-playground/`） | 字級與間距沿用原型，不計入任何全站慣例、不可照抄（顏色合規）；內文與分頁字級用網站 14px；對齊另由 DATAI-630 處理（§0 第 3 點、§6.8） | #20、#28 |
| AI Mode 分享卡 | 極簡深色卡（`--bg-dark` 底、右上薄荷柔光、小金色引號、底部細分隔線＋10px 贊助標籤＋白色單色 logo）；分享區外框 14px 為核准值；贊助標籤 10px 為 12px 下限的核准例外 | #24、#29-7 |
| AI Mode 播放器與分享按鈕 | Listen 播放器（不可拖曳的進度條、手機播放鍵 36px、逐字稿與逐句高亮）；LINE／FB 圖示用網站主色單色 | #25 |
| 首頁專屬項目 | 白底全螢幕 Hero；Hero h1 的 `max-[420px]:text-[27px]` 與 `tracking-tight`；內容與頁尾 1152（`max-w-6xl`）（§2.7、§2.12、§6.4） | #29-2、tpl-container-home-6xl、org-hero-home |
| 首頁 Flywheel 計數動畫 | 首頁 Flywheel 展示大數字用元件內自己的 `CountUp`（`components/home/FlywheelSection.tsx:7`），不改用 `NumberTicker`（§3.13） | #33 |
| 間距：手機選單開關 | `p-[11px]`／`-mr-[11px]`，讓 22px 圖示湊成 44×44（§2.10） | #29-4 |
| 間距：/partnership/ 勾勾 | 2px 下移置中（§2.10） | #29-4 |
| 間距：按鈕以整顆高度為準 | 按鈕高度 44／40／36 符合規格即可，內距不往下取（例：`py-2.5`）；外框按鈕可用扣 1px 框線的 `calc()` 內距（§2.10） | #30-4 |
| 導覽列半透明白底 | `bg-white/80` 加 `backdrop-blur-sm`，只限導覽列（§2.3、§2.4） | #31-4 |
| 標準淺底光暈配方 | 首頁 Hero 與 /content-owners/ AI Mode 入口的薄荷→白漸層，淺底只能逐字照抄這一個配方（§2.4） | #31-5 |
| /brands/ 痛點段落琥珀色 | 琥珀光暈與琥珀短線（`components/pages/brands/BrandPainSection.tsx:180`、`:186`），只限痛點段落（§2.4） | #31-5 |
| 深底卡片 hover 發光 | `0 0 0 1px rgba(168,197,195,0.28), 0 6px 28px rgba(34,93,89,0.24)`，含階梯外的 .28、.24，只限深色區塊卡片、逐字照抄（§2.14） | #32-4 |
| 錯誤色 | 新增兩個錯誤色（淺底 `#B91C1C`、深底 `#FCA5A5`），是「只用既有 token」的唯一核准新增（§2.2） | #29-8、#31-2 |
| /decisive-engine/ Hero 膠囊列 | 文字區 768，底部膠囊列維持 1024（§2.12、§5.3） | #31-9 |
| 流程圖專用小底座 | 首頁流程圖 32px 圓形小底座、內放 15px 圖示，只限流程圖（§2.17、§3.12） | #32-6 |
| /developers/ 規格卡圖示 | 不加底座（§2.17） | #29-5 |
| /partnership/ 標題孤字 | Hero 標題「channel.」孤字換行維持現狀，不改文案或字級 | #1 |
| 輪播點點擊範圍 | 維持 5×5（可能不符 WCAG 2.5.8）（§3.6、§8.5） | #29 |
| 桌機 h1／h2 同 48 | 維持（§2.7、§8.6） | #29、第二個 #12 |
| 深底主色按鈕形狀對比 | 約 1.55:1，不處理（§3.2、§8.6） | cross-dark-primary-shape、#26 |
<!-- src: #1, #20, #24, #25, #26, #28, #29, #30, #31, #32, #33, 附錄 A §10 -->

### 10.2 待修清單

每張修正票一列。本文件各規則的「現況偏離」行只會引用這張表裡的票號（`__tests__/design-system/design-md-coverage.test.ts` 會檢查）。

- 用法：照抄任何現有程式前，先查這張表；元件或頁面有待修時，照本文件的標準寫，不照原始碼現況。
- 修正票完成時：刪除該票這一列、刪除各章引用該票的「現況偏離」行（或其中該票的部分）、把 Storybook 待修元件清單裡的對應元件改成有 story。

| 票號 | 類別 | 內容 | 盤點 id |
|---|---|---|---|
| DATAI-556 | 字級 token | `--font-size-*` 改名 `--text-*`（display／h1／h2 的值改成與實際標題角色一致，與 DATAI-630 協調）；6 張卡片標題 16→24、首頁身分卡標題 18→24；`text-[10px]`、SVG 小字對齊 12px 下限 | tok-font-size-token-broken、tok-caption-12-floor、tok-text-size-scale |
| DATAI-619 | 區塊節奏與容器 | 一般內容區塊 `py-16 lg:py-28`；FAQ 接在深色區塊後上方用一般區塊距離；/developers/ 合作夥伴區 112＋1024；頁尾寬跟各頁內容；/decisive-engine/ 淺灰區塊改白 | tpl-section-rhythm、tpl-section-rhythm-112、tpl-section-rhythm-infra、org-faq-top-after-dark、tpl-container-infra、tpl-container-footer、tpl-order-de-surface |
| DATAI-620 | 區塊標題組 | h2→說明 16（含頁尾 CTA）；說明寬 576；7 處小標籤改「緊」；首頁 Flywheel h2 改 `.section-heading`；標題組到下方內容 48（11 處） | mol-heading-group-h2-gap、mol-heading-group-desc-width、mol-heading-group-eyebrow-gap、mol-heading-flywheel |
| DATAI-621 | 4px 間距刻度 | 非按鈕的半級與任意值往下取（例外見 §10.1）；`.label-eyebrow-pill` 內距 6→4；內容區資訊小膠囊 5 行不在本票（歸 DATAI-625） | tok-spacing |
| DATAI-622 | 對比修正 | `text-ink-subtle` 文字改 `text-ink-muted`；深底淡綠字低於 .85 改 ≥.85；主色字在深底改 on-dark；404「404」與錯誤頁「!」改白；白面板上的淡綠字改主色；比較卡編號改白；.75 文字改 .85 | cross-contrast-ink-subtle、tok-on-dark-085、cross-contrast-primary-on-dark、cross-contrast-ondark-on-white、cross-contrast-card-number |
| DATAI-623 | 色彩寫法與 token | 寫死白色 14 處；Tailwind 灰／紅改 token；新增兩個錯誤色 token；inline `var()` 與 inline `rgba(…0.12)` 改 class；移除多疊的 `bg-primary-dark`；非基色透明與階梯外透明度就近對齊；淺底分隔線改 `border-line`；金／琥珀裝飾（痛點段落以外）改兩基色；`app/site-base.css` 階梯註解加 .6；移除 Geist 字型；/content-owners/ 陰影改標準級 | tok-color-hex-residue、tok-color-tailwind-gray、tok-color-error-red、tok-color-error-red-token、tok-color-two-syntaxes、tok-color-primary-dark-alias、tok-alpha-nonbase、tok-alpha-off-ladder、tok-alpha-pill-border-06、atom-divider、tok-font-family、tok-shadow |
| DATAI-624 | 按鈕 | 4 顆方角滿版按鈕改藥丸；`.pill-btn` 單一定義（1px 框、600、同高、不用 `transition: all`）；外框與旁邊實心同高；`transition-all` 改具體屬性；主要按鈕上色統一為 `bg-primary`；手機選單底部按鈕不用 `h-11` 定高 | atom-btn-block、atom-btn-secondary-outline、atom-btn-primary、atom-btn-dark-secondary、tok-transition-all |
| DATAI-625 | Atom 樣式 | Hero 小膠囊 9 處統一 `.label-eyebrow-pill` 並補框線；小標籤換色改參數；首頁身分卡圖示底座改大號 48；全站焦點外框（含表單欄位）；28px 卡片內距 3 處改 24；放大鏡 13→12；流程圖小底座框線 2→1px；內容區資訊小膠囊統一高 24、無框 | atom-eyebrow-pill、atom-eyebrow-override-risk、atom-icon-badge、atom-focus、atom-focus-form、mol-card-padding |
| DATAI-626 | Hero 對齊 | /developers/、/partnership/、/decisive-engine/ 對齊標準 Hero（下距 48、底部細線、h1 48）；/privacy-policy/、/terms-of-service/、/book-a-demo/ 的 h1 補 `text-balance`；404／錯誤頁標題 48 | org-hero-structure、org-hero-h1-standard、page-404、page-error |
| DATAI-627 | 無障礙行為 | FAQ 加 `aria-expanded`／`aria-controls`；步驟清單 tab 語意與鍵盤；首頁流程列改 `<button>`；輪播點標籤；JS 動畫減少動態（位移、淡入、`setInterval` 輪播三類） | cross-aria-disclosure、cross-reduced-motion-js |
| DATAI-628 | CTA 追蹤 | 7 顆導覽型按鈕補 `trackCTA`；「Talk to us」記錄名稱改為畫面文字（改名前先查 GA 報表） | cross-trackcta |
| DATAI-629 | /content-owners/ 步驟面板 | 說明最後一行被固定高度切掉；輪播改為點擊後永久停止、捲出畫面不輪播，與首頁流程一致 | page-content-owners、org-home-pipeline-carousel |
| DATAI-630 | AI Mode 頁對齊 | 14／9／7px 間距改 4px 刻度（分享區核准的 14px 除外）；legacy 變數改 `@theme` token；AI Mode 頁仍是例外 | tok-ai-mode-spacing、tok-ai-mode-legacy-vars |
<!-- src: 附錄 B（F1–F13 對應 DATAI-556、DATAI-619–630）, #30-5, #31, #32, #33 -->
