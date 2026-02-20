import type { Metadata } from 'next';
import { Poppins, Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-poppins',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'PinLembrete - No lugar certo, na hora certa',
  description: 'Crie lembretes baseados em localização e nunca mais esqueça nada.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${poppins.variable} ${inter.variable} font-body antialiased`}>
        <div className="md:bg-zinc-950 md:flex md:items-center md:justify-center min-h-dvh">
          <div className="relative bg-background w-full h-dvh md:max-w-sm md:h-[844px] md:max-h-[95dvh] md:rounded-[40px] md:border-4 md:border-zinc-800 md:shadow-2xl overflow-hidden">
            <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-zinc-800 rounded-b-lg z-20"></div>
            {children}
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
