import Link from 'next/link';
import { XCircle } from 'lucide-react';

import styles from '../status.module.css';

export default function AlertLocProFailurePage() {
  return (
    <main className={styles.statusPage}>
      <section className={styles.statusCard}>
        <div className={styles.statusIcon}>
          <XCircle size={34} />
        </div>
        <h1>Pagamento não concluído</h1>
        <p>
          Não ativamos o Pro porque o pagamento não foi aprovado. Volte para o app AlertLoc e tente novamente.
        </p>
        <Link href="/">Voltar para o site</Link>
      </section>
    </main>
  );
}
