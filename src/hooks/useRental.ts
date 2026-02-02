// src/hooks/useRental.ts
import { useCallback, useState } from 'react';
import { useAnchor } from '@nice1/react-tools';

const RENTAL_CONTRACT = 'n1licenseren';
const NFT_CONTRACT = 'nice2simplea';
const TOKEN_CONTRACT = 'niceoneoffic';
const TOKEN_SYMBOL = 'NICEOFI';
const TOKEN_PRECISION = 4;

export interface SetRentalProductParams {
  product: string;
  price: number;
  receiver1: string;
  percentr1: number;
  receiver2: string;
  percentr2: number;
  period: number; // Tiempo en segundos
  redelegate: boolean;
}

export interface RentalFlowParams extends SetRentalProductParams {
  referenceNftId: number;
  assetIdsToSend: number[];
}

export interface RentalResult {
  success: boolean;
  transactionId?: string;
  int_ref?: number;
  error?: string;
  step?: 'setproduct' | 'transfer';
}

type RentalStep = 'idle' | 'setproduct' | 'transfer' | 'completed' | 'error';

/**
 * Genera un número aleatorio de 8 dígitos
 */
const generateRef = (): number => {
  return Math.floor(10000000 + Math.random() * 90000000);
};

/**
 * Formatea el precio a "X.0000 NICEOFI"
 */
const formatPrice = (price: number): string => {
  return `${price.toFixed(TOKEN_PRECISION)} ${TOKEN_SYMBOL}`;
};

export const useRental = () => {
  const { session } = useAnchor();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<RentalStep>('idle');

  /**
   * Paso 1: setproduct + addproddata (combinados en una sola transacción)
   */
  const setProductAndAddData = useCallback(
    async (
      params: SetRentalProductParams,
      int_ref: number,
      ext_ref: number,
      referenceNftId: number
    ): Promise<RentalResult> => {
      if (!session) {
        return { success: false, error: 'No hay sesión activa', step: 'setproduct' };
      }

      try {
        const owner = session.auth.actor.toString();
        const authorization = [
          {
            actor: owner,
            permission: session.auth.permission.toString(),
          },
        ];

        // Acción 1: setproduct
        const setProductAction = {
          account: RENTAL_CONTRACT,
          name: 'setproduct',
          authorization,
          data: {
            productowner: owner,
            product: params.product.toLowerCase(),
            price: formatPrice(params.price),
            tokencontract: TOKEN_CONTRACT,
            nftcontract: NFT_CONTRACT,
            int_ref: int_ref,
            ext_ref: ext_ref,
            receiver1: params.receiver1,
            percentr1: params.percentr1,
            receiver2: params.receiver2 || '',
            percentr2: params.percentr2 || 0,
            period: params.period,
            redelegate: params.redelegate,
          },
        };

        // Acción 2: addproddata
        const addproddataAction = {
          account: RENTAL_CONTRACT,
          name: 'addproddata',
          authorization,
          data: {
            owner: owner,
            int_ref: int_ref,
            id: referenceNftId,
            productowner: owner,
          },
        };

        console.log('📤 [RENTAL setproduct + addproddata] Enviando:', {
          setProductAction,
          addproddataAction,
        });

        const result = await session.transact(
          { actions: [setProductAction, addproddataAction] },
          { broadcast: true }
        );

        console.log('✅ [RENTAL setproduct + addproddata] Éxito:', result);

        const txId =
          result.transaction?.id?.toString() ||
          result.processed?.id?.toString() ||
          'unknown';

        return { success: true, transactionId: txId, int_ref, step: 'setproduct' };
      } catch (err: any) {
        console.error('❌ [RENTAL setproduct + addproddata] Error:', err);
        const errorMessage =
          err?.message ||
          err?.error?.details?.[0]?.message ||
          'Error al registrar producto para alquiler';
        return { success: false, error: errorMessage, step: 'setproduct' };
      }
    },
    [session]
  );

  /**
   * Paso 2: transfer - Envía NFTs al contrato de alquiler como stock
   */
  const transferToRental = useCallback(
    async (assetIds: number[], int_ref: number): Promise<RentalResult> => {
      if (!session) {
        return { success: false, error: 'No hay sesión activa', step: 'transfer' };
      }

      try {
        const from = session.auth.actor.toString();

        const action = {
          account: NFT_CONTRACT,
          name: 'transfer',
          authorization: [
            {
              actor: from,
              permission: session.auth.permission.toString(),
            },
          ],
          data: {
            from: from,
            to: RENTAL_CONTRACT,
            assetids: assetIds,
            memo: int_ref.toString(),
          },
        };

        console.log('📤 [RENTAL transfer] Enviando:', action);

        const result = await session.transact(
          { actions: [action] },
          { broadcast: true }
        );

        console.log('✅ [RENTAL transfer] Éxito:', result);

        const txId =
          result.transaction?.id?.toString() ||
          result.processed?.id?.toString() ||
          'unknown';

        return { success: true, transactionId: txId, int_ref, step: 'transfer' };
      } catch (err: any) {
        console.error('❌ [RENTAL transfer] Error:', err);
        const errorMessage =
          err?.message ||
          err?.error?.details?.[0]?.message ||
          'Error al transferir NFTs para alquiler';
        return { success: false, error: errorMessage, step: 'transfer' };
      }
    },
    [session]
  );

  /**
   * Flujo completo de alquiler: (setproduct + addproddata) → transfer
   */
  const executeRentalFlow = useCallback(
    async (params: RentalFlowParams): Promise<RentalResult> => {
      if (!session) {
        const errMsg = 'No hay sesión activa. Por favor, conecta tu wallet.';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      setLoading(true);
      setError(null);

      const int_ref = generateRef();
      const ext_ref = generateRef();

      try {
        // PASO 1: setproduct + addproddata
        setCurrentStep('setproduct');
        console.log('🚀 [RENTAL] Iniciando paso 1/2: setproduct + addproddata');

        const step1 = await setProductAndAddData(params, int_ref, ext_ref, params.referenceNftId);
        if (!step1.success) {
          setError(step1.error || 'Error en setproduct + addproddata');
          setCurrentStep('error');
          setLoading(false);
          return step1;
        }

        // PASO 2: transfer
        setCurrentStep('transfer');
        console.log('🚀 [RENTAL] Iniciando paso 2/2: transfer');

        const step2 = await transferToRental(params.assetIdsToSend, int_ref);
        if (!step2.success) {
          setError(step2.error || 'Error en transfer');
          setCurrentStep('error');
          setLoading(false);
          return step2;
        }

        setCurrentStep('completed');
        setLoading(false);

        return {
          success: true,
          transactionId: step2.transactionId,
          int_ref,
        };
      } catch (err: any) {
        console.error('❌ Error en flujo de alquiler:', err);
        const errorMessage = err?.message || 'Error desconocido en el flujo de alquiler';
        setError(errorMessage);
        setCurrentStep('error');
        setLoading(false);
        return { success: false, error: errorMessage };
      }
    },
    [session, setProductAndAddData, transferToRental]
  );

  /**
   * Reponer stock: transfer con memo = int_ref
   */
  const restockRentalProduct = useCallback(
    async (assetIds: number[], int_ref: number): Promise<RentalResult> => {
      if (!session) {
        const errMsg = 'No hay sesión activa. Por favor, conecta tu wallet.';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      setLoading(true);
      setError(null);

      try {
        const from = session.auth.actor.toString();

        const action = {
          account: NFT_CONTRACT,
          name: 'transfer',
          authorization: [
            {
              actor: from,
              permission: session.auth.permission.toString(),
            },
          ],
          data: {
            from: from,
            to: RENTAL_CONTRACT,
            assetids: assetIds,
            memo: int_ref.toString(),
          },
        };

        console.log('📤 [RENTAL restock] Enviando:', action);

        const result = await session.transact(
          { actions: [action] },
          { broadcast: true }
        );

        console.log('✅ [RENTAL restock] Éxito:', result);

        const txId =
          result.transaction?.id?.toString() ||
          result.processed?.id?.toString() ||
          'unknown';

        setLoading(false);
        return { success: true, transactionId: txId, int_ref, step: 'transfer' };
      } catch (err: any) {
        console.error('❌ [RENTAL restock] Error:', err);
        const errorMessage =
          err?.message ||
          err?.error?.details?.[0]?.message ||
          'Error al reponer stock de alquiler';
        setError(errorMessage);
        setLoading(false);
        return { success: false, error: errorMessage, step: 'transfer' };
      }
    },
    [session]
  );

  const clearError = useCallback(() => setError(null), []);
  const resetStep = useCallback(() => setCurrentStep('idle'), []);

  return {
    executeRentalFlow,
    restockRentalProduct,
    loading,
    error,
    currentStep,
    clearError,
    resetStep,
  };
};