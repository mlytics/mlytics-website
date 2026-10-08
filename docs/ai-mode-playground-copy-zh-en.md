# AI Mode Playground 文案中英對照（審稿用）

對應程式檔：`components/pages/ai-mode-playground/ai-mode-playground-copy.ts`
來源：已核准的繁中原型 `ai-mode-customer-type-dual-paths-signal-canvas-zh-2026-10-05.html`（`chatAnswers` 已不使用，未翻譯）

## 翻譯原則

- **在地化，不逐字翻**：意思不變，但寫成英文 B2B 官網會用的說法；用第二人稱（you / your team），避免 revolutionary、unlock、supercharge、seamless 這類誇飾字。
- **分工句型一致、節奏不同**：16 個路徑區塊的「為什麼這個訊號重要」都維持「AI Mode 自動收集訊號 → 你的團隊只負責決定 X」的分工，但句型輪替（破折號、分號、主被動互換），避免讀起來像模板。
- **「使用者／讀者」統一譯為 user(s)，英文全頁不出現 reader**：網站既有的字彙測試會掃描頁面，禁止出現 reader／publisher／cortex（不分大小寫），所以原本較貼切的 reader 一律改用 user；必要時也可用 audience。品牌路徑原文混用「讀者／使用者」，英文一律 users。
- **產品名與既有術語不翻**：Mlytics AI Mode／AI Mode、Chat、Quote、Listen、Media & Content Owners、Brands、Book a Demo、iPhone 18 Pro、iPhone Duo；「行動呼籲」= CTA、「贊助式 Ask」= sponsored Ask、「證明卡」= proof card、「品牌客製 AI 助理」= custom brand AI assistant。
- **路徑名稱寫成商業成果，不寫職稱**：內容體驗 → Content Experience、品牌合作方案 → Brand Partnerships、受眾與訊息 → Audience & Messaging、產品理解 → Product Understanding。

---

## 1. 頁面 meta 與 Hero

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| PAGE_META.title | AI Mode｜客戶類型雙價值路徑 | Mlytics AI Mode · Mlytics | 沿用現行 `/ai-mode-playground/` 頁的 title 格式（`… · Mlytics`），原型標題是內部工作名稱，不適合直接當 SEO title。**待決**：要不要在 title 帶出「雙路徑」概念？ |
| PAGE_META.description | （原型無） | Try Mlytics AI Mode the way your users would — Chat, Quote, and Listen — and follow each interaction from raw signal to a business decision for Media & Content Owners and Brands. | An 確認 |
| HERO.eyebrow | AI Mode | AI Mode | |
| HERO.title | 從使用者行為，到商業方向。 | From user behavior to business direction. | 「使用者」譯 user（見原則）。 |
| HERO.copy | 看懂互動訊號，用數據找到下一個決策方向。 | Read the signals behind every interaction, and let the data point to your next decision. | 「用數據找到」改寫為 let the data point to，英文較自然。 |

## 2. 體驗切換（Chat／Quote／Listen）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| EXPERIENCE_LABELS.chat | Chat | Chat | |
| EXPERIENCE_LABELS.quote | Quote | Quote | |
| EXPERIENCE_LABELS.listen | Listen | Listen | |
| EXPERIENCE_INSTRUCTIONS.chat | 試著像你的使用者一樣，選一個問題體驗看看。 | Step into your users’ shoes: pick a question and see what happens. | 「試著像你的使用者一樣」譯為 step into your users’ shoes，慣用語。 |
| EXPERIENCE_INSTRUCTIONS.quote | 試著像你的使用者一樣，選一句最有共鳴的話，再留下你的感受。 | Step into your users’ shoes: pick the line that resonates most, then tell us how it lands. | 「留下你的感受」譯為 tell us how it lands（這句話給你什麼感覺），比 leave your feelings 自然。 |
| EXPERIENCE_INSTRUCTIONS.listen | 試著像你的使用者一樣，按播放，觀察開始與完成的訊號。 | Step into your users’ shoes: press play, then watch the start and completion signals come in. | |
| UI.reset | 重設 | Reset | |

### 2a. Chat

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| UI.chat.title | 想知道的 AI 來解答 | Got a question? AI answers it. | 原文是口語標語，英文改成問答句型，保留口語感。 |
| CHAT_QUESTIONS[0] | iPhone 18 Pro 詳細規格介紹 | iPhone 18 Pro full specs, explained | |
| CHAT_QUESTIONS[1] | iPhone 18 Pro v.s. iPhone Duo 分析 | iPhone 18 Pro vs. iPhone Duo: how do they compare? | 「v.s.」修正為 vs.；「分析」改寫成讀者會問的句子。 |
| CHAT_QUESTIONS[2] | iPhone 18 Pro 和其他 2026 高階手機比較 | How does iPhone 18 Pro stack up against other 2026 flagship phones? | 「高階手機」= flagship phones（英文市場慣用詞）；改成問句，與前兩題一樣像讀者提問。 |

### 2b. Quote

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| UI.quote.title | 把有共鳴的內容帶走 | Take the words that resonate with you | |
| UI.quote.step1 | 1 · 選擇金句 | 1 · Pick a line | 「金句」全頁統一譯為 line（a line / the line），英文 quote 已是產品名，避免混淆。 |
| QUOTE_OPTIONS[0] | 在選擇前，先讓決策條件變得清楚。 | Before you choose, make your criteria clear. | 「決策條件」= criteria，金句要短，省略「決策」。 |
| QUOTE_OPTIONS[1] | 有用的回答，會留下有用的訊號。 | Useful answers leave useful signals. | |
| QUOTE_OPTIONS[2] | 下一步不是更多內容，而是更好的比較。 | The next step isn’t more content. It’s better comparisons. | 拆成兩句，英文金句節奏較有力。 |
| UI.quote.step2 | 2 · 這句話帶來什麼感受？ | 2 · How does this line make you feel? | |
| QUOTE_FEEDBACK_OPTIONS[0] | 很有共鳴 | Resonates | 按鈕需短，省略「很」。 |
| QUOTE_FEEDBACK_OPTIONS[1] | 有幫助 | Helpful | |
| QUOTE_FEEDBACK_OPTIONS[2] | 真的嗎？ | Really? | |
| UI.quote.signatureLabel | 署名（選填） | Signature (optional) | |
| UI.quote.signaturePlaceholder | 留下你的名字 | Add your name | |
| UI.quote.previewEmpty | 選擇金句後，分享預覽會顯示在這裡。 | Pick a line and your share preview will appear here. | |
| UI.quote.anonymous | 匿名使用者 | Anonymous user | 「使用者」→ user（見原則）。 |
| UI.quote.sponsoredBy | Sponsored by | Sponsored by | |
| UI.quote.actions.line | LINE | LINE | 已由產品負責人確認維持 LINE。 |
| UI.quote.actions.fb | FB | FB | |
| UI.quote.actions.download | Download | Download | |

### 2c. Listen

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| UI.listen.title | 用聲音繼續探索 | Keep exploring by ear | |
| LISTEN_DURATION_SECONDS | 32 | 32 | 數值，非文案。 |
| UI.listen.play | 播放 | Play | |
| UI.listen.pause | 暫停 | Pause | |
| UI.listen.replay | 重新播放 | Replay | |
| UI.listen.status.ready | 準備播放 | Ready to play | |
| UI.listen.status.playing | 播放中 | Playing | |
| UI.listen.status.completed | 已完成 | Completed | |
| （未使用） | 步驟 1 / 2 | — | 原型 `experiences.quote.step` 只寫進不存在的 `#step-counter`，畫面上看不到，契約也沒有此欄位，故未翻譯。 |

## 3. 客戶決策流程（Canvas）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| UI.canvas.sectionLabel | 客戶決策流程 | Customer decision flow | |
| UI.canvas.title | 從訊號到兩條商業價值路徑 | From signals to two business value paths | |
| UI.canvas.customerPrompt | 你想先了解哪一類客戶的決策路徑？ | Whose decision path do you want to see first? | 省略「哪一類客戶」，下方分頁本身就是客戶類型，英文較精簡。 |
| LENS_LABELS.content-owners | Media & Content Owners | Media & Content Owners | |
| LENS_LABELS.brands | Brands | Brands | |

### 3a. 階段 01、02（共用）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| UI.stages.s01.label | 使用者互動 | User interaction | |
| UI.stages.s01.title | 使用者做了什麼 | What the user did | |
| EXPERIENCE_DEFAULT_OBSERVATION.chat | 使用者選擇一個問題，AI 會根據文章內容給出有憑有據的回答。 | The user picks a question, and the AI gives a grounded answer drawn from the article. | 「有憑有據」= grounded（AI 領域通用術語）。 |
| EXPERIENCE_DEFAULT_OBSERVATION.quote | 使用者選擇一段金句，並在分享前留下回饋。 | The user picks a standout line and leaves feedback before sharing it. | |
| EXPERIENCE_DEFAULT_OBSERVATION.listen | 使用者開始播放一段 32 秒的內容脈絡音訊。 | The user starts a 32-second audio overview of the article’s context. | 「內容脈絡音訊」直譯不通，改為 audio overview of the article’s context。 |
| UI.stages.s02.label | 捕捉到的資料 | Captured data | |
| UI.stages.s02.title | 這次互動產生的原始資料 | Raw data from this interaction | |
| UI.stages.s02.empty | 完成上方體驗後，就能看到這次互動產生的原始資料。 | Complete an experience above to see the raw data it generates. | |
| UI.stages.s02.capturedPrefix | 已捕捉： | Captured: | 英文含結尾空格（`'Captured: '`），元件直接接在 rawSignal 前。 |

### 3b. 階段 01／02 動態文字（互動後）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| CAPTURE.chat → observation | 使用者點選了「{問題}」這個問題，AI 根據文章內容給出一個有憑有據的完整回答，不是憑空回答。 | The user picked “{question}”, and the AI answered in full, grounded in the article rather than made up. | 「不是憑空回答」併入 rather than made up，避免英文重複。 |
| CAPTURE.chat → rawSignal | 使用者問的是「{問題}」，AI 依據文章內容回答，而且使用者看完了完整的回答。 | The user asked “{question}”; the AI answered from the article, and the user read the full answer. | |
| CAPTURE.quote → observation（無回饋） | 使用者挑了「{金句}」這句話。 | The user picked the line “{line}”. | 程式會去掉金句尾端句點，避免出現 `.”.`。 |
| CAPTURE.quote → observation（有回饋） | 使用者挑了「{金句}」這句話，並留下「{回饋}」的回饋。 | The user picked the line “{line}” and left the feedback “{feedback}”. | 回饋為 “Really?” 時不再補句點。 |
| CAPTURE.quote → rawSignal 片段 1 | 使用者挑了「{金句}」這句話 | The user picked the line “{line}” | 中文用「，」串接；英文依片段數量自動組成 “A and B.” 或 “A, B, and C.”。 |
| CAPTURE.quote → rawSignal 片段 2 | 覺得這句話「{回饋}」 | responded “{feedback}” | 「覺得這句話『真的嗎？』」直譯不通，改成中性的 responded。 |
| CAPTURE.quote → rawSignal 片段 3 | 按了 {LINE、FB} 的分享鍵（按下不等於分享成功） | clicked the {LINE and FB} share button(s) (a click doesn’t confirm the share went through) | 保留「按下≠分享成功」的但書。 |
| CAPTURE.listenStarted.observation | 使用者按下播放，開始收聽這段內容脈絡音訊。 | The user pressed play and started listening to the audio overview of the article’s context. | |
| CAPTURE.listenStarted.rawSignal | 使用者按下播放，開始收聽這段 32 秒的音訊。 | The user pressed play and started the 32-second audio. | |
| CAPTURE.listenCompleted.observation | 使用者從頭到尾聽完了這段 32 秒的音訊。 | The user listened to the 32-second audio from start to finish. | 原文 observation 與 rawSignal 同句，照樣保留相同。 |
| CAPTURE.listenCompleted.rawSignal | 使用者從頭到尾聽完了這段 32 秒的音訊。 | The user listened to the 32-second audio from start to finish. | |

### 3c. 路徑標頭與階段 03–05 欄位標籤

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| UI.stages.pathsHead.title | 兩條商業路徑 | Two business paths | |
| UI.stages.pathsHead.pathLabel | 路徑 | Path | |
| UI.stages.s03.label | 客戶決策 | Customer decision | |
| UI.stages.s03.title | 從互動訊號到下一步 | From interaction signals to next steps | |
| UI.cell.question | 這條路徑要回答的問題 | The question this path answers | |
| UI.cell.decision | 決策 | Decision | |
| UI.stages.s04.label | 方案 | Offering | 「方案」在此指可賣／可部署的產品組合，offering 比 plan/solution 準確。 |
| UI.stages.s04.title | 可變現商業方案 | Business offerings you can monetize | |
| UI.cell.unit | 可銷售／可配置單元 | What you can sell or deploy | 「單元」直譯 unit 太工程味，改寫為口語。 |
| UI.cell.value | 為什麼這個訊號重要 | Why this signal matters | |
| UI.stages.s05.label | 證據 | Evidence | |
| UI.stages.s05.title | 可比較、可支援決策的訊號 | Signals you can compare and act on | 「可支援決策」改為 act on，標題更短。 |
| UI.cell.observed | 觀察欄位 | What’s observed | 「欄位」省略，避免像資料表。 |
| UI.cell.comparison | 比較方式 | How it’s compared | |
| UI.cell.supports | 可支援的決策 | Decisions it supports | |

## 4. 路徑內容：Media & Content Owners

### 4.1 內容體驗 → Content Experience（預設）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| name | 內容體驗 | Content Experience | |
| question | 你能用哪些新的內容體驗，為你的使用者創造價值？ | What new content experiences could create more value for your users? | |
| decision | 哪些主題值得延伸？ | Which topics are worth expanding? | |
| unit | 比較指南、延伸閱讀、主題音訊與內容策展。 | Comparison guides, further reading, topic audio, and curated collections. | 「內容策展」= curated collections（具體成品，而非抽象 curation）。 |
| value | 使用者問了什麼、記住了什麼、是否看完，這些訊號由 AI Mode 自動彙整，你只需要決定下一步要投資哪個主題延伸內容。 | What users asked, what stuck with them, whether they finished — AI Mode pulls these signals together automatically. You only decide which topic gets your next content investment. | 「記住了什麼」譯 what stuck with them（對應 Quote 存下的句子）。 |
| evidence.observed | 問題、摘錄、完成、內容選擇 | Questions, quotes, completions, content choices | 「摘錄」譯 quotes，對應 Quote 體驗。 |
| evidence.comparison | 比較主題與後續選擇 | Compare topics against the choices users made next | |
| evidence.supports | 可支援內容投資決策。 | Informs content investment decisions. | 「可支援…的決策」全頁統一用 Informs…，英文 B2B 常見。 |

### 4.1-C1 Content Experience × Chat 問題 1（單一規格）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| question | 單一產品的規格資訊，值得做成一份可以查找、可以延伸閱讀的內容嗎？ | Are one product’s specs worth turning into a searchable piece with further reading? | |
| decision | 要不要優先製作這個產品的規格整理與相關延伸閱讀？ | Should a specs roundup and related reading for this product move up your list? | 「要不要優先」譯為 move up your list，三個變體共用，維持一致。 |
| unit | 規格整理頁、重點摘要、依規格分題的延伸閱讀。 | A specs page, a key-takeaways summary, and further reading organized by spec. | |
| value | 使用者點進單一規格問題、看完整個回答，這些由 AI Mode 自動記錄，你只需要決定要不要把這個主題做成正式的內容頁。 | When users open a single-spec question and read the full answer, AI Mode logs it automatically. Your call is whether this topic earns its own content page. | |
| evidence.observed | 問題、完成狀態、延伸閱讀點擊 | Question, completion status, further-reading clicks | |
| evidence.comparison | 比較不同規格主題的完成與延伸閱讀率 | Compare completion and further-reading rates across spec topics | |
| evidence.supports | 可支援是否製作規格整理內容的決策。 | Informs whether to produce a specs roundup. | |

### 4.1-C2 Content Experience × Chat 問題 2（雙產品比較）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| question | 兩個產品放在一起比較，值得做成一份獨立的比較內容嗎？ | Is a head-to-head between two products worth its own comparison piece? | |
| decision | 要不要優先製作這兩個產品的比較指南？ | Should a comparison guide for these two products move up your list? | |
| unit | 雙產品比較表、依使用情境切換的比較版本。 | A two-product comparison table, with versions for different use cases. | |
| value | 使用者選了比較型問題、看完整個回答，這些由 AI Mode 自動記錄，你只需要決定值不值得把這組比較做成正式的比較指南。 | Users chose a comparison question and read the whole answer, and AI Mode recorded both automatically. You decide whether this pairing deserves a full comparison guide. | |
| evidence.observed | 問題、完成狀態、比較條件點擊 | Question, completion status, comparison-criteria clicks | |
| evidence.comparison | 比較不同產品組合的完成與延伸選擇 | Compare completion and next choices across product pairings | |
| evidence.supports | 可支援是否製作比較指南的決策。 | Informs whether to produce a comparison guide. | |

### 4.1-C3 Content Experience × Chat 問題 3（類別）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| question | 一整個類別的產品放在一起看，值得做成一份可重用的類別導讀嗎？ | Is a whole product category worth a reusable category guide? | |
| decision | 要不要優先製作這個類別的導讀與篩選框架？ | Should a guide and filtering framework for this category move up your list? | |
| unit | 類別導讀、共同條件篩選器、產品策展清單。 | A category guide, shared-criteria filters, and curated product lists. | |
| value | 使用者選了跨產品問題、看完整個回答，這些由 AI Mode 自動記錄，你只需要決定值不值得把這個類別做成一份可長期維護的導讀內容。 | AI Mode automatically records that users picked a cross-product question and finished the answer. What’s left for you: deciding whether this category merits a guide you’ll maintain over time. | |
| evidence.observed | 問題、完成狀態、類別篩選互動 | Question, completion status, category-filter interactions | |
| evidence.comparison | 比較不同類別框架的完成與篩選行為 | Compare completion and filtering behavior across category frameworks | |
| evidence.supports | 可支援是否製作類別導讀的決策。 | Informs whether to produce a category guide. | |

### 4.2 品牌合作方案 → Brand Partnerships（預設）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| name | 品牌合作方案 | Brand Partnerships | |
| question | AI Mode 讓讀者能跟你的內容即時互動——你的業務團隊能不能把這些互動時刻，包裝成品牌願意購買的合作方案？ | AI Mode lets users interact with your content in real time. Can your sales team package those moments into partnerships brands will pay for? | 破折號改為兩句，英文較易讀。 |
| decision | 哪一種體驗、在什麼內容時刻，值得塑造成品牌合作單元？ | Which experience, at which content moment, is worth shaping into a brand partnership unit? | |
| unit | 贊助式 Ask、品牌化 Quote、主題贊助，以及品牌客製 AI 助理。 | Sponsored Ask, branded Quote, topic sponsorships, and a custom brand AI assistant. | 句首大寫 Sponsored；句中為 sponsored Ask。 |
| value | 互動發生在什麼內容時刻、使用者對行動呼籲的反應，這些由 AI Mode 自動記錄，你的業務團隊只需要決定要不要把這個時刻包裝成合作方案。 | Which content moment an interaction happened in, and how users responded to the CTA — AI Mode records all of it automatically. Your sales team only decides whether to package that moment as a partnership. | |
| evidence.observed | 互動脈絡、內容時刻、行動呼籲、後續選擇 | Interaction context, content moment, CTA, next choice | |
| evidence.comparison | 比較不同合作脈絡 | Compare partnership contexts | |
| evidence.supports | 可支援方案保留／調整決策。 | Informs whether to keep or adjust a package. | 「方案」此處譯 package（業務賣的合作套案）。 |

### 4.2-C1 Brand Partnerships × Chat 問題 1（單一規格）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| question | 讀者在查單一產品規格的當下，適不適合讓一個品牌用贊助式 Ask 補充資訊？ | When users are checking one product’s specs, is that the right moment for a brand to add context through a sponsored Ask? | |
| decision | 這個規格情境，值不值得談一個單一品牌的贊助合作？ | Is this spec context worth pitching as a single-brand sponsorship? | 「談」譯 pitch（業務向品牌提案）。 |
| unit | 贊助式規格補充 Ask、品牌證明連結。 | A sponsored Ask that adds spec context, with brand proof links. | |
| value | 使用者在這個規格情境下有沒有點開贊助內容、有沒有行動，這些由 AI Mode 自動記錄，你的業務團隊只需要決定要不要正式談這個贊助位置。 | Whether users open sponsored content in this spec context, and whether they act on it, is recorded by AI Mode automatically. Your sales team just decides whether to pitch this sponsorship slot. | |
| evidence.observed | 行動呼籲曝光、點擊、後續選擇 | CTA impressions, clicks, next choice | |
| evidence.comparison | 比較有無贊助內容時的互動差異 | Compare engagement with and without sponsored content | |
| evidence.supports | 可支援是否開放這個贊助位置的決策。 | Informs whether to open this sponsorship slot. | |

### 4.2-C2 Brand Partnerships × Chat 問題 2（雙產品比較）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| question | 讀者在比較兩個產品的當下，適不適合讓品牌用證明卡介入，補強某一項差異？ | When users are comparing two products, is that the right moment for a brand proof card that backs up one difference? | |
| decision | 這組比較情境，值不值得談一個品牌證明卡合作？ | Is this comparison worth pitching as a proof card partnership? | |
| unit | 品牌化比較證明卡、差異佐證連結。 | Branded comparison proof cards, with links that back up the difference. | |
| value | 使用者在比較情境下有沒有展開證明卡、有沒有行動，這些由 AI Mode 自動記錄，你的業務團隊只需要決定要不要正式談這張證明卡的合作。 | AI Mode automatically tracks whether users expand the proof card in this comparison and whether they act. Your sales team decides one thing: whether to pitch this proof card partnership. | |
| evidence.observed | 證明卡展開、點擊、後續選擇 | Proof card expansions, clicks, next choice | |
| evidence.comparison | 比較有無證明卡時的互動差異 | Compare engagement with and without a proof card | |
| evidence.supports | 可支援是否開放這個證明卡合作的決策。 | Informs whether to open this proof card partnership. | |

### 4.2-C3 Brand Partnerships × Chat 問題 3（類別）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| question | 讀者在看整個類別的當下，適不適合讓品牌用主題贊助介入，塑造類別層級的曝光？ | When users are browsing a whole category, is that the right moment for a topic sponsorship that builds category-level visibility? | |
| decision | 這個類別情境，值不值得談一個主題贊助合作？ | Is this category context worth pitching as a topic sponsorship? | |
| unit | 主題贊助導讀、品牌客製 AI 助理（類別層級）。 | A sponsored topic guide, and a custom brand AI assistant at the category level. | |
| value | 使用者在類別情境下有沒有跟贊助內容互動，這些由 AI Mode 自動記錄，你的業務團隊只需要決定要不要正式談這個主題贊助。 | Whether users engage with sponsored content in this category context is something AI Mode records automatically. Your sales team only decides whether to pitch the topic sponsorship. | |
| evidence.observed | 贊助曝光、互動、後續選擇 | Sponsorship impressions, interactions, next choice | |
| evidence.comparison | 比較有無主題贊助時的互動差異 | Compare engagement with and without a topic sponsorship | |
| evidence.supports | 可支援是否開放這個主題贊助的決策。 | Informs whether to open this topic sponsorship. | |

## 5. 路徑內容：Brands

### 5.1 受眾與訊息 → Audience & Messaging（預設）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| name | 受眾與訊息 | Audience & Messaging | |
| question | 你能從讀者的提問與互動反應中，看出受眾脈絡、合適的訊息方向，以及哪些市場或客群更可能轉換嗎？ | From what users ask and how they react, can you tell who your audience is, which message fits, and which markets or segments are most likely to convert? | 「看出受眾脈絡」改寫為 tell who your audience is，比 audience context 好懂。 |
| decision | 下一次要優先測試哪一種受眾脈絡或訊息版本，又有哪些市場／客群值得優先投入轉換資源？ | Which audience context or message variant should you test next, and which markets or segments deserve your conversion resources first? | |
| unit | 脈絡式行動呼籲、品牌證明卡、訊息版本與互動活動，以及依訊號強弱排序的市場／客群轉換傾向清單。 | Contextual CTAs, brand proof cards, message variants and engagement campaigns, plus markets and segments ranked by signal strength for conversion intent. | |
| value | 使用者問了什麼、選了哪種比較方式、對行動呼籲的反應，這些由 AI Mode 自動彙整成可比較的訊號，你只需要決定下一步要測試哪種訊息、該把資源放在哪個市場或客群。 | What users asked, how they chose to compare, how they responded to CTAs — AI Mode turns all of it into comparable signals automatically. You only decide which message to test next and which market or segment gets the resources. | |
| evidence.observed | 問題文字、比較條件、分享、行動呼籲、分支，以及訊號出現的強弱分布 | Question text, comparison criteria, shares, CTAs, branches, and how signal strength is distributed | An 確認：維持 branches |
| evidence.comparison | 依受眾脈絡比較訊息版本，並依訊號強弱排序市場／客群 | Compare message variants by audience context, and rank markets and segments by signal strength | |
| evidence.supports | 可支援訊息／行動呼籲測試，也可支援市場或客群的轉換資源分配判斷。 | Informs message and CTA testing, and how you allocate conversion resources across markets or segments. | |

### 5.1-C1 Audience & Messaging × Chat 問題 1（單一規格）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| question | 讀者只問單一產品規格時，這代表哪一種受眾脈絡，適合測試哪一種規格型訊息？ | When users ask only about one product’s specs, what audience context does that point to, and which spec-led message should you test? | 「規格型訊息」= spec-led message（行銷常用 -led 構詞）。 |
| decision | 下一輪要不要針對這種受眾，優先測試規格型訊息？ | Should your next round prioritize spec-led messaging for this audience? | |
| unit | 規格型訊息版本、單一賣點卡。 | Spec-led message variants and single-benefit cards. | |
| value | 使用者選了規格型問題，這代表一種明確的受眾脈絡，由 AI Mode 自動記錄，你只需要決定要不要針對這群人投入規格型訊息測試。 | A user choosing a spec question signals a clear audience context, and AI Mode records it automatically. You decide whether to invest in testing spec-led messages for this group. | |
| evidence.observed | 問題文字、訊息版本展開、行動呼籲 | Question text, message-variant expansions, CTA | |
| evidence.comparison | 比較規格型訊息的不同版本 | Compare variants of spec-led messaging | |
| evidence.supports | 可支援是否投入規格型訊息測試的決策。 | Informs whether to invest in spec-led message testing. | |

### 5.1-C2 Audience & Messaging × Chat 問題 2（雙產品比較）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| question | 讀者在做雙產品比較時，這代表哪一種受眾脈絡，適合測試哪一種差異型訊息？ | When users compare two products, what audience context does that point to, and which differentiation message should you test? | |
| decision | 下一輪要不要針對這種受眾，優先測試差異型訊息？ | Should your next round prioritize differentiation messaging for this audience? | |
| unit | 差異型訊息版本、比較證明卡。 | Differentiation message variants and comparison proof cards. | |
| value | 使用者選了比較型問題，這代表正在建立取捨條件的受眾脈絡，由 AI Mode 自動記錄，你只需要決定要不要針對這群人投入差異型訊息測試。 | Picking a comparison question marks an audience that’s weighing trade-offs, and AI Mode captures it automatically. Whether to invest in differentiation message testing for them is your call. | |
| evidence.observed | 比較條件、訊息版本展開、行動呼籲 | Comparison criteria, message-variant expansions, CTA | |
| evidence.comparison | 比較差異型訊息的不同版本 | Compare variants of differentiation messaging | |
| evidence.supports | 可支援是否投入差異型訊息測試的決策。 | Informs whether to invest in differentiation message testing. | |

### 5.1-C3 Audience & Messaging × Chat 問題 3（類別）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| question | 讀者在看整個類別時，這代表哪一種受眾脈絡，適合測試哪一種類別定位訊息？ | When users look across a whole category, what audience context does that point to, and which category-positioning message should you test? | |
| decision | 下一輪要不要針對這種受眾，優先測試類別定位訊息，又該把哪個市場或客群排在前面？ | Should your next round prioritize category-positioning messaging for this audience, and which market or segment should come first? | |
| unit | 類別定位訊息版本、類別層級證明卡。 | Category-positioning message variants and category-level proof cards. | |
| value | 使用者選了跨產品問題，這代表正在建立類別篩選框架的受眾脈絡，由 AI Mode 自動記錄，你只需要決定要不要針對這群人投入類別定位訊息測試、該優先鎖定哪個市場或客群。 | A cross-product question marks an audience building its own filters for the category. AI Mode records it automatically; you decide whether to invest in category-positioning tests for this group, and which market or segment to target first. | 「建立類別篩選框架的受眾脈絡」改寫為 building its own filters for the category，較口語。 |
| evidence.observed | 類別條件、訊息版本展開、行動呼籲 | Category criteria, message-variant expansions, CTA | |
| evidence.comparison | 比較類別定位訊息的不同版本，並依訊號強弱排序市場／客群 | Compare variants of category-positioning messaging, and rank markets and segments by signal strength | |
| evidence.supports | 可支援是否投入類別定位訊息測試、以及市場或客群優先順序的決策。 | Informs whether to invest in category-positioning tests, and how to prioritize markets or segments. | |

### 5.2 產品理解 → Product Understanding（預設）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| name | 產品理解 | Product Understanding | |
| question | 你能從使用者問的問題與選擇的比較方式，看出他們實際上怎麼理解、描述你的產品嗎？ | From the questions people ask and the comparisons they choose, can you see how they actually understand — and describe — your product? | 此處用 people 而非 users：對品牌而言，重點是「消費者怎麼理解產品」，people 讀起來更貼近真實顧客。 |
| decision | 這個產品認知落差，應該優先反映在教育內容、產品定位溝通，還是行銷溝通方向？ | Should this perception gap shape your education content, your product positioning, or your marketing message first? | An 裁決：統一為行銷溝通方向（原為功能路線圖） |
| unit | 產品 Ask、產品知識卡、互動導覽，以及回饋給產品／行銷團隊的認知落差報告。 | Product Ask, product knowledge cards, interactive walkthroughs, and a perception-gap report for your product and marketing teams. | 「認知落差」= perception gap（行銷研究常用語）。 |
| value | 使用者實際問的問題與選的比較方式，由 AI Mode 自動彙整成認知落差報告，你的產品或行銷團隊可以決定要拿它改教育內容、調整產品定位，還是回饋行銷溝通方向。 | AI Mode compiles the questions users actually ask and the comparisons they choose into a perception-gap report, automatically. Your product or marketing team decides what to do with it: revise education content, adjust product positioning, or reshape your marketing message. | 原文此路徑用「可以決定」而非「只需要決定」，英文用 decides，不加 only，保留原語氣。 |
| evidence.observed | 產品問題、比較方式、摘錄、導覽路徑 | Product questions, comparison choices, quotes, walkthrough paths | 「摘錄」譯 quotes（同 4.1）。 |
| evidence.comparison | 比較不同說明與路徑帶來的理解落差 | Compare the understanding gaps that different explanations and paths create | |
| evidence.supports | 可支援產品教育調整，也可作為產品定位或行銷溝通修正的參考依據。 | Informs product education updates, and serves as a reference for refining product positioning or marketing messages. | |

### 5.2-C1 Product Understanding × Chat 問題 1（單一規格）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| question | 讀者只問單一產品規格，代表他對這個產品的基礎理解卡在哪裡？ | When users ask only about one product’s specs, where is their basic understanding of the product getting stuck? | |
| decision | 要優先補強哪個規格主題的教育內容？ | Which spec topic needs better education content first? | |
| unit | 單一產品知識卡、規格導覽、術語解釋。 | Single-product knowledge cards, spec walkthroughs, and plain-language term explainers. | 「術語解釋」加 plain-language，點出用途。 |
| value | 使用者問的規格主題，由 AI Mode 自動彙整成基礎理解缺口清單，你的產品或行銷團隊可以決定要優先補強哪個規格的教育內容。 | AI Mode turns the spec topics users ask about into a list of foundational knowledge gaps, automatically. Your product or marketing team decides which spec to explain better first. | |
| evidence.observed | 規格主題、後續問題 | Spec topics, follow-up questions | |
| evidence.comparison | 比較不同規格主題被問到的頻率 | Compare how often each spec topic comes up | |
| evidence.supports | 可支援優先補強哪個規格教育內容的決策。 | Informs which spec education content to strengthen first. | |

### 5.2-C2 Product Understanding × Chat 問題 2（雙產品比較）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| question | 讀者在做雙產品比較，代表他對這兩個產品的相對差異理解卡在哪裡？ | When users compare two products, where is their understanding of the difference between them getting stuck? | |
| decision | 要優先補強哪個比較條件的說明？ | Which comparison criterion needs a clearer explanation first? | |
| unit | 相對差異知識卡、條件式比較解說。 | Knowledge cards on relative differences, and criteria-based comparison explainers. | |
| value | 使用者選的比較條件，由 AI Mode 自動彙整成差異理解缺口清單，你的產品或行銷團隊可以決定要優先補強哪個比較條件的說明。 | The comparison criteria users pick become a list of gaps in how they understand the difference — AI Mode compiles it automatically. Your product or marketing team decides which criterion to explain better first. | |
| evidence.observed | 比較條件、後續問題 | Comparison criteria, follow-up questions | |
| evidence.comparison | 比較不同比較條件被問到的頻率 | Compare how often each comparison criterion comes up | |
| evidence.supports | 可支援優先補強哪個差異說明的決策。 | Informs which difference to explain better first. | |

### 5.2-C3 Product Understanding × Chat 問題 3（類別）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| question | 讀者在看整個類別，代表他對你的產品在這個類別裡的定位理解卡在哪裡？ | When users look across a whole category, where is their understanding of your product’s place in it getting stuck? | |
| decision | 要優先補強類別定位的哪一段說明，還是回饋給產品定位本身？ | Which part of your category positioning needs a clearer explanation first — or should this go back to the positioning itself? | |
| unit | 類別定位知識卡、產品群比較說明。 | Category-positioning knowledge cards and product-lineup comparison explainers. | 「產品群」= product lineup。 |
| value | 使用者選的類別條件，由 AI Mode 自動彙整成定位理解缺口清單，你的產品或行銷團隊可以決定要優先補強類別定位說明，還是回饋產品定位本身。 | From the category criteria users choose, AI Mode automatically builds a list of positioning gaps. Your product or marketing team decides whether to sharpen the category explanation first or take it back to the product positioning itself. | |
| evidence.observed | 類別條件、後續問題 | Category criteria, follow-up questions | |
| evidence.comparison | 比較不同類別框架被問到的頻率 | Compare how often each category framework comes up | |
| evidence.supports | 可支援優先補強類別定位說明或回饋產品定位的決策。 | Informs whether to strengthen category-positioning content or feed back into product positioning. | |

## 6. 下一步 CTA

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| UI.cta.label | 下一步 | Next step | |
| UI.cta.title | 把這次互動訊號帶進下一個決策 | Bring this interaction signal into your next decision | |
| UI.cta.bookDemo | Book a Demo | Book a Demo | |
| CUSTOMER_CTA.content-owners.description | 了解內容體驗與品牌合作方案如何延伸。 | See how content experiences and brand partnerships can grow from here. | |
| CUSTOMER_CTA.content-owners.label | 看更多 Media & Content | Learn more | An 裁決：統一顯示 Learn more，連結依客戶類型導向 /content-owners 或 /brands |
| CUSTOMER_CTA.brands.description | 探索受眾訊號如何支援品牌與產品決策。 | See how audience signals inform brand and product decisions. | |
| CUSTOMER_CTA.brands.label | 看更多 Brands | Learn more | An 裁決：統一顯示 Learn more，連結依客戶類型導向 /content-owners 或 /brands |

## 7. 輔助技術文字（aria 標籤、螢幕閱讀器播報）

| 位置 | 中文原文 | English | 備註 |
|---|---|---|---|
| UI.experienceTablistLabel | 選擇 AI Mode 體驗 | Choose an AI Mode experience | |
| UI.chat.questionsLabel | 建議問題 | Suggested questions | |
| UI.quote.optionsLabel | 金句選項 | Quote options | |
| UI.quote.feedbackLabel | Quote 回饋 | Quote feedback | |
| UI.quote.previewLabel | 社群分享預覽 | Social share preview | |
| UI.quote.actionsLabel | 社群分享操作 | Social share actions | |
| UI.listen.progressLabel | 音訊進度 | Audio progress | |
| UI.canvas.customerTablistLabel | 選擇客戶類型 | Choose a customer type | |
| UI.canvas.flowLabel | 01 到 05 的共享垂直進度流程 | Decision flow, steps 01 to 05 | 「共享垂直」是版面描述，對螢幕閱讀器使用者沒有意義，省略。 |
| UI.stages.pathsHead.listLabel | 商業路徑 | Business paths | |
| ANNOUNCE.experienceSelected | 已選擇 {體驗}。 | {label} selected. | |
| ANNOUNCE.customerSwitched | 已切換至 {客戶類型}。 | Switched to {lensLabel}. | |
| ANNOUNCE.customerSwitchedWithCapture | 同一個互動現在以另一種客戶類型的角度呈現。 | The same interaction is now shown from the other customer type’s perspective. | 只有兩種客戶類型，「另一種」譯 the other。 |
| ANNOUNCE.completed | {體驗} 已完成；共享訊號已更新。 | {label} complete. Shared signals updated. | |
| ANNOUNCE.reset | {體驗} 已重設。 | {label} reset. | |
| ANNOUNCE.chatAnswered | AI 已經給出回答；下面的客戶決策流程已經更新。 | The AI has answered. The customer decision flow below has been updated. | |
| ANNOUNCE.quoteSelected | 已選擇一段金句。 | Line selected. | |
| ANNOUNCE.feedbackSelected | 已選擇回饋：{回饋}。 | Feedback selected: {value}. | 回饋為 “Really?” 時不再補句點。 |
| ANNOUNCE.shareRecorded | 已記錄 {LINE} 分享操作；共享訊號已更新。 | {label} share action recorded. Shared signals updated. | |
| ANNOUNCE.listenPlaying | Listen 播放中；開始 Signal 已捕捉。 | Listen is playing. Start signal captured. | |
| ANNOUNCE.listenPaused | Listen 已暫停。 | Listen paused. | |
