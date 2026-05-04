import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import { AgentProvider } from '@/lib/agent-context'
import { ContactModalProvider } from '@/context/contact-modal-context'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { ContactModal } from '@/components/ui/ContactModal'
import { AgentWidget } from '@/components/agent/AgentWidget'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mlytics.com'),
  title: 'Mlytics',
  description: 'Mlytics is AI-powered Answer Engine that empower Media and Content Business get discovered and chosen by right customers.',
  openGraph: {
    title: 'Mlytics',
    description: 'Mlytics is AI-powered Answer Engine that empower Media and Content Business get discovered and chosen by right customers.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mlytics',
    description: 'Mlytics is AI-powered Answer Engine that empower Media and Content Business get discovered and chosen by right customers.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <GoogleAnalytics gaId="G-BHS28B1S3P" />
      {/* HubSpot Tracking Code */}
      <script async defer src="//js.hs-scripts.com/4284310.js" />
      <body className="min-h-full flex flex-col">
        <AgentProvider>
          <ContactModalProvider>
            <ScrollToTop />
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
            <ContactModal />
            <AgentWidget />
          </ContactModalProvider>
        </AgentProvider>
      </body>
    </html>
  )
}
