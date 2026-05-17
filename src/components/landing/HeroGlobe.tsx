import styles from './landing.module.css';

export default function HeroGlobe() {
    return (
        <div className={styles.heroVisual}>
            <div className={styles.orbitalCard}>
                <div className={styles.heroBadge}>
                    Cobertura inteligente em qualquer lugar
                </div>

                <div className={styles.globeWrap}>
                    <div className={styles.globeHalo} />
                    <div className={styles.globeShadow} />

                    <div className={styles.globeCore}>
                        <div className={`${styles.globeGrid} ${styles.globeGridOne}`} />
                        <div className={`${styles.globeGrid} ${styles.globeGridTwo}`} />

                        <div className={styles.globeHighlight} />

                        <div className={`${styles.globeRing} ${styles.globeRingOne}`} />
                        <div className={`${styles.globeRing} ${styles.globeRingTwo}`} />
                        <div className={`${styles.globeRing} ${styles.globeRingThree}`} />

                        <div className={`${styles.globeMarker} ${styles.globeMarkerOne}`}>
                            <span className={styles.globeMarkerDot} />
                            <span className={styles.globeMarkerLabel}>Casa</span>
                        </div>

                        <div className={`${styles.globeMarker} ${styles.globeMarkerTwo}`}>
                            <span className={`${styles.globeMarkerDot} ${styles.orange}`} />
                            <span className={styles.globeMarkerLabel}>Mercado</span>
                        </div>

                        <div className={`${styles.globeMarker} ${styles.globeMarkerThree}`}>
                            <span className={`${styles.globeMarkerDot} ${styles.green}`} />
                            <span className={styles.globeMarkerLabel}>Farmácia</span>
                        </div>

                        <div className={`${styles.globeOrbit} ${styles.globeOrbitA}`} />
                        <div className={`${styles.globeOrbit} ${styles.globeOrbitB}`} />
                        <div className={`${styles.globeOrbit} ${styles.globeOrbitC}`} />
                    </div>
                </div>

                <div className={`${styles.floatingCard} ${styles.floatingCardLeft}`}>
                    <div className={styles.floatingTitle}>
                        <span className={styles.floatingPulse} />
                        Geofence ativo
                    </div>

                    <p>
                        O sistema monitora sua rota em segundo plano com foco em eficiência.
                    </p>
                </div>

                <div className={`${styles.floatingCard} ${styles.floatingCardRight}`}>
                    <div className={`${styles.floatingTitle} ${styles.success}`}>
                        <span className={`${styles.floatingPulse} ${styles.successPulse}`} />
                        Destino atingido
                    </div>

                    <p>
                        Você chegou na <strong>Farmácia</strong>. Hora de buscar a receita.
                    </p>
                </div>

                <div className={styles.heroBottomStrip}>
                    <div className={styles.heroBottomItem}>
                        <span className={`${styles.heroBottomDot} ${styles.blue}`} />
                        Precisão por localização
                    </div>

                    <div className={styles.heroBottomItem}>
                        <span className={`${styles.heroBottomDot} ${styles.green}`} />
                        Baixo consumo
                    </div>

                    <div className={styles.heroBottomItem}>
                        <span className={`${styles.heroBottomDot} ${styles.purple}`} />
                        Notificações automáticas
                    </div>
                </div>
            </div>
        </div>
    );
}