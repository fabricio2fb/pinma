import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

import styles from '../status.module.css';

export default function AlertLocProSuccessPage() {
  return (
    <main className={styles.statusPage}>
      <section className={styles.statusCard}>
        <div className={styles.statusIcon}>
          <CheckCircle2 size={34} />
        </div>
        <h1>Plano Pro ativado</h1>
        <p>
          O pagamento foi recebido pelo Mercado Pago. Volte para o app AlertLoc e atualize seu perfil.
        </p>
        <Link href="/">Voltar para o site</Link>
      </section>
    </main>
  );
}
