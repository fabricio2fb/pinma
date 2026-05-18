import type { Metadata } from 'next';

import LandingPage from './lp/page';

export const metadata: Metadata = {
  title: 'AlertLoc  Lembretes por localização',
  description: 'Crie lembretes no mapa e receba alertas quando chegar perto dos lugares importantes da sua rotina.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AlertLoc  Lembretes por localização',
    description: 'Crie lembretes no mapa e receba alertas quando chegar perto dos lugares importantes da sua rotina.',
    url: 'https://www.alertloc.online/',
    siteName: 'AlertLoc',
    locale: 'pt_BR',
    type: 'website',
    images: ['/logob.png'],
  },
  twitter: {
    card: 'summary',
    title: 'AlertLoc  Lembretes por localização',
    description: 'Crie lembretes no mapa e receba alertas quando chegar perto dos lugares importantes da sua rotina.',
    images: ['/logob.png'],
  },
};

export default function Page() {
  return <LandingPage />;
}
