/**
 * Single source of every user-visible English string on /ai-mode-playground/.
 * Components import from here; no literal copy in TSX.
 *
 * Localized from the approved zh-Hant prototype
 * (ai-mode-customer-type-dual-paths-signal-canvas-zh-2026-10-05.html).
 * Review table: docs/ai-mode-playground-copy-zh-en.md
 */

export type PlaygroundLens = 'content-owners' | 'brands' // doubles as "customer type"; content-owners = Media & Content Owners
export type ExperienceId = 'chat' | 'quote' | 'listen'
export type QuoteFeedback = string // one of QUOTE_FEEDBACK_OPTIONS
export type ShareAction = 'line' | 'fb' | 'download'

export type Evidence = { observed: string; comparison: string; supports: string }
export type PathContent = { question: string; decision: string; unit: string; value: string; evidence: Evidence[] }
export type BusinessPath = PathContent & { name: string; chatVariants: readonly [PathContent, PathContent, PathContent] }

export const PAGE_META: { title: string; description: string } = {
  title: 'Mlytics AI Mode · Mlytics',
  description:
    'Try Mlytics AI Mode the way your users would — Chat, Quote, and Listen — and follow each interaction from raw signal to a business decision for Media & Content Owners and Brands.',
}

export const HERO: { eyebrow: string; title: string; copy: string } = {
  eyebrow: 'AI Mode',
  title: 'From user behavior to business direction.',
  copy: 'Read the signals behind every interaction, and let the data point to your next decision.',
}

export const LENS_LABELS: Record<PlaygroundLens, string> = {
  'content-owners': 'Media & Content Owners',
  brands: 'Brands',
}

export const EXPERIENCE_LABELS: Record<ExperienceId, string> = {
  chat: 'Chat',
  quote: 'Quote',
  listen: 'Listen',
}

export const EXPERIENCE_INSTRUCTIONS: Record<ExperienceId, string> = {
  chat: 'Step into your users’ shoes: pick a question and see what happens.',
  quote: 'Step into your users’ shoes: pick the line that resonates most, then tell us how it lands.',
  listen: 'Step into your users’ shoes: press play, then watch the start and completion signals come in.',
}

export const LISTEN_DURATION_SECONDS = 32

export const EXPERIENCE_DEFAULT_OBSERVATION: Record<ExperienceId, string> = {
  chat: 'The user picks a question, and the AI gives a grounded answer drawn from the article.',
  quote: 'The user picks a standout line and leaves feedback before sharing it.',
  listen: `The user starts a ${LISTEN_DURATION_SECONDS}-second audio overview of the article’s context.`,
}

export const CHAT_QUESTIONS: readonly [string, string, string] = [
  'iPhone 18 Pro full specs, explained',
  'iPhone 18 Pro vs. iPhone Duo: how do they compare?',
  'How does iPhone 18 Pro stack up against other 2026 flagship phones?',
] as const

export const QUOTE_OPTIONS: readonly [string, string, string] = [
  'Before you choose, make your criteria clear.',
  'Useful answers leave useful signals.',
  'The next step isn’t more content. It’s better comparisons.',
] as const

export const QUOTE_FEEDBACK_OPTIONS: readonly [string, string, string] = ['Resonates', 'Helpful', 'Really?'] as const

export const PATHS: Record<PlaygroundLens, readonly [BusinessPath, BusinessPath]> = {
  'content-owners': [
    {
      name: 'Content Experience',
      question: 'What new content experiences could create more value for your users?',
      decision: 'Which topics are worth expanding?',
      unit: 'Comparison guides, further reading, topic audio, and curated collections.',
      value:
        'What users asked, what stuck with them, whether they finished — AI Mode pulls these signals together automatically. You only decide which topic gets your next content investment.',
      evidence: [
        {
          observed: 'Questions, quotes, completions, content choices',
          comparison: 'Compare topics against the choices users made next',
          supports: 'Informs content investment decisions.',
        },
      ],
      chatVariants: [
        {
          question: 'Are one product’s specs worth turning into a searchable piece with further reading?',
          decision: 'Should a specs roundup and related reading for this product move up your list?',
          unit: 'A specs page, a key-takeaways summary, and further reading organized by spec.',
          value:
            'When users open a single-spec question and read the full answer, AI Mode logs it automatically. Your call is whether this topic earns its own content page.',
          evidence: [
            {
              observed: 'Question, completion status, further-reading clicks',
              comparison: 'Compare completion and further-reading rates across spec topics',
              supports: 'Informs whether to produce a specs roundup.',
            },
          ],
        },
        {
          question: 'Is a head-to-head between two products worth its own comparison piece?',
          decision: 'Should a comparison guide for these two products move up your list?',
          unit: 'A two-product comparison table, with versions for different use cases.',
          value:
            'Users chose a comparison question and read the whole answer, and AI Mode recorded both automatically. You decide whether this pairing deserves a full comparison guide.',
          evidence: [
            {
              observed: 'Question, completion status, comparison-criteria clicks',
              comparison: 'Compare completion and next choices across product pairings',
              supports: 'Informs whether to produce a comparison guide.',
            },
          ],
        },
        {
          question: 'Is a whole product category worth a reusable category guide?',
          decision: 'Should a guide and filtering framework for this category move up your list?',
          unit: 'A category guide, shared-criteria filters, and curated product lists.',
          value:
            'AI Mode automatically records that users picked a cross-product question and finished the answer. What’s left for you: deciding whether this category merits a guide you’ll maintain over time.',
          evidence: [
            {
              observed: 'Question, completion status, category-filter interactions',
              comparison: 'Compare completion and filtering behavior across category frameworks',
              supports: 'Informs whether to produce a category guide.',
            },
          ],
        },
      ],
    },
    {
      name: 'Brand Partnerships',
      question:
        'AI Mode lets users interact with your content in real time. Can your sales team package those moments into partnerships brands will pay for?',
      decision: 'Which experience, at which content moment, is worth shaping into a brand partnership unit?',
      unit: 'Sponsored Ask, branded Quote, topic sponsorships, and a custom brand AI assistant.',
      value:
        'Which content moment an interaction happened in, and how users responded to the CTA — AI Mode records all of it automatically. Your sales team only decides whether to package that moment as a partnership.',
      evidence: [
        {
          observed: 'Interaction context, content moment, CTA, next choice',
          comparison: 'Compare partnership contexts',
          supports: 'Informs whether to keep or adjust a package.',
        },
      ],
      chatVariants: [
        {
          question:
            'When users are checking one product’s specs, is that the right moment for a brand to add context through a sponsored Ask?',
          decision: 'Is this spec context worth pitching as a single-brand sponsorship?',
          unit: 'A sponsored Ask that adds spec context, with brand proof links.',
          value:
            'Whether users open sponsored content in this spec context, and whether they act on it, is recorded by AI Mode automatically. Your sales team just decides whether to pitch this sponsorship slot.',
          evidence: [
            {
              observed: 'CTA impressions, clicks, next choice',
              comparison: 'Compare engagement with and without sponsored content',
              supports: 'Informs whether to open this sponsorship slot.',
            },
          ],
        },
        {
          question:
            'When users are comparing two products, is that the right moment for a brand proof card that backs up one difference?',
          decision: 'Is this comparison worth pitching as a proof card partnership?',
          unit: 'Branded comparison proof cards, with links that back up the difference.',
          value:
            'AI Mode automatically tracks whether users expand the proof card in this comparison and whether they act. Your sales team decides one thing: whether to pitch this proof card partnership.',
          evidence: [
            {
              observed: 'Proof card expansions, clicks, next choice',
              comparison: 'Compare engagement with and without a proof card',
              supports: 'Informs whether to open this proof card partnership.',
            },
          ],
        },
        {
          question:
            'When users are browsing a whole category, is that the right moment for a topic sponsorship that builds category-level visibility?',
          decision: 'Is this category context worth pitching as a topic sponsorship?',
          unit: 'A sponsored topic guide, and a custom brand AI assistant at the category level.',
          value:
            'Whether users engage with sponsored content in this category context is something AI Mode records automatically. Your sales team only decides whether to pitch the topic sponsorship.',
          evidence: [
            {
              observed: 'Sponsorship impressions, interactions, next choice',
              comparison: 'Compare engagement with and without a topic sponsorship',
              supports: 'Informs whether to open this topic sponsorship.',
            },
          ],
        },
      ],
    },
  ],
  brands: [
    {
      name: 'Audience & Messaging',
      question:
        'From what users ask and how they react, can you tell who your audience is, which message fits, and which markets or segments are most likely to convert?',
      decision:
        'Which audience context or message variant should you test next, and which markets or segments deserve your conversion resources first?',
      unit: 'Contextual CTAs, brand proof cards, message variants and engagement campaigns, plus markets and segments ranked by signal strength for conversion intent.',
      value:
        'What users asked, how they chose to compare, how they responded to CTAs — AI Mode turns all of it into comparable signals automatically. You only decide which message to test next and which market or segment gets the resources.',
      evidence: [
        {
          observed: 'Question text, comparison criteria, shares, CTAs, branches, and how signal strength is distributed',
          comparison: 'Compare message variants by audience context, and rank markets and segments by signal strength',
          supports:
            'Informs message and CTA testing, and how you allocate conversion resources across markets or segments.',
        },
      ],
      chatVariants: [
        {
          question:
            'When users ask only about one product’s specs, what audience context does that point to, and which spec-led message should you test?',
          decision: 'Should your next round prioritize spec-led messaging for this audience?',
          unit: 'Spec-led message variants and single-benefit cards.',
          value:
            'A user choosing a spec question signals a clear audience context, and AI Mode records it automatically. You decide whether to invest in testing spec-led messages for this group.',
          evidence: [
            {
              observed: 'Question text, message-variant expansions, CTA',
              comparison: 'Compare variants of spec-led messaging',
              supports: 'Informs whether to invest in spec-led message testing.',
            },
          ],
        },
        {
          question:
            'When users compare two products, what audience context does that point to, and which differentiation message should you test?',
          decision: 'Should your next round prioritize differentiation messaging for this audience?',
          unit: 'Differentiation message variants and comparison proof cards.',
          value:
            'Picking a comparison question marks an audience that’s weighing trade-offs, and AI Mode captures it automatically. Whether to invest in differentiation message testing for them is your call.',
          evidence: [
            {
              observed: 'Comparison criteria, message-variant expansions, CTA',
              comparison: 'Compare variants of differentiation messaging',
              supports: 'Informs whether to invest in differentiation message testing.',
            },
          ],
        },
        {
          question:
            'When users look across a whole category, what audience context does that point to, and which category-positioning message should you test?',
          decision:
            'Should your next round prioritize category-positioning messaging for this audience, and which market or segment should come first?',
          unit: 'Category-positioning message variants and category-level proof cards.',
          value:
            'A cross-product question marks an audience building its own filters for the category. AI Mode records it automatically; you decide whether to invest in category-positioning tests for this group, and which market or segment to target first.',
          evidence: [
            {
              observed: 'Category criteria, message-variant expansions, CTA',
              comparison:
                'Compare variants of category-positioning messaging, and rank markets and segments by signal strength',
              supports: 'Informs whether to invest in category-positioning tests, and how to prioritize markets or segments.',
            },
          ],
        },
      ],
    },
    {
      name: 'Product Understanding',
      question:
        'From the questions people ask and the comparisons they choose, can you see how they actually understand — and describe — your product?',
      decision:
        'Should this perception gap shape your education content, your product positioning, or your marketing message first?',
      unit: 'Product Ask, product knowledge cards, interactive walkthroughs, and a perception-gap report for your product and marketing teams.',
      value:
        'AI Mode compiles the questions users actually ask and the comparisons they choose into a perception-gap report, automatically. Your product or marketing team decides what to do with it: revise education content, adjust product positioning, or reshape your marketing message.',
      evidence: [
        {
          observed: 'Product questions, comparison choices, quotes, walkthrough paths',
          comparison: 'Compare the understanding gaps that different explanations and paths create',
          supports:
            'Informs product education updates, and serves as a reference for refining product positioning or marketing messages.',
        },
      ],
      chatVariants: [
        {
          question:
            'When users ask only about one product’s specs, where is their basic understanding of the product getting stuck?',
          decision: 'Which spec topic needs better education content first?',
          unit: 'Single-product knowledge cards, spec walkthroughs, and plain-language term explainers.',
          value:
            'AI Mode turns the spec topics users ask about into a list of foundational knowledge gaps, automatically. Your product or marketing team decides which spec to explain better first.',
          evidence: [
            {
              observed: 'Spec topics, follow-up questions',
              comparison: 'Compare how often each spec topic comes up',
              supports: 'Informs which spec education content to strengthen first.',
            },
          ],
        },
        {
          question:
            'When users compare two products, where is their understanding of the difference between them getting stuck?',
          decision: 'Which comparison criterion needs a clearer explanation first?',
          unit: 'Knowledge cards on relative differences, and criteria-based comparison explainers.',
          value:
            'The comparison criteria users pick become a list of gaps in how they understand the difference — AI Mode compiles it automatically. Your product or marketing team decides which criterion to explain better first.',
          evidence: [
            {
              observed: 'Comparison criteria, follow-up questions',
              comparison: 'Compare how often each comparison criterion comes up',
              supports: 'Informs which difference to explain better first.',
            },
          ],
        },
        {
          question:
            'When users look across a whole category, where is their understanding of your product’s place in it getting stuck?',
          decision:
            'Which part of your category positioning needs a clearer explanation first — or should this go back to the positioning itself?',
          unit: 'Category-positioning knowledge cards and product-lineup comparison explainers.',
          value:
            'From the category criteria users choose, AI Mode automatically builds a list of positioning gaps. Your product or marketing team decides whether to sharpen the category explanation first or take it back to the product positioning itself.',
          evidence: [
            {
              observed: 'Category criteria, follow-up questions',
              comparison: 'Compare how often each category framework comes up',
              supports: 'Informs whether to strengthen category-positioning content or feed back into product positioning.',
            },
          ],
        },
      ],
    },
  ],
}

export const CUSTOMER_CTA: Record<
  PlaygroundLens,
  { label: string; href: '/content-owners' | '/brands'; description: string }
> = {
  'content-owners': {
    label: 'Learn more',
    href: '/content-owners',
    description: 'See how content experiences and brand partnerships can grow from here.',
  },
  brands: {
    label: 'Learn more',
    href: '/brands',
    description: 'See how audience signals inform brand and product decisions.',
  },
}

export const UI: {
  experienceTablistLabel: string
  reset: string
  chat: { title: string; questionsLabel: string }
  quote: {
    title: string
    step1: string
    optionsLabel: string
    step2: string
    feedbackLabel: string
    signatureLabel: string
    signaturePlaceholder: string
    previewLabel: string
    previewEmpty: string
    anonymous: string
    sponsoredBy: string
    actionsLabel: string
    actions: Record<ShareAction, string>
  }
  listen: {
    title: string
    play: string
    pause: string
    replay: string
    progressLabel: string
    status: { ready: string; playing: string; completed: string }
  }
  canvas: { sectionLabel: string; title: string; customerPrompt: string; customerTablistLabel: string; flowLabel: string }
  stages: {
    s01: { label: string; title: string }
    s02: { label: string; title: string; empty: string; capturedPrefix: string }
    pathsHead: { title: string; pathLabel: string; listLabel: string }
    s03: { label: string; title: string }
    s04: { label: string; title: string }
    s05: { label: string; title: string }
  }
  cell: { question: string; decision: string; unit: string; value: string; observed: string; comparison: string; supports: string }
  cta: { label: string; title: string; bookDemo: string }
} = {
  experienceTablistLabel: 'Choose an AI Mode experience',
  reset: 'Reset',
  chat: {
    title: 'Got a question? AI answers it.',
    questionsLabel: 'Suggested questions',
  },
  quote: {
    title: 'Take the words that resonate with you',
    step1: '1 · Pick a line',
    optionsLabel: 'Quote options',
    step2: '2 · How does this line make you feel?',
    feedbackLabel: 'Quote feedback',
    signatureLabel: 'Signature (optional)',
    signaturePlaceholder: 'Add your name',
    previewLabel: 'Social share preview',
    previewEmpty: 'Pick a line and your share preview will appear here.',
    anonymous: 'Anonymous user',
    sponsoredBy: 'Sponsored by',
    actionsLabel: 'Social share actions',
    actions: { line: 'LINE', fb: 'FB', download: 'Download' },
  },
  listen: {
    title: 'Keep exploring by ear',
    play: 'Play',
    pause: 'Pause',
    replay: 'Replay',
    progressLabel: 'Audio progress',
    status: { ready: 'Ready to play', playing: 'Playing', completed: 'Completed' },
  },
  canvas: {
    sectionLabel: 'Customer decision flow',
    title: 'From signals to two business value paths',
    customerPrompt: 'Whose decision path do you want to see first?',
    customerTablistLabel: 'Choose a customer type',
    flowLabel: 'Decision flow, steps 01 to 05',
  },
  stages: {
    s01: { label: 'User interaction', title: 'What the user did' },
    s02: {
      label: 'Captured data',
      title: 'Raw data from this interaction',
      empty: 'Complete an experience above to see the raw data it generates.',
      capturedPrefix: 'Captured: ',
    },
    pathsHead: { title: 'Two business paths', pathLabel: 'Path', listLabel: 'Business paths' },
    s03: { label: 'Customer decision', title: 'From interaction signals to next steps' },
    s04: { label: 'Offering', title: 'Business offerings you can monetize' },
    s05: { label: 'Evidence', title: 'Signals you can compare and act on' },
  },
  cell: {
    question: 'The question this path answers',
    decision: 'Decision',
    unit: 'What you can sell or deploy',
    value: 'Why this signal matters',
    observed: 'What’s observed',
    comparison: 'How it’s compared',
    supports: 'Decisions it supports',
  },
  cta: {
    label: 'Next step',
    title: 'Bring this interaction signal into your next decision',
    bookDemo: 'Book a Demo',
  },
}

// ---------------------------------------------------------------------------
// Dynamic strings — pure functions, no JSX
// ---------------------------------------------------------------------------

/** Drops a trailing sentence period so an embedded quote doesn't produce `.”.` */
const withoutTrailingPeriod = (text: string) => text.replace(/\.$/, '')

/** Ends a sentence with a period unless the embedded value already ends in . ? or ! */
const endSentence = (text: string) => (/[.?!]$/.test(text) ? text : `${text}.`)

/** ['LINE'] → 'LINE'; ['LINE','FB'] → 'LINE and FB'; ['LINE','FB','Download'] → 'LINE, FB, and Download' */
const joinList = (items: string[]) => {
  if (items.length <= 1) return items.join('')
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

export const CAPTURE: {
  chat: (question: string) => { observation: string; rawSignal: string }
  quote: (args: { quote: string; feedback: string; shareActions: string[] }) => { observation: string; rawSignal: string }
  listenStarted: { observation: string; rawSignal: string }
  listenCompleted: { observation: string; rawSignal: string }
} = {
  chat: (question) => ({
    observation: `The user picked “${question}”, and the AI answered in full, grounded in the article rather than made up.`,
    rawSignal: `The user asked “${question}”; the AI answered from the article, and the user read the full answer.`,
  }),
  quote: ({ quote, feedback, shareActions }) => {
    const line = withoutTrailingPeriod(quote)
    const parts = [`The user picked the line “${line}”`]
    if (feedback) parts.push(`responded “${feedback}”`)
    if (shareActions.length) {
      const buttons = shareActions.length > 1 ? 'share buttons' : 'share button'
      parts.push(`clicked the ${joinList(shareActions)} ${buttons} (a click doesn’t confirm the share went through)`)
    }
    const rawSignal =
      parts.length === 1 ? `${parts[0]}.` : `${parts.slice(0, -1).join(', ')}${parts.length > 2 ? ',' : ''} and ${parts[parts.length - 1]}.`
    const observation = feedback
      ? `The user picked the line “${line}” and left the feedback “${feedback}”${/[?!]$/.test(feedback) ? '' : '.'}`
      : `The user picked the line “${line}”.`
    return { observation, rawSignal }
  },
  listenStarted: {
    observation: 'The user pressed play and started listening to the audio overview of the article’s context.',
    rawSignal: `The user pressed play and started the ${LISTEN_DURATION_SECONDS}-second audio.`,
  },
  listenCompleted: {
    observation: `The user listened to the ${LISTEN_DURATION_SECONDS}-second audio from start to finish.`,
    rawSignal: `The user listened to the ${LISTEN_DURATION_SECONDS}-second audio from start to finish.`,
  },
}

export const ANNOUNCE: {
  experienceSelected: (label: string) => string
  customerSwitched: (lensLabel: string) => string
  customerSwitchedWithCapture: string
  completed: (label: string) => string
  reset: (label: string) => string
  chatAnswered: string
  quoteSelected: string
  feedbackSelected: (value: string) => string
  shareRecorded: (label: string) => string
  listenPlaying: string
  listenPaused: string
} = {
  experienceSelected: (label) => `${label} selected.`,
  customerSwitched: (lensLabel) => `Switched to ${lensLabel}.`,
  customerSwitchedWithCapture: 'The same interaction is now shown from the other customer type’s perspective.',
  completed: (label) => `${label} complete. Shared signals updated.`,
  reset: (label) => `${label} reset.`,
  chatAnswered: 'The AI has answered. The customer decision flow below has been updated.',
  quoteSelected: 'Line selected.',
  feedbackSelected: (value) => endSentence(`Feedback selected: ${value}`),
  shareRecorded: (label) => `${label} share action recorded. Shared signals updated.`,
  listenPlaying: 'Listen is playing. Start signal captured.',
  listenPaused: 'Listen paused.',
}
