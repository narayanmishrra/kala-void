/* ============================================================
   DALA — app/layout.tsx
   Root layout: font injection, metadata, security.
   ============================================================ */

import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import '@/app/globals.css'
import { Suspense } from 'react'
import { NavBar } from '@/components/navigation/NavBar'
import { Footer } from '@/components/sections/Footer'

const ppNeueMontreal = localFont({
  src: [
    {
      path: '../public/fonts/PPNeueMontreal-Light.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../public/fonts/PPNeueMontreal-Book.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/PPNeueMontreal-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/PPNeueMontreal-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/PPNeueMontreal-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-ppneuemontreal',
  display: 'swap',
  preload: true,
  fallback: ['Inter', 'ui-sans-serif', 'system-ui'],
  adjustFontFallback: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dala.ai'
  ),
  title: {
    default: 'Dala — Your workplace has the answer',
    template: '%s | Dala',
  },
  description:
    'Stop managing knowledge. Start using it. Plug into your team\'s shared brainpower. Ask Dala to instantly find anything or anyone from any workplace system.',
  keywords: [
    'AI search',
    'knowledge management',
    'workplace intelligence',
    'team collaboration',
    'enterprise search',
    'Dala',
    'collective wisdom',
  ],
  authors: [{ name: 'Dala', url: 'https://dala.ai' }],
  creator: 'Dala',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'Dala',
    title: 'Dala — Your workplace has the answer',
    description:
      'Stop managing knowledge. Start using it. Plug into your team\'s shared brainpower.',
    images: [
      {
        url: '/og/default.png',
        width: 1200,
        height: 630,
        alt: 'Dala — Your workplace has the answer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@askdala',
    creator: '@askdala',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL,
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://dala.ai/#organization',
      name: 'Dala',
      url: 'https://dala.ai',
      description:
        'AI-powered workplace knowledge search. Stop managing knowledge. Start using it.',
      sameAs: [
        'https://twitter.com/askdala',
        'https://linkedin.com/company/dala-ai',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://dala.ai/#website',
      url: 'https://dala.ai',
      name: 'Dala',
      publisher: { '@id': 'https://dala.ai/#organization' },
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={ppNeueMontreal.variable}
      style={{ colorScheme: 'dark' }}
    >
      <head>
        <link
          rel="preload"
          href="/fonts/PPNeueMontreal-Book.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/PPNeueMontreal-Light.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: 'html,body{background:#000;color:#fff;margin:0;padding:0}*{box-sizing:border-box}',
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        style={{
          backgroundColor: '#000000',
          color: '#ffffff',
          fontFamily: 'var(--font-ppneuemontreal)',
          overflowX: 'hidden',
          minHeight: '100vh',
        }}
      >
        {/* Skip to main content */}
        <a
          href="#main-content"
          className="fixed top-4 left-4 z-[9999] px-4 py-2 rounded-full bg-[#8052ff] text-white text-sm font-semibold opacity-0 pointer-events-none focus:opacity-100 focus:pointer-events-auto transition-opacity duration-200 -translate-y-full focus:translate-y-0"
        >
          Skip to main content
        </a>

        <Suspense fallback={<nav style={{ height: 72, background: '#000' }} />}>
          <NavBar />
        </Suspense>

        <main id="main-content" tabIndex={-1}>
          {children}
        </main>

        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </body>
    </html>
  )
}
