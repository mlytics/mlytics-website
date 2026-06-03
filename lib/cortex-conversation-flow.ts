import type { AgentStep } from './agent-data'

// ─── S0 Opening ──────────────────────────────────────────────────────────────

export const CORTEX_FLOW_S0: AgentStep[] = [
  {
    id: 's0-intro',
    agentMessage: '15M+ readers ask AI for product recommendations every month. We put your brand in those answers.',
    inputType: 'message',
    autoAdvanceDelay: 1200,
  },
  {
    id: 's0-opening',
    agentMessage:
      "Your buyers are asking AI for answers before they buy.\n\nWhere does your brand show up in those answers?",
    inputType: 'pills',
    collectsOption: true,
    options: [
      {
        label: 'Analyze my brand — show my visibility inside AI answers',
        value: '__url__',
      },
      {
        label: 'Show me what buyers in my industry are asking AI',
        value: 'opt_1',
      },
    ],
  },
]

export type CortexPathKey = 'opt_1'

// ─── Path 1 — Brand ────────────────────────────────────────────────────────────

export const BRAND_CONVERSATION_FLOW: AgentStep[] = [
  {
    id: 's1a-industry',
    agentMessage:
      "Which industry is your brand in?\n\nI'll show you what your target customers are asking right now.",
    inputType: 'pills',
    collectsOption: true,
    options: [
      { label: 'Finance / Insurance', value: 'ind_finance' },
      { label: 'Health / Medical', value: 'ind_health' },
      { label: 'Consumer / E-commerce', value: 'ind_ecom' },
      { label: 'Tech / Software', value: 'ind_tech' },
      { label: 'Automotive', value: 'ind_auto' },
      { label: 'Beauty / Lifestyle', value: 'ind_beauty' },
      { label: 'Food & Beverage', value: 'ind_food' },
      { label: 'Real Estate', value: 'ind_realestate' },
    ],
  },
  {
    id: 's1b-data',
    agentMessage: '',
    inputType: 'message',
    optionMessages: {
      ind_finance:
        'In the past 30 days,\n\n3,200 questions related to finance\nwere asked by real readers in the Mlytics content network.\n\nThe question "Which bank has the best fixed deposit rate?" appears 47 times per day —\nand most financial brands have no idea.\n\nIs your brand appearing in any of these answers?',
      ind_health:
        'In the past 30 days,\n\n2,840 questions related to health\nwere asked by real readers in the Mlytics content network.\n\nThe question "Which brand has the best quality fish oil?" appears 38 times per day —\nand most health brands aren\'t appearing in these answers.\n\nIs your brand appearing in any of these answers?',
      ind_ecom:
        'In the past 30 days,\n\n4,100 questions related to consumer products\nwere asked by real readers in the Mlytics content network.\n\nThe question "Which air purifier brand gives the best value?" appears 62 times per day —\nand most e-commerce brands are completely absent from AI Q&A.\n\nIs your brand appearing in any of these answers?',
      ind_tech:
        'In the past 30 days,\n\n1,980 questions related to tech & software\nwere asked by real readers in the Mlytics content network.\n\nThe question "What\'s the best project management tool for small teams?" appears 29 times per day —\nand most SaaS brands don\'t even know this channel exists.\n\nIs your brand appearing in any of these answers?',
      ind_auto:
        'In the past 30 days,\n\n2,200 questions related to automotive\nwere asked by real readers in the Mlytics content network.\n\nThe question "Which EV has the best range under NT$1.5M?" appears 36 times per day —\nand most car brands have no presence in these AI answers.\n\nIs your brand appearing in any of these answers?',
      ind_beauty:
        'In the past 30 days,\n\n3,400 questions related to beauty & lifestyle\nwere asked by real readers in the Mlytics content network.\n\nThe question "Which sunscreen brand is best for sensitive skin?" appears 54 times per day —\nand most beauty brands are invisible in AI Q&A.\n\nIs your brand appearing in any of these answers?',
      ind_food:
        'In the past 30 days,\n\n2,700 questions related to food & beverage\nwere asked by real readers in the Mlytics content network.\n\nThe question "Which protein powder brand actually tastes good?" appears 43 times per day —\nand most F&B brands haven\'t claimed this channel yet.\n\nIs your brand appearing in any of these answers?',
      ind_realestate:
        'In the past 30 days,\n\n2,510 questions related to real estate\nwere asked by real readers in the Mlytics content network.\n\nThe question "Is it better to buy or rent in Taipei right now?" appears 41 times per day —\nand most real estate brands are missing these high-intent leads.\n\nIs your brand appearing in any of these answers?',
      ind_other:
        'In the past 30 days,\n\n1,600 questions related to your industry\nwere asked by real readers in the Mlytics content network.\n\nThe question "Which brand is most trustworthy?" appears 25 times per day —\nand most brands haven\'t realized this opportunity.\n\nIs your brand appearing in any of these answers?',
    },
  },
  {
    id: 's1b-cta',
    agentMessage: '',
    inputType: 'pills',
    options: [
      { label: "Enter your URL — see what you're missing", value: '__url__' },
      { label: 'Learn how Mlytics helps brands', value: '/brands' },
    ],
  },
]

// ─── Path 2 — Media / Content Owner ────────────────────────────────────────────

export const MEDIA_CONVERSATION_FLOW: AgentStep[] = [
  {
    id: 's2a-content',
    agentMessage:
      "What type of content do you primarily publish?\n\nI'll estimate your monthly monetization potential.",
    inputType: 'pills',
    collectsOption: true,
    options: [
      { label: '📈 Finance / Investment', value: 'con_finance' },
      { label: '🌿 Health / Lifestyle', value: 'con_health' },
      { label: '💡 Tech / Digital', value: 'con_tech' },
      { label: '🍜 Food / Travel', value: 'con_food' },
      { label: '👨‍👩‍👧 Parenting / Education', value: 'con_parenting' },
      { label: '✦ Other', value: 'con_other' },
    ],
  },
  {
    id: 's2b-data',
    agentMessage: '',
    inputType: 'message',
    optionMessages: {
      con_finance:
        'In the past 30 days, for finance / investment content in the Mlytics network:\n\n📄 12,400 related Q&A pages indexed by AI\n🏷️ 38 brands actively looking for placement in this content type\n🔓 760 placement opportunities still unclaimed\n\nIs your content part of this opportunity?',
      con_health:
        'In the past 30 days, for health / lifestyle content in the Mlytics network:\n\n📄 9,800 related Q&A pages indexed by AI\n🏷️ 29 brands actively looking for placement in this content type\n🔓 580 placement opportunities still unclaimed\n\nIs your content part of this opportunity?',
      con_tech:
        'In the past 30 days, for tech / digital content in the Mlytics network:\n\n📄 8,200 related Q&A pages indexed by AI\n🏷️ 24 brands actively looking for placement in this content type\n🔓 490 placement opportunities still unclaimed\n\nIs your content part of this opportunity?',
      con_food:
        'In the past 30 days, for food / travel content in the Mlytics network:\n\n📄 11,600 related Q&A pages indexed by AI\n🏷️ 33 brands actively looking for placement in this content type\n🔓 620 placement opportunities still unclaimed\n\nIs your content part of this opportunity?',
      con_parenting:
        'In the past 30 days, for parenting / education content in the Mlytics network:\n\n📄 7,400 related Q&A pages indexed by AI\n🏷️ 21 brands actively looking for placement in this content type\n🔓 410 placement opportunities still unclaimed\n\nIs your content part of this opportunity?',
      con_other:
        'In the past 30 days, for your content type in the Mlytics network:\n\n📄 6,800 related Q&A pages indexed by AI\n🏷️ 18 brands actively looking for placement in this content type\n🔓 360 placement opportunities still unclaimed\n\nIs your content part of this opportunity?',
    },
  },
  {
    id: 's2c-volume',
    agentMessage: 'How many articles do you publish per month?',
    inputType: 'pills',
    collectsOption: true,
    options: [
      { label: '📝 Under 50', value: 'vol_low' },
      { label: '📄 50–200', value: 'vol_mid' },
      { label: '📚 200+', value: 'vol_high' },
    ],
  },
  {
    id: 's2c-result',
    agentMessage: '',
    inputType: 'message',
    optionMessages: {
      vol_low:
        "Here's the thing —\n\nWith under 50 articles per month, your content could generate ~120 brand placement opportunities per month in our network — extra revenue without writing a single extra article.\n\nYour content is already generating value.\nYou just need a mechanism to turn that value into revenue.",
      vol_mid:
        "Here's the thing —\n\nWith 50–200 articles per month, you could generate ~480 brand placement opportunities per month — several times your current monetization rate.\n\nYour content is already generating value.\nYou just need a mechanism to turn that value into revenue.",
      vol_high:
        "Here's the thing —\n\nWith 200+ articles per month, you could generate 1,200+ brand placement opportunities per month. Your content output is already your biggest competitive advantage.\n\nYour content is already generating value.\nYou just need a mechanism to turn that value into revenue.",
    },
  },
  {
    id: 's2c-cta',
    agentMessage: '',
    inputType: 'cta',
    ctaLabel: 'Learn about Media AEO partnership →',
    options: [{ label: 'Learn about Media AEO partnership →', value: '/content-owners' }],
  },
]

// ─── Path 3 — Developer ────────────────────────────────────────────────────────

export const DEVELOPER_CONVERSATION_FLOW: AgentStep[] = [
  {
    id: 's3a-developer',
    agentMessage:
      "Let's skip the pitch.\n\nMlytics has a Cortex API — query real Q&A data from our content network for any keyword: question types, frequency, and brand appearance counts.\n\nIf you're building an AI app, recommendation system, or anything that needs real user intent data, this API connects directly.\n\nHow do you want to start?",
    inputType: 'pills',
    options: [
      { label: 'Learn how the Cortex API works', value: '/developers' },
      { label: 'Go to Developer page', value: '/developers' },
    ],
  },
]

// ─── Path 4 — Learn AEO ────────────────────────────────────────────────────────

export const AEO_EDU_CONVERSATION_FLOW: AgentStep[] = [
  {
    id: 's4a-aeo',
    agentMessage:
      'AEO stands for Answer Engine Optimization.\n\nSEO gets your page into Google search results.\nAEO gets your brand into AI answers.\n\nSomeone asks ChatGPT "Which bank in Taiwan has the best fixed deposit rate?" — some brands appear in that answer. Others don\'t.\nAEO determines whether you\'re in it.\n\nHow does Cortex Agent make this happen? Three steps:\n\n① Analyze intent — Cortex scans your brand category and finds the real questions your target customers are asking in AI-powered Q&A environments.\n\n② Place your brand — Across Mlytics\' 15M+ MAU content network, your brand is embedded into the most relevant Q&A contexts — not as an ad, but as part of the answer.\n\n③ Track outcomes — See exactly which questions your brand appears in, how often, and how much high-intent traffic it generates — all in your Dashboard.',
    inputType: 'message',
  },
  {
    id: 's4a-cta',
    agentMessage: '',
    inputType: 'cta',
    ctaLabel: 'See how brands use Mlytics →',
    options: [{ label: 'See how brands use Mlytics →', value: '/brands' }],
  },
]

// ─── Routing ─────────────────────────────────────────────────────────────────

export const CORTEX_PATH_FLOWS: Record<CortexPathKey, AgentStep[]> = {
  opt_1: BRAND_CONVERSATION_FLOW,
}

export const CORTEX_PATH_FLOW_NAMES: Record<CortexPathKey, string> = {
  opt_1: 'CORTEX_BRAND',
}

export function isCortexConversationFlow(flow: AgentStep[]): boolean {
  return flow.some(s =>
    s.id === 's0-intro' ||
    s.id === 's0-opening' ||
    s.id === 's1a-industry' ||
    s.id === 's2a-content' ||
    s.id === 's3a-developer' ||
    s.id === 's4a-aeo'
  )
}
