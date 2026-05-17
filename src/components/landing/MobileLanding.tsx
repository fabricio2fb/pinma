'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    Bell,
    ChevronRight,
    Home,
    LocateFixed,
    MapPin,
    Navigation,
    Plus,
    Search,
    Settings,
} from 'lucide-react';

import styles from './landing.module.css';

const reminders = [
    {
        title: 'Buscar receita',
        subtitle: 'Farmácia • 120m',
        tone: 'green',
    },
    {
        title: 'Comprar café',
        subtitle: 'Mercado • 350m',
        tone: 'blue',
    },
    {
        title: 'Levar documento',
        subtitle: 'Trabalho • 1,2km',
        tone: 'orange',
    },
];

export default function MobileLanding() {
    return (
        <main className={styles.mobileAppShell}>
            <div className={styles.mobileAppGlow} />

            {/* fake status bar */}
            <div className={styles.mobileStatusBar}>
                <span>9:41</span>
                <div>
                    <span />
                    <span />
                    <span />
                </div>
            </div>

            {/* top app bar */}
            <header className={styles.mobileAppHeader}>
                <div className={styles.mobileAppBrand}>
                    <Image src="/logob.png" alt="AlertLoc" width={30} height={30} />
                    <div>
                        <strong>AlertLoc</strong>
                        <span>Seu radar de lembretes</span>
                    </div>
                </div>

                <Link href="/login" className={styles.mobileHeaderAction}>
                    Entrar
                </Link>
            </header>

            {/* main card */}
            <section className={styles.mobileMainCard}>
                <div className={styles.mobileMainTop}>
                    <div>
                        <span className={styles.mobileMiniLabel}>Hoje</span>
                        <h1>3 lembretes ativos</h1>
                    </div>

                    <button type="button" className={styles.mobileCircleButton}>
                        <Plus size={18} />
                    </button>
                </div>

                {/* map card */}
                <div className={styles.mobileMapCard}>
                    <div className={styles.mobileMapGrid} />

                    <div className={styles.mobileUserMarker}>
                        <Navigation size={16} />
                    </div>

                    <div className={`${styles.mobileMapPin} ${styles.mobileMapPinOne}`}>
                        <MapPin size={13} />
                        <span>Farmácia</span>
                    </div>

                    <div className={`${styles.mobileMapPin} ${styles.mobileMapPinTwo}`}>
                        <MapPin size={13} />
                        <span>Mercado</span>
                    </div>

                    <div className={styles.mobileMapRadiusOne} />
                    <div className={styles.mobileMapRadiusTwo} />

                    <div className={styles.mobileMapOverlayCard}>
                        <strong>Destino próximo</strong>
                        <p>Você está perto da farmácia.</p>
                    </div>
                </div>

                {/* reminder list */}
                <div className={styles.mobileCardsStack}>
                    {reminders.map((item) => (
                        <article key={item.title} className={styles.mobileReminderCard}>
                            <div className={`${styles.mobileReminderBullet} ${styles[item.tone]}`} />

                            <div className={styles.mobileReminderText}>
                                <strong>{item.title}</strong>
                                <span>{item.subtitle}</span>
                            </div>

                            <ChevronRight size={16} />
                        </article>
                    ))}
                </div>
            </section>

            {/* quick actions */}
            <section className={styles.mobileQuickSection}>
                <div className={styles.mobileSectionTitleRow}>
                    <h2>Recursos</h2>
                </div>

                <div className={styles.mobileQuickGrid}>
                    <article className={styles.mobileQuickCard}>
                        <div className={styles.mobileQuickIcon}>
                            <LocateFixed size={18} />
                        </div>
                        <strong>Por localização</strong>
                        <p>O aviso aparece perto do local salvo.</p>
                    </article>

                    <article className={styles.mobileQuickCard}>
                        <div className={styles.mobileQuickIcon}>
                            <Bell size={18} />
                        </div>
                        <strong>Sem horário fixo</strong>
                        <p>Mais contexto e menos alarmes genéricos.</p>
                    </article>

                    <article className={styles.mobileQuickCard}>
                        <div className={styles.mobileQuickIcon}>
                            <Search size={18} />
                        </div>
                        <strong>Busca simples</strong>
                        <p>Encontre locais por endereço ou CEP.</p>
                    </article>

                    <article className={styles.mobileQuickCard}>
                        <div className={styles.mobileQuickIcon}>
                            <Settings size={18} />
                        </div>
                        <strong>Fácil de configurar</strong>
                        <p>Crie e gerencie lembretes em poucos toques.</p>
                    </article>
                </div>
            </section>

            {/* onboarding steps */}
            <section className={styles.mobileStepsCard}>
                <span className={styles.mobileMiniLabel}>Como funciona</span>
                <h2>Use como se fosse um app de verdade</h2>

                <div className={styles.mobileStepsList}>
                    <div className={styles.mobileStepItem}>
                        <span>1</span>
                        <div>
                            <strong>Escolha o local</strong>
                            <p>Busque um endereço ou lugar importante.</p>
                        </div>
                    </div>

                    <div className={styles.mobileStepItem}>
                        <span>2</span>
                        <div>
                            <strong>Escreva o lembrete</strong>
                            <p>Defina o que precisa lembrar naquele lugar.</p>
                        </div>
                    </div>

                    <div className={styles.mobileStepItem}>
                        <span>3</span>
                        <div>
                            <strong>Receba o aviso</strong>
                            <p>Quando estiver perto, o alerta aparece.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* sticky cta */}
            <div className={styles.mobileStickyCTA}>
                <Link href="/login" className={styles.mobileStickyButton}>
                    Criar conta grátis
                </Link>
            </div>

            {/* bottom nav */}
            <nav className={styles.mobileBottomBar}>
                <a href="#" className={styles.mobileBottomBarActive}>
                    <Home size={18} />
                    <span>Início</span>
                </a>

                <a href="#features">
                    <LocateFixed size={18} />
                    <span>Radar</span>
                </a>

                <a href="/login">
                    <Bell size={18} />
                    <span>Conta</span>
                </a>
            </nav>
        </main>
    );
}