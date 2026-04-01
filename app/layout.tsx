import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { AgentProvider } from '@/lib/agent-context'
import { ContactModalProvider } from '@/context/contact-modal-context'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { ContactModal } from '@/components/ui/ContactModal'
import { AgentWidget } from '@/components/agent/AgentWidget'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Mlytics Decision Engine — Per dollar, per intelligent outcome.',
  description: 'From 4.1M WAU to qualified leads. The intent refinery that turns raw attention into commercial transactions.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AgentProvider>
          <ContactModalProvider>
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
