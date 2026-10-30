import type { PendingTicket } from '../ledger'

// DATAI-630 的現有違規（DATAI-638 守門的待修白名單）。
// 修好就把 count 減掉；歸零刪條目；整檔清空刪檔。不可為新程式新增條目。
const pending: PendingTicket = {
  ticket: 'DATAI-630',
  paths: [
    { prefix: "app/ai-mode-playground/", kinds: ["arbitrary"] },
    { prefix: "components/pages/ai-mode-playground/", kinds: ["arbitrary"] },
  ],
  entries: [
    { file: "app/ai-mode-playground/page.tsx", match: "rgba(168,197,195,0.45)", count: 1 },
    { file: "components/pages/ai-mode-playground/DecisionFlow.module.css", match: "rgba(255, 255, 255, .72)", count: 2 },
    { file: "components/pages/ai-mode-playground/DecisionFlow.module.css", match: "rgba(34, 93, 89, .04)", count: 5 },
    { file: "components/pages/ai-mode-playground/DecisionFlow.module.css", match: "rgba(34, 93, 89, .1)", count: 1 },
    { file: "components/pages/ai-mode-playground/DecisionFlow.module.css", match: "rgba(34, 93, 89, .16)", count: 2 },
    { file: "components/pages/ai-mode-playground/DecisionFlow.module.css", match: "rgba(34, 93, 89, .2)", count: 1 },
    { file: "components/pages/ai-mode-playground/DecisionFlow.module.css", match: "rgba(34, 93, 89, .22)", count: 1 },
    { file: "components/pages/ai-mode-playground/DecisionFlow.module.css", match: "rgba(34, 93, 89, .34)", count: 2 },
    { file: "components/pages/ai-mode-playground/ExperiencePanel.module.css", match: "rgba(168, 197, 195, .16)", count: 2 },
    { file: "components/pages/ai-mode-playground/ExperiencePanel.module.css", match: "rgba(168, 197, 195, .2)", count: 1 },
    { file: "components/pages/ai-mode-playground/ExperiencePanel.module.css", match: "rgba(26, 61, 58, .12)", count: 1 },
    { file: "components/pages/ai-mode-playground/ExperiencePanel.module.css", match: "rgba(34, 93, 89, .04)", count: 3 },
    { file: "components/pages/ai-mode-playground/ExperiencePanel.module.css", match: "rgba(34, 93, 89, .05)", count: 1 },
    { file: "components/pages/ai-mode-playground/ExperiencePanel.module.css", match: "rgba(34, 93, 89, .3)", count: 1 },
    { file: "components/pages/ai-mode-playground/ExperiencePanel.module.css", match: "color-mix(in srgb, var(--color-primary) 18%, transparent)", count: 1 },
    { file: "components/pages/ai-mode-playground/ExperiencePanel.module.css", match: "color-mix(in srgb, var(--color-primary) 8%, transparent)", count: 1 },
    { file: "components/pages/ai-mode-playground/ExperiencePanel.module.css", match: "color-mix(in srgb, var(--color-primary) 10%, transparent)", count: 2 },
  ],
}

export default pending
