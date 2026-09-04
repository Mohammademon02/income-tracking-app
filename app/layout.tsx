import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Instrument_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'
import { ErrorBoundary } from "@/lib/error-boundary"
import { AccessibilityProvider } from "@/components/accessibility-provider"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { ThemeProvider } from "@/components/theme-provider"

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

/**
 * The display face, used only by headings and by the number scale in
 * globals.css. It is loaded at two weights rather than as a variable range
 * because nothing in the app sets a display weight between them, and the two
 * static cuts are a smaller download than the full axis.
 */
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-instrument-sans",
  display: "swap",
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    // The browser chrome and the PWA splash have to match --surface-0, or the
    // app opens with a seam across the top. These are the sRGB equivalents of
    // the two oklch values in globals.css; they need updating together.
    { media: '(prefers-color-scheme: light)', color: '#fafbfc' },
    { media: '(prefers-color-scheme: dark)', color: '#0e1116' },
  ],
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
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${instrumentSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="application-name" content="SurvTrack" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SurvTrack" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#0e1116" />
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
        {/* Dark is the default a first-time visitor lands on, not the only
            option: `enableSystem` keeps "System" selectable in the theme menu,
            and a stored choice still wins over this. */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
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
        </ThemeProvider>
      </body>
    </html>
  )
}
