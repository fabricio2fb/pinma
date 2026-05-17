'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import styles from './pro.module.css';

type CheckoutButtonProps = {
  userId: string;
};

export function CheckoutButton({ userId }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/alertloc/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        checkout_url?: string;
        init_point?: string;
        error?: string;
      };

      if (!response.ok || !data.checkout_url) {
        throw new Error(data.error || 'Não foi possível iniciar o checkout.');
      }

      window.location.href = data.checkout_url;
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Erro ao iniciar pagamento.');
      setLoading(false);
    }
  }

  return (
    <div className={styles.proCheckoutBox}>
      <button type="button" onClick={handleCheckout} disabled={loading}>
        {loading ? <Loader2 size={20} className={styles.proSpinner} /> : null}
        {loading ? 'Abrindo Mercado Pago...' : 'Assinar Pro por R$ 22,90/mês'}
      </button>
      {error ? <p>{error}</p> : null}
    </div>
  );
}
