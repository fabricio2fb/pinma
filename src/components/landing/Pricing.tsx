import Link from 'next/link';
import { Check, ChevronRight } from 'lucide-react';

import styles from './landing.module.css';

const plans = [
    {
        name: 'Core',
        price: 'Grátis',
        desc: 'Para testar a ideia e criar seus primeiros lembretes por localização.',
        cta: 'Começar agora',
        featured: false,
        items: [
            'Mapa com OpenStreetMap',
            'Lembretes por localização',
            'Radares limitados',
            'Busca básica de endereço',
        ],
    },
    {
        name: 'Pro',
        price: 'R$ 14,90',
        period: '/mês',
        desc: 'Para quem quer mais precisão, mais recursos e uma experiência mais completa.',
        cta: 'Ativar Pro',
        featured: true,
        items: [
            'Google Maps no plano Pro',
            'Radares ilimitados',
            'Raio de localização mais preciso',
            'Grupos compartilhados',
            'Notificações avançadas',
        ],
    },
];

export default function Pricing() {
    return (
        <section id="pricing" className={styles.pricingSection}>
            <div className={styles.wrap}>
                <div className={styles.centerHeader}>
                    <div className={styles.eyebrowCenter}>
                        <span className={styles.eyebrowLine} />
                        Planos
                    </div>

                    <h2 className={styles.sectionTitle}>
                        Comece simples.
                        <br />
                        <span>Evolua quando precisar.</span>
                    </h2>

                    <p>
                        Sem números falsos, sem promessa exagerada. Um plano gratuito para
                        começar e um plano Pro para quem precisa de mais poder.
                    </p>
                </div>

                <div className={styles.pricingGrid}>
                    {plans.map((plan) => (
                        <article
                            key={plan.name}
                            className={`${styles.priceCard} ${plan.featured ? styles.priceCardFeatured : ''
                                }`}
                        >
                            {plan.featured && (
                                <span className={styles.priceBadge}>Mais completo</span>
                            )}

                            <span className={styles.pricePlan}>{plan.name}</span>

                            <div className={styles.priceRow}>
                                <strong>{plan.price}</strong>

                                {plan.period && <span>{plan.period}</span>}
                            </div>

                            <p>{plan.desc}</p>

                            <div className={styles.priceDivider} />

                            <div className={styles.priceItems}>
                                {plan.items.map((item) => (
                                    <div key={item} className={styles.priceItem}>
                                        <span>
                                            <Check size={13} />
                                        </span>
                                        {item}
                                    </div>
                                ))}
                            </div>

                            <Link
                                href="/login"
                                className={`${styles.priceButton} ${plan.featured ? styles.priceButtonFeatured : ''
                                    }`}
                            >
                                {plan.cta}
                                <ChevronRight size={16} />
                            </Link>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}