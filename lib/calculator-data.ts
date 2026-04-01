// ─── Publisher Revenue Calculator ────────────────────────────────────────────

type ContentType = 'finance' | 'health' | 'news' | 'lifestyle'

const INTENT_RATES: Record<ContentType, { intentRate: number; strongIntentPct: number; cpl: number; cpmEquiv: number }> = {
  finance:   { intentRate: 0.087, strongIntentPct: 0.62, cpl: 512,  cpmEquiv: 5.0 },
  health:    { intentRate: 0.064, strongIntentPct: 0.55, cpl: 280,  cpmEquiv: 4.2 },
  news:      { intentRate: 0.038, strongIntentPct: 0.40, cpl: 180,  cpmEquiv: 2.8 },
  lifestyle: { intentRate: 0.045, strongIntentPct: 0.45, cpl: 180,  cpmEquiv: 3.1 },
}

export type PublisherResult = {
  intentSignals: number
  strongIntentLeads: number
  cplRevenue: number
  cpmRevenue: number
  upliftRatio: number
}

export function calculatePublisherRevenue(monthlyPV: number, contentType: ContentType): PublisherResult {
  const cfg = INTENT_RATES[contentType]
  const intentSignals = Math.round(monthlyPV * cfg.intentRate)
  const strongIntentLeads = Math.round(intentSignals * cfg.strongIntentPct)
  const cplRevenue = Math.round(strongIntentLeads * cfg.cpl * 0.35) // publisher rev share ~35%
  const cpmRevenue = Math.round((monthlyPV / 1000) * cfg.cpmEquiv)
  const upliftRatio = cpmRevenue > 0 ? Math.round((cplRevenue / cpmRevenue) * 10) / 10 : 0
  return { intentSignals, strongIntentLeads, cplRevenue, cpmRevenue, upliftRatio }
}

// ─── Brand Audience Simulator ─────────────────────────────────────────────────

type AgeRange = '25-34' | '35-44' | '45-54' | '55+'
type BehaviorTag = 'researching' | 'comparing' | 'ready'
type InterestCategory = 'finance' | 'insurance' | 'health' | 'tech'

const BASE_WAU = 4_000_000

const AGE_WEIGHTS: Record<AgeRange, number> = {
  '25-34': 0.28,
  '35-44': 0.31,
  '45-54': 0.24,
  '55+':   0.17,
}

const BEHAVIOR_WEIGHTS: Record<BehaviorTag, { users: number; cpl: number; confidence: number }> = {
  researching: { users: 0.45, cpl: 120, confidence: 0.68 },
  comparing:   { users: 0.33, cpl: 320, confidence: 0.82 },
  ready:       { users: 0.12, cpl: 512, confidence: 0.87 },
}

const INTEREST_WEIGHTS: Record<InterestCategory, number> = {
  finance:   0.22,
  insurance: 0.18,
  health:    0.25,
  tech:      0.15,
}

const MEDIA_PLATFORMS: Record<InterestCategory, string[]> = {
  finance:   ['鉅亨網', 'UDN 財經', '工商時報', 'MoneyDJ'],
  insurance: ['鉅亨網', '保險市集', 'UDN 財經', '今周刊'],
  health:    ['早安健康', 'Heho 健康', '康健雜誌', 'TVBS 健康+'],
  tech:      ['TechOrange', '數位時代', 'T客邦', 'iThome'],
}

export type AudienceResult = {
  matchingUsers: number
  platforms: string[]
  cpl: number
  confidence: number
}

export function simulateAudience(
  age: AgeRange,
  behavior: BehaviorTag,
  interest: InterestCategory
): AudienceResult {
  const behaviorCfg = BEHAVIOR_WEIGHTS[behavior]
  const matchingUsers = Math.round(
    BASE_WAU * AGE_WEIGHTS[age] * INTEREST_WEIGHTS[interest] * behaviorCfg.users
  )
  return {
    matchingUsers,
    platforms: MEDIA_PLATFORMS[interest],
    cpl: behaviorCfg.cpl,
    confidence: behaviorCfg.confidence,
  }
}

// ─── Developer TCO Calculator ────────────────────────────────────────────────

export type TCOResult = {
  monthlySavings: number
  annualSavings: number
  latencyReduction: string
  breakEvenMonths: number
}

const DECISIVE_MONTHLY_BASE = 1000 // $1,000/month Decisive Engine fee

export function calculateTCO(
  currentCdnCost: number
): TCOResult {
  const savingsRate = 0.20
  const grossSavings = Math.round(currentCdnCost * savingsRate)
  const monthlySavings = Math.max(0, grossSavings - DECISIVE_MONTHLY_BASE)
  const annualSavings = monthlySavings * 12
  const breakEvenMonths = monthlySavings > 0
    ? Math.ceil(DECISIVE_MONTHLY_BASE / grossSavings * 1)
    : 999

  return {
    monthlySavings,
    annualSavings,
    latencyReduction: '< 50ms P99',
    breakEvenMonths: Math.min(breakEvenMonths, 12),
  }
}
