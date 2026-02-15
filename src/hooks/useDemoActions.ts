// src/hooks/useDemoActions.ts
import { useCallback, useState } from 'react';
import { useAnchor } from '@nice1/react-tools';

const DEMO_CONTRACT = 'n1licensedem';

export interface DemoActionResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export const useDemoActions = () => {
  const { session } = useAnchor();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * setdemoper - Cambiar período de demo
   */
  const setDemoPeriod = useCallback(
    async (product: string, int_ref: number, newPeriod: number): Promise<DemoActionResult> => {
      if (!session) return { success: false, error: 'No hay sesión activa' };

      setLoading(true);
      setError(null);

      try {
        const owner = session.auth.actor.toString();
        const action = {
          account: DEMO_CONTRACT,
          name: 'setdemoper',
          authorization: [{ actor: owner, permission: session.auth.permission.toString() }],
          data: {
            product: product.toLowerCase(),
            int_ref,
            new_period: newPeriod,
            productowner: owner,
            memo: '',
          },
        };

        console.log('📤 [DEMO setdemoper]', action.data);
        const result = await session.transact({ actions: [action] }, { broadcast: true });
        const txId = result.transaction?.id?.toString() || result.processed?.id?.toString() || 'unknown';
        setLoading(false);
        return { success: true, transactionId: txId };
      } catch (err: any) {
        const msg = err?.message || err?.error?.details?.[0]?.message || 'Error en setdemoper';
        console.error('❌ [DEMO setdemoper]', err);
        setError(msg);
        setLoading(false);
        return { success: false, error: msg };
      }
    },
    [session]
  );

  const clearError = useCallback(() => setError(null), []);

  return { setDemoPeriod, loading, error, clearError };
};