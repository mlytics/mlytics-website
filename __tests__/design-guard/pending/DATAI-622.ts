import type { PendingTicket } from '../ledger'

// DATAI-622 的現有違規（DATAI-638 守門的待修白名單）。
// 修好就把 count 減掉；歸零刪條目；整檔清空刪檔。不可為新程式新增條目。
const pending: PendingTicket = {
  ticket: 'DATAI-622',
  entries: [
    { file: "components/home/FlywheelDiagram.tsx", match: "rgba(168,197,195,0.75)", count: 1 },
    { file: "components/home/FlywheelSection.tsx", match: "text-on-dark/65", count: 2 },
    { file: "components/pages/brands/BrandGEOSection.tsx", match: "rgba(168,197,195,0.35)", count: 1 },
    { file: "components/pages/brands/BrandGEOSection.tsx", match: "rgba(168,197,195,0.45)", count: 1 },
    { file: "components/pages/developers/AILayerSection.tsx", match: "text-on-dark/50", count: 1 },
    { file: "components/pages/publishers/KnowledgeBaseSection.tsx", match: "rgba(168,197,195,0.45)", count: 1 },
    { file: "components/pages/publishers/LayerOverview.tsx", match: "rgba(168,197,195,0.5)", count: 1 },
  ],
}

export default pending
