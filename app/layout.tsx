import type {Metadata, Viewport} from 'next';
import './globals.css'; // Global styles

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBFBFD' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export const metadata: Metadata = {
  title: 'Expence Tracker — For Students',
  description: 'A minimal, Apple-inspired financial management SaaS frontend for students with precision INR currency handling, budgeting, savings goals, and zero fake data.',
  openGraph: {
    title: 'Expence Tracker — For Students',
    description: 'A minimal, Apple-inspired financial management SaaS frontend for students with precision INR currency handling, budgeting, savings goals, and zero fake data.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Expence Tracker — For Students',
    description: 'A minimal, Apple-inspired financial management SaaS frontend for students with precision INR currency handling, budgeting, savings goals, and zero fake data.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
