import './globals.css'
import Header from '../components/layout/Header'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Boundless Prover Dashboard',
  description: 'Modern dashboard for Boundless Prover management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-boundless-bg min-h-screen relative overflow-x-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-boundless-bg via-boundless-card/20 to-boundless-bg -z-10" />
        <Header />
        <main className="pt-10 px-4 max-w-7xl mx-auto relative z-10">
          {children}
        </main>
      </body>
    </html>
  )
}
