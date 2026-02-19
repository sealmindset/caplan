import './globals.css'
import type { Metadata } from 'next'
import { AIWrapper } from '../components/ai/AIWrapper'
import { MockServerBanner } from '../components/MockServerBanner'

export const metadata: Metadata = {
  title: 'Cap Planner - Enterprise Capacity Planning',
  description: 'Manage team allocations, projects, and capacity planning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <MockServerBanner />
        <AIWrapper>
          {children}
        </AIWrapper>
      </body>
    </html>
  )
}
