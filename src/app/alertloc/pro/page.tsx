import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Crown, ShieldCheck, Sparkles } from 'lucide-react';

import { ALERTLOC_PRO_BENEFITS } from '@/lib/alertloc/pro';
import { CheckoutButton } from './checkout-button';
import styles from './pro.module.css';

export const metadata: Metadata = {
  title: 'AlertLoc Pro  Lembretes sem limites',
  description: 'Assine o AlertLoc Pro por R$ 22,90/mês e libere lembretes ilimitados, grupos maiores, alertas urgentes e monitoramento avançado.',
  alternates: {
    canonical: '/alertloc/pro',
  },
  openGraph: {
    title: 'AlertLoc Pro  Lembretes sem limites',
    description: 'Assine o AlertLoc Pro por R$ 22,90/mês e libere lembretes ilimitados, grupos maiores, alertas urgentes e monitoramento avançado.',
    url: 'https://www.alertloc.online/alertloc/pro',
    siteName: 'AlertLoc',
    locale: 'pt_BR',
    type: 'website',
    images: ['/logob.png'],
  },
  twitter: {
    card: 'summary',
    title: 'AlertLoc Pro  Lembretes sem limites',
    description: 'Assine o AlertLoc Pro por R$ 22,90/mês e libere lembretes ilimitados, grupos maiores, alertas urgentes e monitoramento avançado.',
    images: ['/logob.png'],
  },
};

type ProPageProps = {
  searchParams: Promise<{
    user_id?: string;
  }>;
};

export default async function AlertLocProPage({ searchParams }: ProPageProps) {
  const params = await searchParams;
  const userId = params.user_id?.trim() ?? '';

  return (
    <main className={styles.proPage}>
      <nav className={styles.proNav}>
        <Link href="/" className={styles.proLogo}>
          <Image src="/logob.png" alt="AlertLoc" width={42} height={42} priority />
          <span>AlertLoc</span>
        </Link>
        <Link href="/">Voltar ao site</Link>
      </nav>

      <section className={styles.proHero}>
        <div className={styles.proBadge}>
          <Crown size={18} />
          Plano Pro
        </div>
        <h1>AlertLoc Pro</h1>
        <p>
          Mais lembretes, mais controle e recursos avançados para usar o AlertLoc sem limites no Android.
        </p>

        <div className={styles.proPriceCard}>
          <div className={styles.proPriceIcon}>
            <Sparkles size={28} />
          </div>
          <span>Assinatura mensal</span>
          <strong>R$ 22,90<small>/mês</small></strong>
          <p>Pagamento seguro pelo Mercado Pago. A ativação do Pro acontece após confirmação do pagamento.</p>

          {userId ? (
            <CheckoutButton userId={userId} />
          ) : (
            <div className={styles.proErrorBox}>
              Usuário não identificado. Volte ao app e tente novamente.
            </div>
          )}
        </div>
      </section>

      <section className={styles.proBenefits}>
        <div className={styles.proSectionHeader}>
          <ShieldCheck size={24} />
          <h2>O que vem no Pro</h2>
          <p>Recursos pensados para quem usa lembretes por localização todos os dias.</p>
        </div>
        <div className={styles.proBenefitsGrid}>
          {ALERTLOC_PRO_BENEFITS.map((benefit) => (
            <article key={benefit}>
              <Check size={18} />
              <span>{benefit}</span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.proSecurityNote}>
        <strong>Ativação segura</strong>
        <p>
          O AlertLoc só libera o Pro após o webhook do Mercado Pago confirmar o pagamento aprovado.
          A página de sucesso não ativa plano sozinha.
        </p>
      </section>
    </main>
  );
}
