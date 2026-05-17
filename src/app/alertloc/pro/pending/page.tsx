import Link from 'next/link';
import { Clock3 } from 'lucide-react';

import styles from '../status.module.css';

export default function AlertLocProPendingPage() {
  return (
    <main className={styles.statusPage}>
      <section className={styles.statusCard}>
        <div className={styles.statusIcon}>
          <Clock3 size={34} />
        </div>
        <h1>Pagamento pendente</h1>
        <p>
          O Mercado Pago ainda está processando o pagamento. Volte para o app AlertLoc em alguns minutos.
        </p>
        <Link href="/">Voltar para o site</Link>
      </section>
    </main>
  );
}
