import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'AlertLoc',
  description: 'Lembretes por localização, reinventado.',
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
      <body className={cn(inter.variable, "font-sans antialiased bg-background")}>
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
