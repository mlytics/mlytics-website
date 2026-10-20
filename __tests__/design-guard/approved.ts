// Approved exceptions: exact text that DESIGN.md sanctions, in the only files
// allowed to use it. `designRef` must appear verbatim in DESIGN.md (repo.test.ts
// checks), so the rules stay in one place. Approved text is blanked before scanning.
export interface ApprovedException { text: string; files: string[]; designRef: string }

const NAV = 'components/layout/Nav.tsx'

export const APPROVED: ApprovedException[] = [
  { text: 'p-[11px]', files: [NAV], designRef: '手機選單按鈕 `p-[11px]`／`-mr-[11px]`' },
  { text: '-mr-[11px]', files: [NAV], designRef: '手機選單按鈕 `p-[11px]`／`-mr-[11px]`' },
  { text: 'pb-[max(1.5rem,env(safe-area-inset-bottom))]', files: [NAV], designRef: '手機滿版選單底部 `pb-[max(1.5rem,env(safe-area-inset-bottom))]`' },
  { text: 'max-[420px]:text-[27px]', files: ['components/home/HeroSection.tsx'], designRef: '`max-[420px]:text-[27px]`' },
  {
    text: 'radial-gradient(ellipse 85% 75% at 50% 45%, rgba(240,248,247,0.97) 0%, rgba(255,255,255,0.65) 65%, transparent 100%)',
    files: ['components/home/HeroSection.tsx', 'components/ui/PlaygroundCTASection.tsx'],
    designRef: 'radial-gradient(ellipse 85% 75% at 50% 45%, rgba(240,248,247,0.97) 0%, rgba(255,255,255,0.65) 65%, transparent 100%)',
  },
  {
    text: '0 0 0 1px rgba(168,197,195,0.28), 0 6px 28px rgba(34,93,89,0.24)',
    files: ['components/pages/partnership/PartnershipEarnings.tsx', 'components/pages/publishers/LayerOverview.tsx'],
    designRef: "boxShadow: '0 0 0 1px rgba(168,197,195,0.28), 0 6px 28px rgba(34,93,89,0.24)'",
  },
  { text: 'rgba(180,83,9,0.07)', files: ['components/pages/brands/BrandPainSection.tsx'], designRef: '/brands/ 痛點段落的琥珀光暈與琥珀短線' },
  { text: 'rgba(180,83,9,0.3)', files: ['components/pages/brands/BrandPainSection.tsx'], designRef: '/brands/ 痛點段落的琥珀光暈與琥珀短線' },
]
