// ─── Types ───────────────────────────────────────────────────────────────────

export type AgentPersona = 'publisher' | 'brand' | 'developer' | null

export type AgentStep = {
  id: string
  agentMessage: string
  inputType: 'pills' | 'text-input' | 'demo' | 'cta'
  options?: { label: string; value: string }[]
  ctaLabel?: string
  ctaHref?: string
  isDemo?: boolean
  personalizedMessages?: Record<string, string>
}

// ─── Hero Flow (5 steps) ────────────────────────────────────────────────────

export const HERO_FLOW: AgentStep[] = [
  {
    id: 'step1-persona',
    agentMessage: "Hi, I'm the Mlytics Decision Engine.\nWhat's the most pressing problem you want to solve?",
    inputType: 'pills',
    options: [
      { label: 'Help my content earn more revenue', value: 'publisher' },
      { label: 'Find users who actually want to buy', value: 'brand' },
      { label: 'Reduce infrastructure costs', value: 'developer' },
    ],
  },
  {
    id: 'step2-demo-choice',
    agentMessage: "Let me show you what the Decision Engine does.\nPaste an article URL, or I'll use a sample article to demo.",
    inputType: 'pills',
    options: [
      { label: 'Show me with a sample article', value: 'demo' },
      { label: 'Paste my article URL', value: 'custom' },
    ],
  },
  {
    id: 'step3-scan',
    agentMessage: 'Analyzing the article\'s content structure and reader intent signals...',
    inputType: 'demo',
    isDemo: true,
  },
  {
    id: 'step4-personalized',
    agentMessage: '',
    inputType: 'pills',
    personalizedMessages: {
      publisher:
        'Each of these 5 follow-up articles is an entry point to capture reader intent. Human writing costs $250/piece. Decision Engine costs $0.10. How many articles can your site produce per month?',
      brand:
        '2 of these 5 questions are strong intent signals — readers actively comparing products, ready to decide. That\'s where your ads should appear, not on pages with no purchase intent.',
      developer:
        'This entire flow — article analysis, content generation, intent classification — runs on Decisive Engine with decision latency < 50ms. Can your current infrastructure do this?',
    },
    options: [
      { label: 'Continue', value: 'continue' },
    ],
  },
  {
    id: 'step5-cta',
    agentMessage: '',
    inputType: 'cta',
    personalizedMessages: {
      publisher: "Let's look at the content owner plan — see how every piece of content becomes a revenue source.",
      brand: "Let's look at the brand plan — calculate how many of your target audience are in our 4M WAU network.",
      developer: "Let's look at the developer plan — calculate your infrastructure savings in 30 seconds.",
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
  url?: string
}

export const DEMO_ARTICLES: DemoArticle[] = [
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
