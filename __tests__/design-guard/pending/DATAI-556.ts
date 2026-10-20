import type { PendingTicket } from '../ledger'

// DATAI-556 的現有違規（DATAI-638 守門的待修白名單）。
// 修好就把 count 減掉；歸零刪條目；整檔清空刪檔。不可為新程式新增條目。
const pending: PendingTicket = {
  ticket: 'DATAI-556',
  entries: [
    { file: "components/home/IntentPipeline.tsx", match: "text-[10px]", count: 1 },
    { file: "components/pages/publishers/KnowledgeBaseSection.tsx", match: "text-[10px]", count: 1 },
  ],
}

export default pending
