import {
    Bell,
    LocateFixed,
    MapPin,
    Shield,
    Users,
    Zap,
} from 'lucide-react';

import styles from './landing.module.css';

const features = [
    {
        title: 'Lembretes por localização',
        desc: 'Crie um lembrete e receba o aviso quando estiver perto do lugar salvo.',
        icon: <LocateFixed size={20} />,
        type: 'radar',
        cardClass: styles.bentoCardSmall,
    },
    {
        title: 'Privacidade',
        desc: 'A localização é tratada com cuidado desde o começo.',
        icon: <Shield size={20} />,
        type: 'shield',
        cardClass: styles.bentoCardSmall,
    },
    {
        title: 'Busca por endereço',
        desc: 'Encontre locais por endereço, CEP ou ponto de interesse.',
        icon: <MapPin size={20} />,
        type: 'map',
        cardClass: styles.bentoCardSmall,
    },
    {
        title: 'Aviso no momento certo',
        desc: 'Em vez de depender só de horário, o alerta aparece perto do local.',
        icon: <Bell size={20} />,
        type: 'notification',
        cardClass: styles.bentoCardWide,
    },
    {
        title: 'Compartilhamento',
        desc: 'Use sozinho ou compartilhe lembretes com outras pessoas.',
        icon: <Users size={20} />,
        type: 'group',
        cardClass: styles.bentoCardWide,
    },
];

export default function Features() {
    return (
        <section id="features" className={styles.featuresBentoSection}>
            <div className={styles.wrap}>
                <div className={styles.featuresBentoHeader}>
                    <div className={styles.eyebrow}>
                        <span className={styles.eyebrowLine} />
                        Recursos
                    </div>

                    <h2 className={styles.sectionTitle}>
                        Recursos simples.
                        <br />
                        <span>Do jeito que precisa ser.</span>
                    </h2>

                    <p>
                        O AlertLoc foi pensado para resolver uma tarefa específica: lembrar
                        você de algo quando chegar perto de um lugar importante.
                    </p>
                </div>

                <div className={styles.featuresBentoGrid}>
                    {features.map((feature) => (
                        <article
                            key={feature.title}
                            className={`${styles.bentoCard} ${feature.cardClass}`}
                        >
                            <div className={styles.bentoTopVisual}>
                                {feature.type === 'radar' && (
                                    <div className={styles.bentoVisualRadar}>
                                        <div className={styles.radarCircleOne} />
                                        <div className={styles.radarCircleTwo} />
                                        <div className={styles.radarCircleThree} />
                                        <div className={styles.radarPin}>
                                            <MapPin size={18} />
                                        </div>
                                        <div className={styles.radarLabel}>Local salvo</div>
                                    </div>
                                )}

                                {feature.type === 'shield' && (
                                    <div className={styles.bentoMiniVisual}>
                                        <div className={styles.securityRing}>
                                            <Shield size={28} />
                                        </div>
                                    </div>
                                )}

                                {feature.type === 'usage' && (
                                    <div className={styles.bentoSpeedVisual}>
                                        <div className={styles.speedBar} />
                                        <div className={styles.speedChart}>
                                            <span />
                                            <span />
                                            <span />
                                            <span />
                                        </div>
                                    </div>
                                )}

                                {feature.type === 'notification' && (
                                    <div className={styles.notificationPreview}>
                                        <div className={styles.notificationDot} />
                                        <strong>Destino atingido</strong>
                                        <p>Você chegou perto da farmácia.</p>
                                    </div>
                                )}

                                {feature.type === 'group' && (
                                    <div className={styles.groupPreview}>
                                        <div className={styles.avatarStack}>
                                            <span />
                                            <span />
                                            <span />
                                        </div>
                                        <div className={styles.groupLine} />
                                        <div className={styles.groupLineSmall} />
                                    </div>
                                )}

                                {feature.type === 'map' && (
                                    <div className={styles.bentoMiniVisual}>
                                        <div className={styles.mapBubble}>
                                            <MapPin size={20} />
                                        </div>
                                        <div className={styles.mapRoute} />
                                    </div>
                                )}
                            </div>

                            <div className={styles.bentoContentCompact}>
                                <div className={styles.bentoIconSmall}>{feature.icon}</div>

                                <h3>{feature.title}</h3>

                                <p>{feature.desc}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}