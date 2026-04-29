// ─── Types ───────────────────────────────────────────────────────────────────

export type AgentPersona = 'publisher' | 'brand' | 'developer' | null

export type StyleCard = {
  label: string
  value: string
  imageUrl: string
}

export type AgentStep = {
  id: string
  agentMessage: string
  inputType: 'pills' | 'text-input' | 'demo' | 'cta' | 'message' | 'product-card' | 'style-cards' | 'thinking' | 'reader-article'
  options?: { label: string; value: string }[]
  personalizedOptions?: Record<string, { label: string; value: string }[]>
  ctaLabel?: string
  ctaHref?: string
  isDemo?: boolean
  personalizedMessages?: Record<string, string>
  collectsStylistAnswer?: boolean
  styleCards?: StyleCard[]
  // Resolves agentMessage dynamically from a past stylist answer
  resolveFromStylistAnswer?: { index: number; messages: Record<string, string> }
  // Resolves agentMessage dynamically from the selected reader question id
  readerMessages?: Record<string, string>
  // Override the 500ms auto-advance delay for 'message' steps (ms)
  autoAdvanceDelay?: number
}

// ─── Stylist Types & Data ─────────────────────────────────────────────────────

export type StylistProduct = {
  brand: string
  name: string
  price: string
  tags: {
    style: string[]
    recipient: string[]
    budget: string[]
  }
  stylistNote: string
  imageUrl: string
  url: string
}

export const STYLIST_PRODUCTS: StylistProduct[] = [
  {
    brand: 'Coach',
    name: 'Pillow Tabby 18',
    price: '$459',
    tags: { style: ['elegant', 'classic'], recipient: ['mom', 'gift'], budget: ['mid', 'top'] },
    stylistNote: 'That cloud-like quilting isn\'t just soft — it signals taste without trying. The bag that quietly owns the room.',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=240&q=80',
    url: 'https://www.coach.com/handbags',
  },
  {
    brand: 'Kate Spade New York',
    name: 'Sam Icon Mini',
    price: '$299',
    tags: { style: ['trendy', 'classic'], recipient: ['self', 'gift'], budget: ['entry', 'mid'] },
    stylistNote: 'Playful but never frivolous. The spade emblem does the talking so she doesn\'t have to.',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=240&q=80',
    url: 'https://www.katespade.com/products/bags/handbags/',
  },
  {
    brand: 'Longchamp',
    name: 'Le Pliage Original L',
    price: '$169',
    tags: { style: ['classic', 'minimal'], recipient: ['mom', 'self'], budget: ['entry'] },
    stylistNote: 'Forty years of Parisian pragmatism. Folds flat, holds everything, and never feels out of place.',
    imageUrl: 'https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=240&q=80',
    url: 'https://www.longchamp.com/tw/en/le-pliage-original',
  },
  {
    brand: 'Michael Kors',
    name: 'Jet Set MD TZ Tote',
    price: '$399',
    tags: { style: ['classic', 'minimal'], recipient: ['mom', 'gift'], budget: ['mid'] },
    stylistNote: 'Structured and spacious. The bag that makes a busy schedule look effortless.',
    imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=240&q=80',
    url: 'https://www.michaelkors.com/handbags/',
  },
  {
    brand: 'Mulberry',
    name: 'Bayswater Mini',
    price: '$619',
    tags: { style: ['elegant', 'refined'], recipient: ['mom', 'gift'], budget: ['top'] },
    stylistNote: 'British heritage, compact form. For someone who appreciates craft over logo.',
    imageUrl: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=240&q=80',
    url: 'https://www.mulberry.com/gb/categories/bags',
  },
  {
    brand: 'Furla',
    name: 'Camelia Mini Tote',
    price: '$359',
    tags: { style: ['trendy', 'elegant'], recipient: ['self', 'mom'], budget: ['mid'] },
    stylistNote: 'Italian sensibility meets modern edge. The one that grows a collection from zero to curated.',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=240&q=80',
    url: 'https://www.furla.com/en/eu/c/handbags',
  },
]

export function getStylistRecommendation(answers: string[]): StylistProduct {
  const [recipientAns = '', styleAns = '', budgetAns = ''] = answers

  const recipientKey =
    recipientAns.includes('mom') ? 'mom' :
    recipientAns.includes('myself') ? 'self' : 'gift'

  const styleKey =
    styleAns.includes('Classic') ? 'classic' :
    styleAns.includes('Elegant') ? 'elegant' :
    styleAns.includes('Bold') ? 'trendy' : 'classic'

  const budgetKey =
    budgetAns.includes('Under') && budgetAns.includes('300') ? 'entry' :
    budgetAns.includes('450') ? 'mid' : 'top'

  const scored = STYLIST_PRODUCTS.map(p => ({
    product: p,
    score:
      (p.tags.recipient.includes(recipientKey) ? 2 : 0) +
      (p.tags.style.includes(styleKey) ? 2 : 0) +
      (p.tags.budget.includes(budgetKey) ? 3 : 0),
  }))

  scored.sort((a, b) => b.score - a.score)
  return scored[0].product
}

// ─── Hero Flow (5 steps) ────────────────────────────────────────────────────

export const HERO_FLOW: AgentStep[] = [
  {
    id: 'step1-persona',
    agentMessage: "Hi, I'm the Mlytics Cortex.\nWhat's the most pressing problem you want to solve?",
    inputType: 'pills',
    options: [
      { label: "Content isn't earning enough", value: 'publisher' },
      { label: 'Ads miss purchase-ready users', value: 'brand' },
      { label: 'Infrastructure lacks AI', value: 'developer' },
      { label: 'Try reader experience', value: '__reader__' },
    ],
  },
  {
    id: 'step2-intro',
    agentMessage: "Let me show you what the Mlytics Cortex does.",
    inputType: 'message',
  },
  {
    id: 'step3-scan',
    agentMessage: "Analyzing the article's content structure and reader intent signals...",
    inputType: 'demo',
    isDemo: true,
  },
  {
    id: 'step4-personalized',
    agentMessage: '',
    inputType: 'message',
    personalizedMessages: {
      publisher:
        'Each of these 5 follow-up articles is an entry point to capture reader intent. Human writing costs $250/piece. Mlytics Cortex costs $0.10.',
      brand:
        '2 of these 5 questions are strong intent signals — readers actively comparing products, ready to decide. We embed these intent questions across content owner pages. When a reader clicks, Mlytics Cortex captures the signal and places your brand exactly where purchase intent is highest.',
      developer:
        'This entire flow — article analysis, content generation, intent classification — runs on Decisive Engine with decision latency < 50ms. Can your current infrastructure do this?',
    },
  },
  {
    id: 'step4b-question',
    agentMessage: '',
    inputType: 'pills',
    personalizedMessages: {
      publisher: 'How many articles can your site produce per month?',
      brand:     'Which verticals do you primarily focus on?',
      developer: 'What\'s your approximate monthly CDN spend?',
    },
    personalizedOptions: {
      publisher: [
        { label: '100+',  value: 'continue' },
        { label: '300+',  value: 'continue' },
        { label: '700+',  value: 'continue' },
        { label: '1000+', value: 'continue' },
        { label: '5000+', value: 'continue' },
        { label: '10K+',  value: 'continue' },
      ],
      brand: [
        { label: 'BFSI',                  value: 'continue' },
        { label: 'FMCG',                  value: 'continue' },
        { label: 'Automotive',            value: 'continue' },
        { label: 'Tech & Telco',          value: 'continue' },
        { label: 'Travel & Hospitality',  value: 'continue' },
        { label: 'Real Estate',           value: 'continue' },
        { label: 'Health & Wellness',     value: 'continue' },
        { label: 'Luxury & Fashion',      value: 'continue' },
      ],
      developer: [
        { label: '< $500/mo',      value: 'continue' },
        { label: '$500–$2K/mo',    value: 'continue' },
        { label: '$2K–$10K/mo',    value: 'continue' },
        { label: '$10K+/mo',       value: 'continue' },
      ],
    },
  },
  {
    id: 'step5-cta',
    agentMessage: '',
    inputType: 'cta',
    personalizedMessages: {
      publisher: "Your content is already generating intent signals — across 15M+ MAU. Let's start capturing them.",
      brand: "Your audience is already in our network — 15M+ MAU, intent-classified. Let's put your brand in front of them.",
      developer: "Every delivery decision you make could feed an AI flywheel — at <50ms, across 15M+ MAU. Let's show you how.",
    },
    options: [
      { label: 'See content owner plan', value: '/content-owners' },
      { label: 'See brand plan', value: '/brands' },
      { label: 'See developer plan', value: '/developers' },
    ],
  },
]

// ─── Audience page continuation flows ────────────────────────────────────────

export const PUBLISHER_FLOW: AgentStep[] = [
  {
    id: 'pub-content-type',
    agentMessage: 'You just saw the result for finance content. What type of content does your site primarily publish?',
    inputType: 'pills',
    options: [
      { label: 'Finance & Investment', value: 'finance' },
      { label: 'Health & Medical', value: 'health' },
      { label: 'News & Information', value: 'news' },
      { label: 'Lifestyle', value: 'lifestyle' },
    ],
  },
  {
    id: 'pub-estimate',
    agentMessage: '',
    inputType: 'pills',
    personalizedMessages: {
      finance:
        'Finance content has the highest intent density in our network. Strong-intent signals are significantly higher than other content categories. Use the calculator below to estimate your monthly revenue potential.',
      health:
        'Health content readers typically have strong informational needs. Per 1,000 readers, an average of 64 strong intent signals — CPL around $280. Try the calculator below.',
      news:
        'News content has high traffic with broad intent distribution. ~38 strong intent signals per 1,000 readers, but scale is your advantage. Try the calculator below.',
      lifestyle:
        'Lifestyle readers have lower intent density but strong alignment with consumer and health brands. ~45 strong intents per 1,000 readers, CPL around $180.',
    },
    options: [
      { label: 'Calculate my revenue potential', value: 'calculate' },
    ],
  },
]

export const BRAND_FLOW: AgentStep[] = [
  {
    id: 'brand-category',
    agentMessage: 'Among the 5 questions you just saw, some were weak intent (browsing), others strong intent (decision-ready). What category is your product?',
    inputType: 'pills',
    options: [
      { label: 'Finance & Insurance', value: 'finance' },
      { label: 'Health & Medical', value: 'health' },
      { label: 'Consumer Products', value: 'consumer' },
      { label: 'Software & Tech', value: 'tech' },
    ],
  },
  {
    id: 'brand-estimate',
    agentMessage: '',
    inputType: 'pills',
    personalizedMessages: {
      finance:
        'In our 4M WAU network, finance & insurance strong-intent users number ~87,000/week — from content owners like MoneyDJ and major financial portals. Talk to us to get a custom CPL quote for your category.',
      health:
        'Health & medical strong-intent users: ~64,000/week, primarily from health media platforms. CPL ~$280, confidence 82%.',
      consumer:
        'Consumer product strong-intent users: ~120,000/week across multiple platforms. CPL ~$180, ideal for scale.',
      tech:
        'Software & tech strong-intent users: ~45,000/week from technology publications. CPL ~$320, confidence 79%.',
    },
    options: [
      { label: 'Simulate my audience snapshot', value: 'simulate' },
    ],
  },
]

export const DEVELOPER_FLOW: AgentStep[] = [
  {
    id: 'dev-cdn-cost',
    agentMessage: 'The article processing flow you just saw runs on Decisive Engine under the hood. What\'s your approximate monthly CDN spend?',
    inputType: 'pills',
    options: [
      { label: '< $500/month', value: 'small' },
      { label: '$500–$2,000/month', value: 'medium' },
      { label: '$2,000–$10,000/month', value: 'large' },
      { label: '$10,000+/month', value: 'enterprise' },
    ],
  },
  {
    id: 'dev-estimate',
    agentMessage: '',
    inputType: 'pills',
    personalizedMessages: {
      small:
        'Even at smaller scale, connecting to Decisive Engine saves an estimated $50–$100/month while pushing decision latency below 50ms. Use the TCO calculator below for a precise estimate.',
      medium:
        'At the 20% savings baseline, you\'re looking at $100–$400/month in savings. More importantly, you get a unified API — no more managing multiple CDN contracts.',
      large:
        'At this scale, 20% savings means $4,800–$24,000 per year. Decisive Engine\'s SLA guarantees decision latency < 50ms P99.',
      enterprise:
        'Enterprise scale requires a tailored assessment. We recommend a direct technical POC to evaluate compatibility and optimize your specific architecture.',
    },
    options: [
      { label: 'Calculate my TCO savings', value: 'calculate' },
    ],
  },
]

// ─── Demo Article Data ────────────────────────────────────────────────────────

export type DemoArticle = {
  id: string
  title: string
  excerpt: string
  category: string
  url?: string
}

export type DemoQuestion = {
  id: string
  text: string
  intentStrength: 'weak' | 'strong'
}

export type DemoExtArticle = {
  id: string
  title: string
  summary: string
  cost: string
  intentType: string
  intentStrength?: 'weak' | 'medium' | 'strong'
  url?: string
}

export const DEMO_ARTICLES: DemoArticle[] = [
  {
    id: 'media-ai',
    title: 'How Can AI Optimize Digital Assets For Media In Southeast Asia?',
    excerpt: 'In the fast-evolving media landscape of Southeast Asia, AI is revolutionizing how digital assets are managed and optimized — from content creation to distribution and monetization.',
    category: 'Media & Technology',
    url: 'https://www.mlytics.com/blog/how-can-ai-optimize-digital-assets-for-media-in-southeast-asia/',
  },
  {
    id: 'aws-datacenter',
    title: '資料中心首成戰場目標？AWS中東設施停擺',
    excerpt: '亞馬遜 AWS 在阿拉伯聯合大公國的資料中心遭「不明物體」擊中，引發火警並迫使部分設施斷電，導致中東地區出現電力與連線異常。這起事件發生之際，伊朗向波斯灣國家發射無人機與飛彈……',
    category: '科技 / 雲端安全',
  },
  {
    id: 'finance',
    title: 'Complete 2024 Retirement Planning Guide: From Pension to Self-Directed Investing',
    excerpt: 'As population aging accelerates, retirement preparation has never been more critical. This guide covers pension systems, voluntary contributions, ETF investing, and more...',
    category: 'Finance & Investment',
  },
  {
    id: 'health',
    title: 'Hypertension Diet Guide: What to Eat — and What to Avoid Completely',
    excerpt: 'Hypertension has become one of the most prevalent chronic conditions. Research shows dietary changes can significantly lower blood pressure and reduce medication dependence...',
    category: 'Health & Medical',
  },
  {
    id: 'insurance',
    title: 'Before You Buy Insurance: Key Differences Between Medical, Life, and Accident Coverage',
    excerpt: 'Faced with a crowded insurance marketplace, most people don\'t know where to start. This article clarifies the core differences between the three major insurance types...',
    category: 'Finance & Insurance',
  },
]

export const DEMO_QUESTIONS: Record<string, DemoQuestion[]> = {
  'aws-datacenter': [
    { id: 'q1', text: 'AWS 停擺事件後，我的企業數據放在中東雲端服務器安全嗎？', intentStrength: 'strong' },
    { id: 'q2', text: '雲端服務供應商的地緣政治風險應如何評估？', intentStrength: 'weak' },
    { id: 'q3', text: '資料中心在衝突地區面臨哪些實體安全威脅？', intentStrength: 'weak' },
    { id: 'q4', text: '如何制定多雲災難備援計畫以應對突發中斷？', intentStrength: 'strong' },
    { id: 'q5', text: '台灣企業使用海外雲端服務應注意哪些風險？', intentStrength: 'strong' },
  ],
  finance: [
    { id: 'q1', text: 'What\'s the difference between a pension and a self-directed retirement account?', intentStrength: 'weak' },
    { id: 'q2', text: 'I\'m 35 — how much do I need to save to retire comfortably?', intentStrength: 'strong' },
    { id: 'q3', text: 'ETFs vs fixed deposits: which is better for retirement savings?', intentStrength: 'strong' },
    { id: 'q4', text: 'What\'s the historical return rate of government pension funds?', intentStrength: 'weak' },
    { id: 'q5', text: 'How do I maximize tax benefits through voluntary retirement contributions?', intentStrength: 'strong' },
  ],
  health: [
    { id: 'q1', text: 'Can hypertension be managed entirely through diet — without medication?', intentStrength: 'weak' },
    { id: 'q2', text: 'How much sodium can someone with hypertension consume per day?', intentStrength: 'weak' },
    { id: 'q3', text: 'Which foods can lower blood pressure quickly?', intentStrength: 'strong' },
    { id: 'q4', text: 'What is the relationship between hypertension and heart disease?', intentStrength: 'weak' },
    { id: 'q5', text: 'What are the side effects of blood pressure medication? Can I switch?', intentStrength: 'strong' },
  ],
  insurance: [
    { id: 'q1', text: 'Medical insurance vs life insurance: which is more important?', intentStrength: 'weak' },
    { id: 'q2', text: 'I\'m 30 with a $60K salary — which insurance should I buy first?', intentStrength: 'strong' },
    { id: 'q3', text: 'How do I choose a reimbursement medical plan? What are the key clauses?', intentStrength: 'strong' },
    { id: 'q4', text: 'How do I calculate the right life insurance coverage amount?', intentStrength: 'strong' },
    { id: 'q5', text: 'What happens to my policy if the insurance company goes bankrupt?', intentStrength: 'weak' },
  ],
}

export const DEMO_EXT_ARTICLES: Record<string, DemoExtArticle[]> = {
  'media-ai': [
    { id: 'a1', title: 'How does AI automate content creation for Southeast Asian media?', summary: 'Exploring machine learning tools that generate articles, summaries, and social posts at scale', cost: '$0.10', intentType: 'Informational', intentStrength: 'weak',   url: 'https://ai.mlyticsaigc.com/answer/how-does-ai-29574668?utm_content=question-29574668&_gl=1*1yiiqlo*_ga*MzM2MjY5NzA0LjE3NzM2NDQ0MjY.*_ga_GVHKX7L2G4*czE3NzY0MTE3NDIkbzIwJGcxJHQxNzc2NDExNzUzJGo0OSRsMCRoMA..' },
    { id: 'a2', title: 'What role does AI play in personalizing content for users in Malaysia and Singapore?', summary: 'How AI analyzes user data to curate recommendations and drive engagement on streaming platforms', cost: '$0.10', intentType: 'Informational', intentStrength: 'weak',   url: 'https://ai.mlyticsaigc.com/answer/what-role-does-29574669?utm_content=question-29574669&_gl=1*1yiiqlo*_ga*MzM2MjY5NzA0LjE3NzM2NDQ0MjY.*_ga_GVHKX7L2G4*czE3NzY0MTE3NDIkbzIwJGcxJHQxNzc2NDExNzUzJGo0OSRsMCRoMA..' },
    { id: 'a3', title: 'How does AI enrichment of metadata improve digital asset management?', summary: 'Automatic tagging, categorization, and version control to streamline vast media libraries', cost: '$0.10', intentType: 'Practical',    intentStrength: 'medium', url: 'https://ai.mlyticsaigc.com/answer/how-does-ai-29574670?utm_content=question-29574670&_gl=1*1yiiqlo*_ga*MzM2MjY5NzA0LjE3NzM2NDQ0MjY.*_ga_GVHKX7L2G4*czE3NzY0MTE3NDIkbzIwJGcxJHQxNzc2NDExNzUzJGo0OSRsMCRoMA..' },
    { id: 'a4', title: 'What are the primary data privacy concerns for AI in Southeast Asian media?', summary: 'Navigating PDPA and PDPC compliance while leveraging AI-driven personalization at scale', cost: '$0.10', intentType: 'Decision',      intentStrength: 'strong', url: 'https://ai.mlyticsaigc.com/answer/what-are-the-29574671?utm_content=question-29574671&_gl=1*1yiiqlo*_ga*MzM2MjY5NzA0LjE3NzM2NDQ0MjY.*_ga_GVHKX7L2G4*czE3NzY0MTE3NDIkbzIwJGcxJHQxNzc2NDExNzUzJGo0OSRsMCRoMA..' },
    { id: 'a5', title: 'How does AI-powered automated metadata generation streamline asset searchability?', summary: 'Reducing manual tagging effort while making media archives instantly searchable and retrievable', cost: '$0.10', intentType: 'Solution', intentStrength: 'strong', url: 'https://ai.mlyticsaigc.com/answer/how-does-aipowered-29574672?utm_content=question-29574672&_gl=1*1yiiqlo*_ga*MzM2MjY5NzA0LjE3NzM2NDQ0MjY.*_ga_GVHKX7L2G4*czE3NzY0MTE3NDIkbzIwJGcxJHQxNzc2NDExNzUzJGo0OSRsMCRoMA..' },
  ],
  'aws-datacenter': [
    { id: 'a1', title: 'AWS 阿聯設施遭攻擊，是否意味著資料中心開始成為軍事目標？', summary: '分析此次事件的軍事意涵，以及資料中心在現代衝突中扮演的新角色', cost: '$0.10', intentType: 'Analysis', url: 'https://news.cnyes.com/news/aigc/answer/aws-%E9%98%BF%E8%81%AF-22953420?utm_content=question-22953420' },
    { id: 'a2', title: '這次 AWS 中東設施停擺，將對該地區的 AI 運算和科技投資帶來什麼衝擊？', summary: '評估對微軟、Google、甲骨文等在阿聯 AI 基礎建設投資計畫的連鎖影響', cost: '$0.10', intentType: 'Impact', url: 'https://news.cnyes.com/news/aigc/answer/%E9%80%99%E6%AC%A1-aws-22953421?utm_content=question-22953421' },
    { id: 'a3', title: '在無人機技術普及下，全球資料中心面臨的實體安全風險有哪些？', summary: '從低成本彈頭無人機到光纖節點攻擊，CSIS 指出的新型基礎設施威脅', cost: '$0.10', intentType: 'Risk', url: 'https://news.cnyes.com/news/aigc/answer/%E5%9C%A8%E7%84%A1%E4%BA%BA%E6%A9%9F%E6%8A%80%E8%A1%93-22953422?utm_content=question-22953422' },
    { id: 'a4', title: '除了 AWS，微軟、Google 和甲骨文在阿聯的資料中心是否也面臨潛在威脅？', summary: '盤點各大美國科技巨頭在阿聯的設施佈局與目前已知的安全狀況', cost: '$0.10', intentType: 'Comparison', url: 'https://news.cnyes.com/news/aigc/answer/%E9%99%A4%E4%BA%86-aws-22953423?utm_content=question-22953423' },
    { id: 'a5', title: '單一資料中心遭攻擊停擺，Mlytics 的 Multi-CDN 架構如何確保企業服務不中斷？', summary: '了解 Multi-CDN 自動切換如何在節點失效時維持服務連續性與低延遲', cost: '$0.10', intentType: 'Solution', url: 'https://news.cnyes.com/news/aigc/answer/%E8%8B%A5%E8%B3%87%E6%96%99%E4%B8%AD%E5%BF%83%E6%88%90-22953424?utm_content=question-22953424' },
  ],
  finance: [
    { id: 'a1', title: 'Pension vs. Self-Directed Account: 2024 Complete Comparison', summary: 'One table to understand the differences, eligibility rules, and calculation methods', cost: '$0.10', intentType: 'Informational' },
    { id: 'a2', title: 'Starting at 35: Use Compound Interest to Calculate Your Retirement Target', summary: 'Interactive calculator: enter your income and target retirement age to get monthly savings needed', cost: '$0.10', intentType: 'Decision' },
    { id: 'a3', title: 'ETF vs. Fixed Deposit: What\'s the Optimal Retirement Allocation Ratio?', summary: 'Three allocation strategies by risk tolerance, with historical backtesting', cost: '$0.10', intentType: 'Comparison' },
    { id: 'a4', title: 'Pension Fund Performance Tracker: 5-Year Annualized Return Analysis', summary: 'Charts showing recent 5-year performance vs. market benchmarks', cost: '$0.10', intentType: 'Informational' },
    { id: 'a5', title: 'Voluntary Contribution Tax Strategy: Maximize Your Tax Benefits', summary: 'Calculate actual tax savings at different income brackets with 6% voluntary contributions', cost: '$0.10', intentType: 'Action' },
  ],
  health: [
    { id: 'a1', title: 'No Medication for Hypertension: Does Diet Control Really Work? Doctors Respond', summary: 'Three clinical studies on the actual blood pressure reduction from dietary adjustments', cost: '$0.10', intentType: 'Informational' },
    { id: 'a2', title: 'Daily Sodium Intake Guide for Hypertension: Numbers and Alternatives', summary: 'WHO recommendations, dietary realities, and a low-sodium substitute ingredient list', cost: '$0.10', intentType: 'Practical' },
    { id: 'a3', title: '10 Natural Blood Pressure-Lowering Foods: Science-Backed List', summary: 'Active compounds, recommended serving sizes, and actual BP reduction for each food', cost: '$0.10', intentType: 'Decision' },
    { id: 'a4', title: 'How Hypertension Damages the Heart: From Mechanism to Prevention', summary: 'Visual guide to the causal link between hypertension and heart disease, plus prevention', cost: '$0.10', intentType: 'Educational' },
    { id: 'a5', title: 'Complete Guide to Blood Pressure Medication: When to Switch', summary: 'Side effect comparison across 5 major drug classes and when to consult your doctor', cost: '$0.10', intentType: 'Action' },
  ],
  insurance: [
    { id: 'a1', title: 'Medical vs. Life Insurance: Which Do You Actually Need?', summary: 'Priority recommendations by age and family situation for different life stages', cost: '$0.10', intentType: 'Comparison' },
    { id: 'a2', title: 'Insurance Planning on a $60K Salary at 30: Complete Worked Example', summary: 'Build a comprehensive coverage portfolio step-by-step for middle-income earners', cost: '$0.10', intentType: 'Decision' },
    { id: 'a3', title: 'Reimbursement Medical Plan Buyer\'s Guide: 5 Key Clauses to Check', summary: 'Coverage limits, expense reimbursement ratios, duplicate claims — each clause explained', cost: '$0.10', intentType: 'Action' },
    { id: 'a4', title: 'Life Insurance Coverage Calculator: How Much Is Enough?', summary: 'Interactive tool: enter your family situation to get recommended coverage amount', cost: '$0.10', intentType: 'Action' },
    { id: 'a5', title: 'What Happens to Your Policy If the Insurer Goes Bankrupt?', summary: 'How the guarantee fund works, claim limits, and how to choose a stable insurer', cost: '$0.10', intentType: 'Informational' },
  ],
}

export const DEFAULT_DEMO_ARTICLE_ID = 'aws-datacenter'

// ─── Reader Experience Types & Data ──────────────────────────────────────────

export type ReaderQuestion = {
  id: string
  text: string
  intentType: 'Informational' | 'Decision' | 'Comparison' | 'Practical'
  answer: string
}

export type ReaderProduct = {
  brand: string
  name: string
  tagline: string
  features: string[]
  highlights: { value: string; label: string }[]
  ctaLabel: string
  ctaHref: string
  imageUrl: string
}

export const READER_QUESTIONS: ReaderQuestion[] = [
  {
    id: 'q1',
    text: 'Buying an EV today vs. two years ago — how much has the real cost changed?',
    intentType: 'Comparison',
    answer: "Two years ago, federal EV tax credits worth up to $7,000 were still in place. That changed when the Trump administration ended those rebates — seven years before they were intended to expire.\n\nNew York has partially stepped in with up to $2,000 off through the Drive Clean Rebate, applied instantly at the dealership. But the net incentive gap is still roughly $5,000 wider than two years ago.\n\nThe saving grace: EV sticker prices have dropped considerably as competition grew, and today's elevated gas prices make the long-term ownership math more favorable than the upfront numbers suggest.",
  },
  {
    id: 'q2',
    text: 'Gas went from $3 to $4 a gallon — how quickly does an EV pay for itself now?',
    intentType: 'Decision',
    answer: "According to NYSERDA, EV drivers pay the equivalent of about $1.33 per gallon in electricity costs, compared to over $4.00 at the pump — a gap driven by oil supply disruptions following the war with Iran.\n\nFor a typical driver covering 12,000 miles a year, that translates to over $1,000 in annual fuel savings at current prices. Analysts expect prices to stay elevated for months.\n\nAdd in lower maintenance costs, and the payback window is significantly shorter than it was a year ago.",
  },
  {
    id: 'q3',
    text: 'Model 3, Ioniq 6, or Equinox EV — what\'s the real monthly payment difference?',
    intentType: 'Comparison',
    answer: "All three qualify for the full $2,000 rebate, which goes to vehicles with over 200 miles of electric range. After applying it at the dealership, here's the rough breakdown at 6.5% APR over 60 months:\n\nModel 3 — ~$40,000 post-rebate, ~$780/month\nIoniq 6 — ~$36,000 post-rebate, ~$700/month\nEquinox EV — ~$33,000 post-rebate, ~$645/month\n\nA $135/month spread across the three. Worth confirming your specific trim qualifies — the program covers 60+ models.",
  },
  {
    id: 'q4',
    text: 'Is the $30M pot first-come, first-served? Will the rebate still be there if I wait?',
    intentType: 'Practical',
    answer: "Yes — once the $30 million runs out, buyers wait for the next funding cycle. But New York has consistently refilled the program since 2017, issuing more than 228,000 rebates to date.\n\nHochul's framing makes the state's position clear: \"as the federal administration continues to roll back support, New York State is leaning in.\" Politically, this program isn't going away.\n\nThat said, demand could spike faster than expected with gas above $4. If you're buying in the next few months, there's no good reason to wait.",
  },
  {
    id: 'q5',
    text: 'Beyond Drive Clean, what other deals can NY buyers stack — financing, insurance, tax breaks?',
    intentType: 'Informational',
    answer: "The rebate can be combined with other programs depending on eligibility. A few worth knowing:\n\nManufacturer financing — some dealers are offering rates as low as 4.9% APR to move EV inventory since the federal credit ended\nInsurance bundling — combining auto and home coverage can save several hundred dollars a year\nLow-income supplements — NY directs at least 35% of climate investments to disadvantaged communities\nHome charger credit — federal tax credits for EV charging equipment may still apply\n\nNew York also has over 19,000 public chargers — second only to California.",
  },
]

export const READER_PRODUCTS: Record<string, ReaderProduct> = {
  under500: {
    brand: 'Chevrolet',
    name: 'Equinox EV',
    tagline: 'The capable and affordable electric SUV',
    features: [
      'EPA-est. 319 miles electric range (FWD)',
      '17.7-inch diagonal touch-screen display',
      '57.2 cu. ft. max cargo space',
      '~80 miles of range in 10 min with DC Fast Charging',
    ],
    highlights: [
      { value: '319 mi', label: 'Electric Range' },
      { value: '80 mi', label: '10-min Fast Charge' },
    ],
    ctaLabel: 'Request a Quote',
    ctaHref: 'https://www.chevrolet.com/equinox-ev?x-modelyear=2026&x-carline=equinox%20ev&x-bodystyle=equinox&x-provider-id=560803',
    imageUrl: '/Equinox EV.png',
  },
  mid500700: {
    brand: 'Hyundai',
    name: 'Ioniq 6',
    tagline: 'The aerodynamic long-range electric sedan',
    features: [
      'EPA-est. 361 miles electric range (Long Range RWD)',
      'Best-in-class 135 MPGe combined efficiency',
      '10–80% charge in 18 minutes with DC Fast Charging',
      'Est. $46/month in fuel costs',
    ],
    highlights: [
      { value: '361 mi', label: 'Electric Range' },
      { value: '18 min', label: '10–80% Charge' },
    ],
    ctaLabel: 'Request a Quote',
    ctaHref: 'https://www.hyundaiusa.com/us/en/vehicles/ioniq-6',
    imageUrl: '/Ioniq 6.png',
  },
  mid700900: {
    brand: 'Tesla',
    name: 'Model 3',
    tagline: 'The iconic electric sedan with the longest range',
    features: [
      'EPA-est. 363 miles electric range (Premium RWD)',
      'Up to 195 miles of range in 15 min with DC Fast Charging',
      '0–60 mph in 4.9 seconds (Premium RWD)',
      'Starting at $38,630 including destination fees',
    ],
    highlights: [
      { value: '363 mi', label: 'Electric Range' },
      { value: '4.9s', label: '0–60 mph' },
    ],
    ctaLabel: 'Request a Quote',
    ctaHref: 'https://www.tesla.com/model3',
    imageUrl: '/Model 3.png',
  },
  over900: {
    brand: 'Porsche',
    name: 'Taycan',
    tagline: 'The performance electric sedan engineered by Porsche',
    features: [
      'EPA-est. 318 miles electric range',
      '10–80% charge in 18 min with 320 kW DC Fast Charging',
      'Up to 1,019 hp with Launch Control',
      '0–60 mph in 2.1 seconds (Turbo GT)',
    ],
    highlights: [
      { value: '2.1s', label: '0–60 mph' },
      { value: '1,019 hp', label: 'With Launch Control' },
    ],
    ctaLabel: 'Request a Quote',
    ctaHref: 'https://www.porsche.com/usa/models/taycan/taycan-models/taycan/',
    imageUrl: '/Porsche Taycan.png',
  },
}

export function getReaderProduct(budgetKey: string): ReaderProduct {
  return READER_PRODUCTS[budgetKey] ?? READER_PRODUCTS['mid500700']
}

export const READER_FLOW: AgentStep[] = [
  {
    id: 'reader-intro',
    agentMessage: "Your article is written. But most readers finish it and leave.\nWe turn every article into an interactive experience — automatically.",
    inputType: 'message',
    autoAdvanceDelay: 400,
  },
  {
    id: 'reader-article',
    agentMessage: "Here's an article →",
    inputType: 'message',
    autoAdvanceDelay: 1500,
  },
  {
    id: 'reader-article-followup',
    agentMessage: "See those 5 questions? Cortex generated them by reading your article — and injected them directly into the page.\n\nWhen a reader clicks a question, Cortex generates a dedicated answer page — built from your article, paired with relevant products.\n\nClick any question above to experience it.",
    inputType: 'reader-article',
  },
  {
    id: 'reader-thinking',
    agentMessage: '',
    inputType: 'thinking',
  },
  {
    id: 'reader-answer',
    agentMessage: '',
    inputType: 'message',
    autoAdvanceDelay: 1200,
  },
  {
    id: 'reader-product-bridge',
    agentMessage: "In the chat experience, Cortex goes further — proactively asking readers questions, capturing their intent, and guiding them toward the right product or next step.\n\nHere's an example. Select your answer:",
    inputType: 'message',
    autoAdvanceDelay: 400,
  },
  {
    id: 'reader-preference',
    agentMessage: "What's your monthly budget for a car payment?",
    inputType: 'pills',
    options: [
      { label: 'Under $500', value: 'under500' },
      { label: '$500 – $700', value: 'mid500700' },
      { label: '$700 – $900', value: 'mid700900' },
      { label: 'Over $900', value: 'over900' },
    ],
  },
  {
    id: 'reader-thinking-2',
    agentMessage: '',
    inputType: 'thinking',
  },
  {
    id: 'reader-product-card',
    agentMessage: "Based on your budget, here's a match.",
    inputType: 'product-card',
  },
  {
    id: 'reader-reveal',
    agentMessage: "Now you've seen it firsthand.\n\nEvery question is a new touchpoint. Every answer is a monetization opportunity — through sponsored content, product recommendations, and qualified leads delivered directly to your partners.\n\nYour content. Your audience. Your revenue.",
    inputType: 'message',
    autoAdvanceDelay: 400,
  },
  {
    id: 'reader-cta',
    agentMessage: "Want to add this AI-powered Q&A experience to your own publisher site?",
    inputType: 'cta',
    options: [
      { label: 'See how it works for publishers', value: '/content-owners' },
    ],
  },
]

// ─── Stylist Flow ─────────────────────────────────────────────────────────────

export const STYLIST_FLOW: AgentStep[] = [
  {
    id: 'stylist-intro',
    agentMessage: "Hi! I'm your Style Advisor\nI've read this article. Let me find the right bag for you in 30 seconds.",
    inputType: 'message',
  },
  {
    id: 'stylist-recipient',
    agentMessage: "Who are you buying this for?",
    inputType: 'pills',
    collectsStylistAnswer: true,
    options: [
      { label: 'For my mom', value: 'mom' },
      { label: 'For myself', value: 'self' },
      { label: 'As a gift', value: 'gift' },
    ],
  },
  { id: 'stylist-recipient-thinking', agentMessage: '', inputType: 'thinking' },
  {
    id: 'stylist-recipient-reaction',
    agentMessage: '',
    inputType: 'message',
    autoAdvanceDelay: 900,
    resolveFromStylistAnswer: {
      index: 0,
      messages: {
        'my mom': "A gift for mom — that's such a thoughtful choice.",
        'myself': "Treating yourself? Best decision of the week.",
        'gift': "A gift with intention — I love that.",
      },
    },
  },
  {
    id: 'stylist-style',
    agentMessage: "How would you describe her style?",
    inputType: 'style-cards',
    collectsStylistAnswer: true,
    styleCards: [
      {
        label: 'Understated & Classic',
        value: 'classic',
        imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&q=80',
      },
      {
        label: 'Elegant & Refined',
        value: 'elegant',
        imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80',
      },
      {
        label: 'Bold & Contemporary',
        value: 'trendy',
        imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=300&q=80',
      },
    ],
  },
  { id: 'stylist-style-thinking', agentMessage: '', inputType: 'thinking' },
  {
    id: 'stylist-style-reaction',
    agentMessage: '',
    inputType: 'message',
    autoAdvanceDelay: 900,
    resolveFromStylistAnswer: {
      index: 1,
      messages: {
        'Classic': "Classic taste — she knows exactly what she wants.",
        'Elegant': "Refined and polished. I have a few ideas forming.",
        'Bold': "Bold, contemporary — she makes an entrance.",
      },
    },
  },
  {
    id: 'stylist-budget',
    agentMessage: "And what's your budget?",
    inputType: 'pills',
    collectsStylistAnswer: true,
    options: [
      { label: 'Under $300', value: 'entry' },
      { label: '$300 – $450', value: 'mid' },
      { label: '$450 – $650', value: 'top' },
    ],
  },
  { id: 'stylist-budget-thinking', agentMessage: '', inputType: 'thinking' },
  {
    id: 'stylist-budget-reaction',
    agentMessage: '',
    inputType: 'message',
    autoAdvanceDelay: 900,
    resolveFromStylistAnswer: {
      index: 2,
      messages: {
        'Under $300': "Smart budget — there's something beautiful in every range.",
        '$300': "A great range — plenty of standout options here.",
        '$450': "Wonderful. Let me find something truly special.",
      },
    },
  },
  {
    id: 'stylist-recommendation',
    agentMessage: "Perfect — here's my pick for you.",
    inputType: 'product-card',
  },
  {
    id: 'stylist-reveal',
    agentMessage: "Those 3 questions you just answered? That's live purchase intent.\nMlytics captures these signals across 15M+ monthly readers — and routes them to brands the moment a decision is forming.",
    inputType: 'message',
  },
  {
    id: 'stylist-cta',
    agentMessage: "Want to see how brands reach readers like you — precisely when they're ready to buy?",
    inputType: 'cta',
    options: [{ label: 'See brand plan', value: '/brands' }],
  },
]
