import { MapPin, MousePointer2, BellRing } from 'lucide-react';

import styles from './landing.module.css';

const steps = [
    {
        icon: <MapPin size={22} />,
        number: '01',
        title: 'Escolha o lugar',
        desc: 'Busque um endereço, mercado, farmácia, trabalho ou qualquer ponto importante para você.',
    },
    {
        icon: <MousePointer2 size={22} />,
        number: '02',
        title: 'Crie o lembrete',
        desc: 'Defina o que precisa lembrar e ajuste o raio de ativação ao redor daquele local.',
    },
    {
        icon: <BellRing size={22} />,
        number: '03',
        title: 'Receba o aviso',
        desc: 'Quando você chegar perto do lugar salvo, o AlertLoc dispara o lembrete automaticamente.',
    },
];

export default function HowItWorks() {
    return (
        <section id="how" className={styles.howSection}>
            <div className={styles.wrap}>
                <div className={styles.centerHeader}>
                    <div className={styles.eyebrowCenter}>
                        <span className={styles.eyebrowLine} />
                        Como funciona
                    </div>

                    <h2 className={styles.sectionTitle}>
                        Configure uma vez.
                        <br />
                        <span>Receba no momento certo.</span>
                    </h2>

                    <p>
                        O fluxo foi pensado para ser rápido: você escolhe o local, cria o
                        lembrete e deixa o sistema cuidar do aviso.
                    </p>
                </div>

                <div className={styles.howGrid}>
                    {steps.map((step) => (
                        <article key={step.number} className={styles.howCard}>
                            <div className={styles.howIcon}>{step.icon}</div>

                            <span>{step.number}</span>

                            <h3>{step.title}</h3>

                            <p>{step.desc}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}