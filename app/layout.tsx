import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientGuard from '@/components/ClientGuard'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinMate - Budget Assistant',
  description: 'Your personal budgeting assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientGuard>
          {children}
        </ClientGuard>
      </body>
    </html>
  )
}
