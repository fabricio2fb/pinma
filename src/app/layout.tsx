import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.alertloc.online'),
  title: 'AlertLoc',
  description: 'Crie lembretes no mapa e receba alertas quando chegar perto dos lugares importantes da sua rotina.',
  openGraph: {
    title: 'AlertLoc',
    description: 'Crie lembretes no mapa e receba alertas quando chegar perto dos lugares importantes da sua rotina.',
    url: 'https://www.alertloc.online/',
    siteName: 'AlertLoc',
    locale: 'pt_BR',
    type: 'website',
    images: ['/logob.png'],
  },
  twitter: {
    card: 'summary',
    title: 'AlertLoc',
    description: 'Crie lembretes no mapa e receba alertas quando chegar perto dos lugares importantes da sua rotina.',
    images: ['/logob.png'],
  },
  icons: {
    icon: '/favicon/favicon-32x32.png',
    apple: '/favicon/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={cn(inter.variable, 'font-sans antialiased bg-background')}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-F9VEZ0JDPO"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-F9VEZ0JDPO');
          `}
        </Script>
        <div className="flex justify-center">
          <div className="w-full max-w-md lg:max-w-none bg-card lg:bg-background min-h-dvh md:border-x lg:border-none">
            {children}
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
