import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import styles from './landing.module.css';

export default function CTA() {
    return (
        <section className={styles.ctaSection}>
            <div className={styles.wrap}>
                <div className={styles.ctaCard}>
                    <span>Pronto para testar?</span>

                    <h2>
                        Transforme lugares em
                        <br />
                        <em>lembretes inteligentes.</em>
                    </h2>

                    <p>
                        Comece criando seus primeiros lembretes por localização e veja se o
                        AlertLoc faz sentido para sua rotina.
                    </p>

                    <Link href="/login" className={styles.primaryButton}>
                        Criar conta grátis <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </section>
    );
}