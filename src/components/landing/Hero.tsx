import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import styles from './landing.module.css';
import HeroGlobe from './HeroGlobe';

const heroPoints = [
    'Dispara ao chegar no local certo',
    'Menos esquecimento, mais ação',
    'Funciona sozinho ou em grupo',
];

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.glowBottomRight} />

            <div className={styles.wrap}>
                <div className={styles.heroLayout}>
                    <div className={styles.heroCopy}>
                        <div className={styles.eyebrow}>
                            <span className={styles.eyebrowLine} />
                            Lembretes inteligentes por localização
                        </div>

                        <h1 className={styles.heroTitle}>
                            Lembretes que aparecem
                            <br />
                            <span>na hora certa.</span>
                        </h1>

                        <p className={styles.heroText}>
                            Crie lembretes ligados a lugares reais. Quando você chegar perto
                            do mercado, farmácia, trabalho ou qualquer endereço salvo, o
                            AlertLoc avisa automaticamente.
                        </p>

                        <div className={styles.heroPoints}>
                            {heroPoints.map((point) => (
                                <div key={point} className={styles.heroPoint}>
                                    <span className={styles.heroPointIcon}>
                                        <Check size={13} />
                                    </span>

                                    <span>{point}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.heroActions}>
                            <Link href="/login" className={styles.primaryButton}>
                                Ativar meu radar <ArrowRight size={16} />
                            </Link>

                            <a href="#how" className={styles.secondaryButton}>
                                Ver como funciona
                            </a>
                        </div>
                    </div>

                    <HeroGlobe />
                </div>
            </div>
        </section>
    );
}