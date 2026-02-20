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
  title: 'PinLembrete',
  description: 'Lembretes por localização, reinventado.',
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
            <div className="w-full max-w-md bg-card min-h-dvh md:border-x">
                {children}
            </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
