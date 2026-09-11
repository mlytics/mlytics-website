export type CortexMode = 'chat' | 'quote' | 'listen'
const CORTEX_LENSES = ['publisher', 'brand'] as const
export type CortexLens = (typeof CORTEX_LENSES)[number]

export function isCortexLens(value: unknown): value is CortexLens {
  return typeof value === 'string' && (CORTEX_LENSES as readonly string[]).includes(value)
}

/** Static export has no server-side request access, so the lens can only be
 *  recovered from the browser URL after hydration. Pure so it can be tested
 *  without a DOM. */
export function readLensFromSearch(search: string): CortexLens | null {
  try {
    const value = new URLSearchParams(search).get('lens')
    return isCortexLens(value) ? value : null
  } catch {
    return null
  }
}
export type EventTone = 'raw' | 'signal'

export type QuoteSource = {
  text: string
  sourceType: 'attributed' | 'highlight'
  byline?: string
}

export type CortexEvent = {
  id: string
  kind: string
  title: string
  detail: string
  tone: EventTone
  context: { mode?: CortexMode; threshold?: number; signalKind?: string }
  lensCopy: Record<CortexLens, { title: string; detail: string }>
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
    { kind: 'declared_intent', title: 'Decision support', detail: 'The reader asked a specific question, not just viewed a page.' },
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
    { kind: 'content_resonance', title: 'A claim worth sharing', detail: 'The reader selected the message they want to carry beyond the article.' },
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
    { kind: 'attention_start', title: 'Listening started', detail: 'The reader chose an audio path through the story.' },
  ] as const,
} as const

export const WAVEFORM_BARS = [
  18, 31, 24, 42, 28, 54, 36, 64, 40, 26, 48, 70, 34, 58, 23, 45, 67, 32, 52, 76,
  39, 61, 29, 49, 72, 35, 56, 25, 43, 63, 30, 51, 69, 37, 57, 27, 22, 46, 33, 59,
  41, 68, 30, 53, 75, 38, 62, 26, 47, 71, 34, 55, 24, 44, 66, 31, 50, 73, 36, 58,
  28, 42, 64, 29, 52, 70, 35, 60, 27, 48,
] as const

type LensCopy = Record<CortexLens, { title: string; detail: string }>
type ModeLensCopy = Record<CortexMode, LensCopy>

const ROLE_COPY = {
  widget_impression: {
    publisher: { title: 'Reader reached the next layer', detail: 'The article-end experience earned a visible reader moment.' },
    brand: { title: 'Qualified placement viewed', detail: 'The brand moment was visible in a context the reader chose to reach.' },
  },
  widget_click: {
    chat: {
      publisher: { title: 'Topic preference captured', detail: 'The publisher can see what the reader wants to understand next.' },
      brand: { title: 'Active need surfaced', detail: 'The brand can see a specific need behind the interaction.' },
    },
    quote: {
      publisher: { title: 'Editorial resonance captured', detail: 'The publisher can see which claim earns reader attention.' },
      brand: { title: 'Message resonance captured', detail: 'The brand can see which claim earns attention in context.' },
    },
    listen: {
      publisher: { title: 'Format engagement started', detail: 'The publisher can see the reader choose a deeper way to continue.' },
      brand: { title: 'Audio attention opened', detail: 'The brand gained a path into the reader’s attention.' },
    },
  },
  article_scroll: {
    publisher: { title: 'Reading depth captured', detail: 'The publisher can see how far the reader stayed with the story.' },
    brand: { title: 'Attention depth captured', detail: 'The brand can see the reader moved beyond a passive view.' },
  },
  declared_intent: {
    publisher: { title: 'Topic intent captured', detail: 'The publisher can understand the reader’s next information need.' },
    brand: { title: 'Consideration need surfaced', detail: 'The brand can see an active need forming around the category.' },
  },
  contextual_placement: {
    publisher: { title: 'Contextual engagement created', detail: 'The publisher created a useful in-article moment without interrupting reading.' },
    brand: { title: 'Relevant placement reached', detail: 'The brand appeared where the reader was actively exploring an answer.' },
  },
  content_resonance: {
    publisher: { title: 'Editorial resonance captured', detail: 'The publisher sees which claim deserves continued distribution.' },
    brand: { title: 'Message resonance captured', detail: 'The brand sees which message earns attention in context.' },
  },
  amplification_ready: {
    publisher: { title: 'Share-ready editorial asset', detail: 'The publisher has a format that can extend the story beyond the article.' },
    brand: { title: 'Branded amplification ready', detail: 'The brand has a contextual message ready to travel with the reader.' },
  },
  attention_start: {
    publisher: { title: 'Audio engagement started', detail: 'The publisher sees a deeper reading format begin.' },
    brand: { title: 'Brand attention opened', detail: 'The brand gains a new attention path within the story.' },
  },
  sponsored_attention: {
    publisher: { title: 'Sponsored media value reached', detail: 'The publisher sees a sponsored placement hold the reader through the moment.' },
    brand: { title: 'Sponsored attention qualified', detail: 'The brand sees its audio placement hold the reader through the moment.' },
  },
  share: {
    publisher: { title: 'Reader amplification completed', detail: 'The publisher sees the selected claim leave the article through a local mock share action.' },
    brand: { title: 'Content carried outward', detail: 'The brand sees the selected quote move beyond the article.' },
  },
} as const

const LENS_CONTENT = {
  brand: {
    heading: 'See the demand behind the interaction.',
    intro: 'A reader action becomes a declared need, a purchase stage, and a relevant placement opportunity.',
    projectionTitle: 'Brand projection',
    projection: 'The same reader event helps the brand understand intent, placement, and attributable value.',
  },
  publisher: {
    heading: 'See the reader relationship grow.',
    intro: 'A reader action becomes a topic preference, an engagement moment, and a clue about what to show next.',
    projectionTitle: 'Media projection',
    projection: 'The same reader event helps the publisher improve engagement, retention, and monetization.',
  },
} as const

export function getLensContent(lens: CortexLens) {
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
  mode?: CortexMode
  threshold?: number
  signalKind?: string
  title: string
  detail: string
}): Record<CortexLens, { title: string; detail: string }> {
  const copyKey = signalKind ?? kind
  const copy = ROLE_COPY[copyKey as keyof typeof ROLE_COPY]
  const scoped = copyKey === 'widget_click' && mode
    ? (copy as ModeLensCopy)[mode]
    : copy

  if (scoped && 'publisher' in scoped) return scoped as LensCopy
  if (copyKey === 'article_scroll' && threshold && threshold >= 25) {
    return ROLE_COPY.article_scroll as LensCopy
  }
  return {
    publisher: { title: `Publisher value captured: ${title}`, detail: `The publisher captured this reader event: ${detail}` },
    brand: { title: `Brand value captured: ${title}`, detail: `The brand captured this reader event: ${detail}` },
  }
}
