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
7. 第 3–10 章撰寫中；在那之前，元件、版型、行為與無障礙規則一律視為「文件沒寫到」，依第 2 點處理。
   <!-- src: #28 -->

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
| `--color-primary-light` | `#2d7a74` | 現況用於首頁世界地圖點陣的訊號點與 `.pill-btn--dark` 滑過時的框線；一般用途未定案 | 新用途先依 §0 第 2 點詢問 |
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
- 現況偏離：見 §10 DATAI-623（標誌跑馬燈淡出遮罩寫死 `#FFFFFF`；其他非基色光暈）
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
| 卡片標題 | 24 | `text-h3`（DATAI-556 修好前不產生樣式，見 §2.8）；首頁身分卡標題也是 24。**未定案**：DATAI-556 完成前新寫的 24px 卡片標題用什麼寫法，依 §0 第 2 點詢問 |
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
- 未定案：改名為 `--text-*` 後，`display`／`h1`／`h2` 三個 token 的值與 §2.7 角色字級不一致（只有 `h3`、`small`、`caption` 一致），改名後是否保留、改值或刪除，待確認。
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
- 未定案：首頁流程圖金色小圓點的發光、/partnership/ 與 /content-owners/ 深色區塊選中卡片的自訂光暈陰影，是否屬本規則的違規，待確認。
<!-- src: tok-shadow, #31-7 -->

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
  - CSS 過場時間 `duration-200`／`duration-300`；只過場實際會變的屬性（例如 `transition-colors`、`transition-opacity`、`transition-transform`）。
  - 進場動畫：framer-motion 0.5 秒、`easeOut`、淡入上移；卡片依序延遲 0.1 秒。
  - 減少動態：CSS 由 `app/site-base.css` 的 `prefers-reduced-motion` 規則全站處理；JS 動畫要自行處理（規則見 §8）。
- 禁止：`transition-all`。
- 現況偏離：見 §10 DATAI-624（13 處 `transition-all`）、DATAI-627（JS 動畫未處理減少動態）
<!-- src: tok-duration, tok-transition-all, tok-motion, cross-reduced-motion-js -->

### 2.17 圖示

**規則：圖示用 lucide（`lucide-react`）；功能圖示 22px。**
- 用在哪：所有功能圖示。
- 寫法：`size={22}`。需要底座時用大號底座：48px、`rounded-2xl`、`bg-primary`、白色圖示，底座內圖示同為 22（標準寫法見 `components/pages/decisive-engine/EngineUseCases.tsx:45`：`w-12 h-12 rounded-2xl bg-primary text-white`）。
- 例外（核准）：/developers/ 規格卡的圖示不加底座。
- 禁止：其他圖示庫。
- 未定案：22 以外的圖示尺寸（下拉選單、勾勾、送出成功圖示等）與首頁流程圖的 32px 圓形小底座，依 §0 第 2 點詢問。
- 現況偏離：見 §10 DATAI-625（首頁身分卡改用大號 48 實心底座）
<!-- src: tok-icon-size, atom-icon-badge, atom-icon-badge-none, #29-5 -->

### 2.18 `app/site-base.css` 元件類別索引

`app/site-base.css` 定義的共用類別。完整的元件規則寫在第 3–6 章（撰寫中）；此處先列出每個類別的角色。

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

（Task 4 撰寫）

## 4. Molecules

（Task 4 撰寫）

## 5. Organisms

（Task 4 撰寫）

## 6. Templates

（Task 4 撰寫）

## 7. 行為契約與技術約束

（Task 5 撰寫）

## 8. 無障礙

（Task 5 撰寫）

## 9. 新增頁面 SOP

（Task 5 撰寫）

## 10. 例外與待修清單

（Task 5 撰寫：例外清單與每張修正票一列）
