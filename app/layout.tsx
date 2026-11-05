import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SITE_CONFIG, getSiteUrl } from '@/lib/seo/config';
import { JsonLd } from '@/components/seo/JsonLd';

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: SITE_CONFIG.themeColorLight },
    { media: '(prefers-color-scheme: dark)', color: SITE_CONFIG.themeColorDark },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_CONFIG.title,
    template: SITE_CONFIG.titleTemplate,
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: SITE_CONFIG.author, url: siteUrl }],
  creator: SITE_CONFIG.creator,
  publisher: SITE_CONFIG.publisher,
  category: 'finance',
  classification: 'Personal Finance & Budgeting Application',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    url: siteUrl,
    siteName: SITE_CONFIG.name,
    locale: SITE_CONFIG.locale,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    creator: '@ExpenseTracker',
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd />
      </head>
      <body suppressHydrationWarning className="antialiased min-h-screen bg-[#FBFBFD] dark:bg-[#000000]">
        {children}
      </body>
    </html>
  );
}
