import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'
import { ErrorBoundary } from "@/lib/error-boundary"
import { AccessibilityProvider } from "@/components/accessibility-provider"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3b82f6',
}

export const metadata: Metadata = {
  title: 'SurvTrack - Survey Income Tracking App',
  description: 'Track your survey income, points, and withdrawals with SurvTrack',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <AccessibilityProvider>
          <ErrorBoundary>
            {children}
            <Analytics />
            <Toaster
              position="top-right"
              richColors={false}
              closeButton
              duration={4000}
              expand={true}
              visibleToasts={5}
              gap={12}
            />
          </ErrorBoundary>
        </AccessibilityProvider>
      </body>
    </html>
  )
}
