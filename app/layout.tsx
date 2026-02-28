import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'
import { ErrorBoundary } from "@/lib/error-boundary"
import { AccessibilityProvider } from "@/components/accessibility-provider"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"

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
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'SurvTrack - Survey Income Tracking App',
  description: 'Track your survey income, points, and withdrawals with SurvTrack',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SurvTrack',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'SurvTrack',
    title: 'SurvTrack - Survey Income Tracking App',
    description: 'Track your survey income, points, and withdrawals with SurvTrack',
  },
  twitter: {
    card: 'summary',
    title: 'SurvTrack - Survey Income Tracking App',
    description: 'Track your survey income, points, and withdrawals with SurvTrack',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        <meta name="application-name" content="SurvTrack" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SurvTrack" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icon-192x192.png" />
        
        <link rel="icon" type="image/png" sizes="32x32" href="/icon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className="font-sans antialiased">
        <AccessibilityProvider>
          <ErrorBoundary>
            {children}
            <PWAInstallPrompt />
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
