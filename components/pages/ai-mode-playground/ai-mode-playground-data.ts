export type PlaygroundMode = 'chat' | 'quote' | 'listen'
const LEDGER_LENSES = ['media', 'brand'] as const
export type LedgerLens = (typeof LEDGER_LENSES)[number]

/** Lens values that used to be valid and are still in circulation as URLs.
 *  DATAI-555 writes the lens into the address bar, so `?lens=publisher` links
 *  exist in the wild; dropping the value outright would fail silently by
 *  falling back to the default lens. */
const LEGACY_LENS_ALIASES: Record<string, LedgerLens> = { publisher: 'media' }

export function isLedgerLens(value: unknown): value is LedgerLens {
  return typeof value === 'string' && (LEDGER_LENSES as readonly string[]).includes(value)
}

/** Static export has no server-side request access, so the lens can only be
 *  recovered from the browser URL after hydration. Pure so it can be tested
 *  without a DOM. */
export function readLensFromSearch(search: string): LedgerLens | null {
  const value = new URLSearchParams(search).get('lens')
  if (isLedgerLens(value)) return value
  if (value !== null && Object.hasOwn(LEGACY_LENS_ALIASES, value)) return LEGACY_LENS_ALIASES[value]
  return null
}
export type EventTone = 'raw' | 'signal'

export type QuoteSource = {
  text: string
  sourceType: 'attributed' | 'highlight'
  byline?: string
}

export type LedgerEvent = {
  id: string
  kind: string
  title: string
  detail: string
  tone: EventTone
  context: { mode?: PlaygroundMode; threshold?: number; signalKind?: string }
  lensCopy: Record<LedgerLens, { title: string; detail: string }>
}

export const ARTICLE = {
  kicker: 'HEARTHSIDE REVIEW · PET & FAMILY',
  title: 'Vets are rethinking what “senior” means for dogs',
  standfirst: 'New breed-weight guidance moves the senior threshold earlier—and changes what owners should consider feeding.',
  paragraphs: [
    'For large-breed dogs, age is only part of the picture. Weight, mobility, and the signs owners notice at home can all change the next decision.',
    'The revised guidance moves the senior threshold earlier for dogs over 50 pounds. The change reflects the cumulative load that a larger frame places on joints over time.',
    'That does not mean every older dog needs the same food. Activity level, body condition, and existing health concerns should shape the next conversation with a vet.',
    'Most owners start looking for answers when a familiar routine changes: a slower walk, stiffness after resting, or a dog that no longer wants to climb the stairs.',
    'Nutrition can support mobility, but it is not a substitute for a veterinary assessment. The useful question is often what to consider next—not which product is universally best.',
  ],
} as const

export const CHAT_CONTENT = {
  label: 'Chat',
  heading: 'Ask something about this article',
  questions: [
    'At what age should a large-breed dog switch to a senior formula?',
    'Which joint-support ingredients have evidence behind them?',
    'Is stiffness after walks something to check?',
  ],
  answers: [
    {
      selectedIntro: 'For large-breed dogs, the senior threshold can arrive earlier than many owners expect. Weight and cumulative joint load matter as much as calendar age.',
      selectedProductLead: 'Most guidance recommends considering nutrition before symptoms become severe.',
      product: 'Thornwell Senior Joint Formula',
      selectedProductTail: 'is one example matched to this decision moment.',
      grounded: 'Grounded in “Vets are rethinking what ‘senior’ means for dogs”',
    },
    {
      selectedIntro: 'The article does not name a single joint-support ingredient as the answer.',
      selectedProductLead: 'It says the next choice should account for',
      product: 'body size, activity level, body condition, and existing health concerns',
      selectedProductTail: 'with a vet before deciding what to try.',
      grounded: 'Grounded in “Vets are rethinking what ‘senior’ means for dogs”',
    },
    {
      selectedIntro: 'A slower walk, stiffness after resting, or avoiding the stairs is worth treating as an observation to track.',
      selectedProductLead: 'Bring',
      product: 'those changes to a veterinary conversation',
      selectedProductTail: 'so the next decision is based on a pattern, not one isolated moment.',
      grounded: 'Grounded in “Vets are rethinking what ‘senior’ means for dogs”',
    },
  ],
  signals: [
    { kind: 'declared_intent', title: 'Decision support', detail: 'The user asked a specific question, not just viewed a page.' },
    { kind: 'contextual_placement', title: 'In-answer citation', detail: 'The product appears inside the grounded answer moment.' },
  ],
} as const

export const QUOTE_CONTENT = {
  label: 'Make a quote',
  heading: 'Choose a line worth carrying forward',
  options: [
    { text: 'The senior threshold can arrive earlier than many owners expect.', sourceType: 'highlight' },
    { text: 'Weight and cumulative joint load matter as much as calendar age.', sourceType: 'highlight' },
    { text: 'Consider nutrition before symptoms become severe.', sourceType: 'highlight' },
  ] satisfies readonly QuoteSource[],
  signals: [
    { kind: 'content_resonance', title: 'A claim worth sharing', detail: 'The user selected the message they want to carry beyond the article.' },
    { kind: 'amplification_ready', title: 'Share-ready content', detail: 'A quote card turns a meaningful claim into a branded, portable format.' },
  ] as const,
} as const

export const LISTEN_CONTENT = {
  label: 'Listen',
  grounding: 'GROUNDED IN THIS ARTICLE',
  status: 'Ready to listen',
  playingStatus: 'Playing story + brand moment',
  durationSeconds: 32,
  sponsoredAttentionThresholdSeconds: 13,
  signals: [
    { kind: 'attention_start', title: 'Listening started', detail: 'The user chose an audio path through the story.' },
  ] as const,
} as const

export const WAVEFORM_BARS = [
  18, 31, 24, 42, 28, 54, 36, 64, 40, 26, 48, 70, 34, 58, 23, 45, 67, 32, 52, 76,
  39, 61, 29, 49, 72, 35, 56, 25, 43, 63, 30, 51, 69, 37, 57, 27, 22, 46, 33, 59,
  41, 68, 30, 53, 75, 38, 62, 26, 47, 71, 34, 55, 24, 44, 66, 31, 50, 73, 36, 58,
  28, 42, 64, 29, 52, 70, 35, 60, 27, 48,
] as const

type LensCopy = Record<LedgerLens, { title: string; detail: string }>
type ModeLensCopy = Record<PlaygroundMode, LensCopy>

const ROLE_COPY = {
  widget_impression: {
    media: { title: 'User reached the next layer', detail: 'The article-end experience earned a visible user moment.' },
    brand: { title: 'Qualified placement viewed', detail: 'Your brand moment was visible in a context the user chose to reach.' },
  },
  widget_click: {
    chat: {
      media: { title: 'Topic preference captured', detail: 'You can see what the user wants to understand next.' },
      brand: { title: 'Active need surfaced', detail: 'You can see a specific need behind the interaction.' },
    },
    quote: {
      media: { title: 'Editorial resonance captured', detail: 'You can see which claim earns user attention.' },
      brand: { title: 'Message resonance captured', detail: 'You can see which claim earns attention in context.' },
    },
    listen: {
      media: { title: 'Format engagement started', detail: 'You can see the user choose a deeper way to continue.' },
      brand: { title: 'Audio attention opened', detail: 'You gained a path into the user’s attention.' },
    },
  },
  article_scroll: {
    media: { title: 'Reading depth captured', detail: 'You can see how far the user stayed with the story.' },
    brand: { title: 'Attention depth captured', detail: 'You can see the user moved beyond a passive view.' },
  },
  declared_intent: {
    media: { title: 'Topic intent captured', detail: 'You can understand the user’s next information need.' },
    brand: { title: 'Consideration need surfaced', detail: 'You can see an active need forming around the category.' },
  },
  contextual_placement: {
    media: { title: 'Contextual engagement created', detail: 'You created a useful in-article moment without interrupting reading.' },
    brand: { title: 'Relevant placement reached', detail: 'You appeared where the user was actively exploring an answer.' },
  },
  content_resonance: {
    media: { title: 'Editorial resonance captured', detail: 'You can see which claim deserves continued distribution.' },
    brand: { title: 'Message resonance captured', detail: 'You can see which message earns attention in context.' },
  },
  amplification_ready: {
    media: { title: 'Share-ready editorial asset', detail: 'You have a format that can extend the story beyond the article.' },
    brand: { title: 'Branded amplification ready', detail: 'You have a contextual message ready to travel with the user.' },
  },
  attention_start: {
    media: { title: 'Audio engagement started', detail: 'You can see a deeper reading format begin.' },
    brand: { title: 'Brand attention opened', detail: 'You gain a new attention path within the story.' },
  },
  sponsored_attention: {
    media: { title: 'Sponsored media value reached', detail: 'You can see a sponsored placement hold the user through the moment.' },
    brand: { title: 'Sponsored attention qualified', detail: 'You can see your audio placement hold the user through the moment.' },
  },
  share: {
    media: { title: 'User amplification completed', detail: 'You can see the selected claim leave the article through a local mock share action.' },
    brand: { title: 'Content carried outward', detail: 'You can see the selected quote move beyond the article.' },
  },
} as const

const LENS_CONTENT = {
  brand: {
    heading: 'See the demand behind the interaction.',
    intro: 'A user action becomes a declared need, a purchase stage, and a relevant placement opportunity.',
    projectionTitle: 'Brand projection',
    projection: 'The same user event helps you understand intent, placement, and attributable value.',
  },
  media: {
    heading: 'See the user relationship grow.',
    intro: 'A user action becomes a topic preference, an engagement moment, and a clue about what to show next.',
    projectionTitle: 'Media projection',
    projection: 'The same user event helps you improve engagement, retention, and monetization.',
  },
} as const

export function getLensContent(lens: LedgerLens) {
  return LENS_CONTENT[lens]
}

export function resolveLensCopy({
  kind,
  mode,
  threshold,
  signalKind,
  title,
  detail,
}: {
  kind: string
  mode?: PlaygroundMode
  threshold?: number
  signalKind?: string
  title: string
  detail: string
}): Record<LedgerLens, { title: string; detail: string }> {
  const copyKey = signalKind ?? kind
  const copy = ROLE_COPY[copyKey as keyof typeof ROLE_COPY]
  const scoped = copyKey === 'widget_click' && mode
    ? (copy as ModeLensCopy)[mode]
    : copy

  if (scoped && 'media' in scoped) return scoped as LensCopy
  if (copyKey === 'article_scroll' && threshold && threshold >= 25) {
    return ROLE_COPY.article_scroll as LensCopy
  }
  return {
    media: { title: `Media value captured: ${title}`, detail: `You captured this user event: ${detail}` },
    brand: { title: `Brand value captured: ${title}`, detail: `You captured this user event: ${detail}` },
  }
}
