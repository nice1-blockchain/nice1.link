// src/hooks/useRentalActions.ts
import { useCallback, useState } from 'react';
import { useAnchor } from '@nice1/react-tools';

const RENTAL_CONTRACT = 'n1licenseren';
const TOKEN_CONTRACT = 'niceoneoffic';
const TOKEN_SYMBOL = 'NICEOFI';
const TOKEN_PRECISION = 4;

const formatPrice = (price: number): string => {
  return `${price.toFixed(TOKEN_PRECISION)} ${TOKEN_SYMBOL}`;
};

export interface RentalActionResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export const useRentalActions = () => {
  const { session } = useAnchor();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * toggleprod - Activar/desactivar producto de alquiler
   */
  const toggleProduct = useCallback(
    async (product: string, int_ref: number, active: boolean): Promise<RentalActionResult> => {
      if (!session) return { success: false, error: 'No hay sesión activa' };

      setLoading(true);
      setError(null);

      try {
        const owner = session.auth.actor.toString();
        const action = {
          account: RENTAL_CONTRACT,
          name: 'toggleprod',
          authorization: [{ actor: owner, permission: session.auth.permission.toString() }],
          data: {
            product: product.toLowerCase(),
            int_ref,
            productowner: owner,
            active,
            memo: '',
          },
        };

        console.log('📤 [RENTAL toggleprod]', action.data);
        const result = await session.transact({ actions: [action] }, { broadcast: true });
        const txId = result.transaction?.id?.toString() || result.processed?.id?.toString() || 'unknown';
        setLoading(false);
        return { success: true, transactionId: txId };
      } catch (err: any) {
        const msg = err?.message || err?.error?.details?.[0]?.message || 'Error en toggleprod';
        console.error('❌ [RENTAL toggleprod]', err);
        setError(msg);
        setLoading(false);
        return { success: false, error: msg };
      }
    },
    [session]
  );

  /**
   * updateprice - Cambiar precio del producto
   */
  const updatePrice = useCallback(
    async (product: string, int_ref: number, newPrice: number): Promise<RentalActionResult> => {
      if (!session) return { success: false, error: 'No hay sesión activa' };

      setLoading(true);
      setError(null);

      try {
        const owner = session.auth.actor.toString();
        const action = {
          account: RENTAL_CONTRACT,
          name: 'updateprice',
          authorization: [{ actor: owner, permission: session.auth.permission.toString() }],
          data: {
            product: product.toLowerCase(),
            int_ref,
            new_price: formatPrice(newPrice),
            productowner: owner,
            memo: '',
          },
        };

        console.log('📤 [RENTAL updateprice]', action.data);
        const result = await session.transact({ actions: [action] }, { broadcast: true });
        const txId = result.transaction?.id?.toString() || result.processed?.id?.toString() || 'unknown';
        setLoading(false);
        return { success: true, transactionId: txId };
      } catch (err: any) {
        const msg = err?.message || err?.error?.details?.[0]?.message || 'Error en updateprice';
        console.error('❌ [RENTAL updateprice]', err);
        setError(msg);
        setLoading(false);
        return { success: false, error: msg };
      }
    },
    [session]
  );

  /**
   * updateperc - Cambiar reparto de receptores
   */
  const updatePercentages = useCallback(
    async (
      product: string,
      int_ref: number,
      receiver1: string,
      percentr1: number,
      receiver2: string,
      percentr2: number
    ): Promise<RentalActionResult> => {
      if (!session) return { success: false, error: 'No hay sesión activa' };

      setLoading(true);
      setError(null);

      try {
        const owner = session.auth.actor.toString();
        const action = {
          account: RENTAL_CONTRACT,
          name: 'updateperc',
          authorization: [{ actor: owner, permission: session.auth.permission.toString() }],
          data: {
            product: product.toLowerCase(),
            int_ref,
            productowner: owner,
            receiver1,
            percentr1,
            receiver2: receiver2 || '',
            percentr2: percentr2 || 0,
            memo: '',
          },
        };

        console.log('📤 [RENTAL updateperc]', action.data);
        const result = await session.transact({ actions: [action] }, { broadcast: true });
        const txId = result.transaction?.id?.toString() || result.processed?.id?.toString() || 'unknown';
        setLoading(false);
        return { success: true, transactionId: txId };
      } catch (err: any) {
        const msg = err?.message || err?.error?.details?.[0]?.message || 'Error en updateperc';
        console.error('❌ [RENTAL updateperc]', err);
        setError(msg);
        setLoading(false);
        return { success: false, error: msg };
      }
    },
    [session]
  );

  const clearError = useCallback(() => setError(null), []);

  return { toggleProduct, updatePrice, updatePercentages, loading, error, clearError };
};