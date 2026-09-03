import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { SectionViewTracker } from '@/components/analytics/SectionViewTracker'
import { ScrollDepthTracker } from '@/components/analytics/ScrollDepthTracker'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mlytics.com'),
  title: {
    template: '%s | Mlytics Cortex',
    default: 'Mlytics | Discovery and Answer Engine for Business',
  },
  description: 'Mlytics Cortex captures and verifies purchase-intent signals the moment users express them, charges brands only after intent is confirmed, and helps content and media businesses turn reader engagement into sustainably monetizable assets.',
  openGraph: {
    siteName: 'Mlytics',
    images: [{ url: 'https://storage.googleapis.com/mlytics-website/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://storage.googleapis.com/mlytics-website/og-image.png'],
  },
  verification: {
    google: 'ebn7CeZ3r4W2wJEEjikkQPjSDGkruyy3SVP2NSwcuC4',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Mlytics',
  alternateName: '摩速科技',
  description: 'Mlytics Cortex captures and verifies purchase-intent signals the moment users express them, charges brands only after intent is confirmed, and helps content and media businesses turn reader engagement into sustainably monetizable assets. Mlytics helps publishers monetize zero-click AI traffic and helps B2B brands generate qualified leads through AI-cited content.',
  url: 'https://www.mlytics.com',
  logo: 'https://storage.googleapis.com/mlytics-website/og-image.png',
  sameAs: ['https://www.linkedin.com/company/mlytics/'],
}

const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Mlytics Cortex',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'Mlytics Cortex puts brands inside the AI answers buyers trust, monetizes publisher AI traffic through a five-layer Intent Refinery, and powers AI agents with managed delivery infrastructure. The platform operates a two-sided market connecting brands that want AI citation placement with publishers that own high-intent audiences.',
  url: 'https://www.mlytics.com',
  provider: {
    '@type': 'Organization',
    name: 'Mlytics',
    url: 'https://www.mlytics.com',
  },
  featureList: [
    'Media AEO — Brand citation placement inside AI answers',
    'Publisher AI traffic monetization via five-layer Intent Refinery',
    'AI Q&A Widget for publisher content',
    'CPL-based lead generation for brands',
    'Managed publisher network with 15M+ monthly active users',
    'Content delivery infrastructure with AI intent scoring',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }} />
      {/* Preconnect hints */}
      <link rel="preconnect" href="https://js.hscollectedforms.net" />
      {/* HubSpot Tracking Code */}
      <script async defer src="//js.hs-scripts.com/4284310.js" />
      <body className="min-h-full flex flex-col">
        <ScrollToTop />
        <Nav />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <SectionViewTracker />
        <ScrollDepthTracker />
      </body>
    </html>
  )
}
