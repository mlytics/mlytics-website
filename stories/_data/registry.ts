// DESIGN.md §7.8: every shared component either has a story next to it
// (status 'rendered': no open fix ticket) or is listed here as 'pending' with
// the §10.2 tickets DESIGN.md attributes to it. When a ticket closes, drop it
// here too; an entry with no tickets left gets a story and becomes 'rendered'.
// PendingComponents.mdx renders the pending rows straight from this list.
//
// Rule for `tickets`: every open ticket DESIGN.md attributes to the component
// anywhere (any chapter's 現況偏離 line, the §5.8 待修 column, §10.2), plus any
// ticket whose Jira written scope names or clearly covers the file, including the tickets of
// components it embeds (e.g. BrandPageCTA carries InlineEmailCTA's). A missing
// ticket would let an unfixed component be marked 'rendered' and get a story.

export type RegistryEntry = {
  id: string                    // 盤點 id；盤點沒有單獨 id 的元件以同樣格式命名
  name: string                  // 畫面上的名稱
  layer: 'atom' | 'molecule' | 'organism'
  component: string             // 匯出名稱
  file: string                  // 元件所在檔案
  status: 'rendered' | 'pending'
  tickets: string[]             // pending 必填，Jira 票號（DESIGN.md §10.2 有列）
  livePage: string              // 現況可看的頁面
  standard: string              // 一句話標準，與 DESIGN.md 一致
}

export const REGISTRY: RegistryEntry[] = [
  {
    id: 'atom-eyebrow-section',
    name: '小標籤（Eyebrow）',
    layer: 'atom',
    component: 'Eyebrow',
    file: 'components/ui/Eyebrow.tsx',
    status: 'rendered',
    tickets: [],
    livePage: '/brands/',
    standard: '區塊小標籤一律用 Eyebrow 元件，依底色用元件參數換色，與 h2 的距離為「緊」（§3.8）。',
  },
  {
    id: 'atom-number-ticker',
    name: '數字滾動（NumberTicker）',
    layer: 'atom',
    component: 'NumberTicker',
    file: 'components/ui/NumberTicker.tsx',
    status: 'rendered',
    tickets: [],
    livePage: '/content-owners/',
    standard: '數字需要從 0 滾到目標值時用共用元件 NumberTicker，字級與顏色由外層決定，並要處理減少動態（§3.13）。',
  },
  {
    id: 'mol-inline-email-cta',
    name: 'email 輸入組（InlineEmailCTA）',
    layer: 'molecule',
    component: 'InlineEmailCTA',
    file: 'components/ui/InlineEmailCTA.tsx',
    status: 'rendered',
    tickets: [],
    livePage: '/',
    standard: '所有 email 等候名單一律用共用元件 InlineEmailCTA，不自己另做 email 欄或送出鈕（§4.7）。',
  },
  {
    id: 'org-nav',
    name: '導覽列',
    layer: 'organism',
    component: 'Nav',
    file: 'components/layout/Nav.tsx',
    status: 'rendered',
    tickets: [],
    livePage: '/',
    standard: '全站唯一的導覽列：高 65px、半透明白底加背景模糊，右側依序放外框 Book a Demo 與實心 Try AI Mode（§5.1）。',
  },
  {
    id: 'org-footer',
    name: '頁尾',
    layer: 'organism',
    component: 'Footer',
    file: 'components/layout/Footer.tsx',
    status: 'pending',
    tickets: ['DATAI-619'],
    livePage: '/',
    standard: '深色頁尾：品牌區加三欄連結、不放任何按鈕，寬度跟各頁內容（§5.2）。',
  },
  {
    id: 'org-hero-structure',
    name: 'Hero',
    layer: 'organism',
    component: 'Hero',
    file: 'app/brands/page.tsx',
    status: 'pending',
    tickets: ['DATAI-626'],
    livePage: '/brands/',
    standard: 'Hero 沒有共用元件，各頁照 /brands/ 的結構：深色、上 128／下 48、底部細線、768 容器、小膠囊＋h1＋說明置中（§5.3）。',
  },
  {
    id: 'org-page-cta',
    name: '頁尾 CTA',
    layer: 'organism',
    component: 'BrandPageCTA',
    file: 'components/pages/brands/BrandPageCTA.tsx',
    status: 'pending',
    tickets: ['DATAI-620'],
    livePage: '/brands/',
    standard: '深色、上下 64、置中的標題組加 InlineEmailCTA；產品頁變體改用標準 44「Contact Us」（§5.4）。',
  },
  {
    id: 'org-faq-group',
    name: 'FAQ 區塊（/brands/）',
    layer: 'organism',
    component: 'BrandFAQ',
    file: 'components/pages/brands/BrandFAQ.tsx',
    status: 'rendered',
    tickets: [],
    livePage: '/brands/',
    standard: 'FAQ 區塊的標準版：白底、置中標題組、每題照 §4.4，必帶 FAQPage JSON-LD（§5.5）。',
  },
  {
    id: 'org-faq-group-content-owners',
    name: 'FAQ 區塊（/content-owners/）',
    layer: 'organism',
    component: 'ContentOwnerFAQ',
    file: 'components/pages/publishers/ContentOwnerFAQ.tsx',
    status: 'rendered',
    tickets: [],
    livePage: '/content-owners/',
    standard: '與 /brands/ 標準版 BrandFAQ 一致：白底、置中標題組、每題照 §4.4，必帶 FAQPage JSON-LD（§5.5）。',
  },
  {
    id: 'org-faq-group-decisive-engine',
    name: 'FAQ 區塊（/decisive-engine/）',
    layer: 'organism',
    component: 'EngineFAQ',
    file: 'components/pages/decisive-engine/EngineFAQ.tsx',
    status: 'pending',
    tickets: ['DATAI-619'],
    livePage: '/decisive-engine/',
    standard: '與 /brands/ 標準版 BrandFAQ 一致，接在深色區塊之後時上方改用一般區塊距離（§5.5）。',
  },
  {
    id: 'org-playground-entry',
    name: 'AI Mode 入口區',
    layer: 'organism',
    component: 'PlaygroundCTASection',
    file: 'components/ui/PlaygroundCTASection.tsx',
    status: 'pending',
    tickets: ['DATAI-620', 'DATAI-619'],
    livePage: '/content-owners/',
    standard: '共用一份元件，用 variant 選 standalone（白底區塊）或 embedded（放進深色區塊），按鈕是標準 44（§5.6）。',
  },
  {
    id: 'org-logo-marquee',
    name: 'Logo 跑馬燈',
    layer: 'organism',
    component: 'LogoMarquee',
    file: 'components/home/LogoMarquee.tsx',
    status: 'rendered',
    tickets: [],
    livePage: '/',
    standard: '首頁「Trusted by」標誌捲動列，用 .animate-marquee 加左右淡出遮罩，全站只有一份（§5.8）。',
  },
  {
    id: 'mol-heading-flywheel',
    name: 'Flywheel',
    layer: 'organism',
    component: 'FlywheelSection',
    file: 'components/home/FlywheelSection.tsx',
    status: 'pending',
    tickets: ['DATAI-620', 'DATAI-619'],
    livePage: '/',
    standard: '首頁專屬的深色區塊，含展示大數字，全站只有一份（§5.8）。',
  },
  {
    id: 'org-world-map-dots',
    name: '世界地圖點陣',
    layer: 'organism',
    component: 'WorldMapDots',
    file: 'components/home/WorldMapDots.tsx',
    status: 'rendered',
    tickets: [],
    livePage: '/',
    standard: '首頁 Hero 的背景點陣，訊號點用 --color-primary-light、擴散圈用 .ping-ring，全站只有一份（§5.8）。',
  },
  {
    id: 'org-home-pipeline-carousel',
    name: '自動輪播（首頁流程圖）',
    layer: 'organism',
    component: 'IntentPipeline',
    file: 'components/home/IntentPipeline.tsx',
    status: 'rendered',
    tickets: [],
    livePage: '/',
    standard: '自動輪播的標準版：自動切換、滑鼠移上暫停、點擊後永久停止、捲出畫面不輪播、開啟減少動態時停止自動切換（§5.7）。',
  },
  {
    id: 'page-content-owners',
    name: '/content-owners/ 步驟面板',
    layer: 'organism',
    component: 'KnowledgeBaseSection',
    file: 'components/pages/publishers/KnowledgeBaseSection.tsx',
    status: 'pending',
    tickets: ['DATAI-629', 'DATAI-620', 'DATAI-619'],
    livePage: '/content-owners/',
    standard: '輪播行為要與首頁流程圖一致（點擊後永久停止、捲出畫面不輪播、減少動態時停止），且不用固定高度裁切內容（§5.7）。',
  },
  {
    id: 'page-book-a-demo',
    name: '預約表單',
    layer: 'organism',
    component: 'BookADemoForm',
    file: 'app/book-a-demo/BookADemoForm.tsx',
    status: 'rendered',
    tickets: [],
    livePage: '/book-a-demo/',
    standard: '/book-a-demo/ 多欄位表單：欄位照 §3.10、送出用滿版藥丸 §3.3，送出記錄 contact_form_submit 事件（§5.8）。',
  },
  {
    id: 'org-scroll-to-top',
    name: '換頁捲回頂端',
    layer: 'organism',
    component: 'ScrollToTop',
    file: 'components/layout/ScrollToTop.tsx',
    status: 'rendered',
    tickets: [],
    livePage: '/',
    standard: '換頁時捲回頁首、沒有畫面，全站只有一份（§5.8）。',
  },
  {
    id: 'org-reduced-motion',
    name: '減少動態全站開關',
    layer: 'organism',
    component: 'ReducedMotion',
    file: 'components/layout/ReducedMotion.tsx',
    status: 'rendered',
    tickets: [],
    livePage: '/',
    standard: '全站唯一的減少動態開關：系統開啟「減少動態效果」時，framer-motion 動畫一律直接到結束畫面（§8.4）。',
  },
]

export const PENDING = REGISTRY.filter((e) => e.status === 'pending')
