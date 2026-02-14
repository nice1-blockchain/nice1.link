// src/hooks/useDemo.ts
import { useCallback, useState } from 'react';
import { useAnchor } from '@nice1/react-tools';

const DEMO_CONTRACT = 'n1licensedem';
const NFT_CONTRACT = 'nice2simplea';

export interface SetDemoProductParams {
  product: string;
  period: number; // Tiempo en segundos
}

export interface DemoFlowParams extends SetDemoProductParams {
  referenceNftId: number;
  assetIdsToSend: number[];
}

export interface DemoResult {
  success: boolean;
  transactionId?: string;
  int_ref?: number;
  error?: string;
  step?: 'setproduct' | 'transfer';
}

type DemoStep = 'idle' | 'setproduct' | 'transfer' | 'completed' | 'error';

/**
 * Genera un número aleatorio de 8 dígitos
 */
const generateRef = (): number => {
  return Math.floor(10000000 + Math.random() * 90000000);
};

export const useDemo = () => {
  const { session } = useAnchor();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<DemoStep>('idle');

  /**
   * Paso 1: setproduct + addproddata (combinados en una sola transacción)
   */
  const setProductAndAddData = useCallback(
    async (
      params: SetDemoProductParams,
      int_ref: number,
      ext_ref: number,
      referenceNftId: number
    ): Promise<DemoResult> => {
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

        // Acción 1: setproduct (solo campos del contrato demo)
        const setProductAction = {
          account: DEMO_CONTRACT,
          name: 'setproduct',
          authorization,
          data: {
            productowner: owner,
            product: params.product.toLowerCase(),
            nftcontract: NFT_CONTRACT,
            int_ref: int_ref,
            ext_ref: ext_ref,
            period: params.period,
          },
        };

        // Acción 2: addproddata
        const addproddataAction = {
          account: DEMO_CONTRACT,
          name: 'addproddata',
          authorization,
          data: {
            owner: owner,
            int_ref: int_ref,
            id: referenceNftId,
            productowner: owner,
          },
        };

        console.log('📤 [DEMO setproduct + addproddata] Enviando:', {
          setProductAction,
          addproddataAction,
        });

        const result = await session.transact(
          { actions: [setProductAction, addproddataAction] },
          { broadcast: true }
        );

        console.log('✅ [DEMO setproduct + addproddata] Éxito:', result);

        const txId =
          result.transaction?.id?.toString() ||
          result.processed?.id?.toString() ||
          'unknown';

        return { success: true, transactionId: txId, int_ref, step: 'setproduct' };
      } catch (err: any) {
        console.error('❌ [DEMO setproduct + addproddata] Error:', err);
        const errorMessage =
          err?.message ||
          err?.error?.details?.[0]?.message ||
          'Error al registrar producto para demo';
        return { success: false, error: errorMessage, step: 'setproduct' };
      }
    },
    [session]
  );

  /**
   * Paso 2: transfer - Envía NFTs al contrato de demo como stock
   */
  const transferToDemo = useCallback(
    async (assetIds: number[], int_ref: number): Promise<DemoResult> => {
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
            to: DEMO_CONTRACT,
            assetids: assetIds,
            memo: int_ref.toString(),
          },
        };

        console.log('📤 [DEMO transfer] Enviando:', action);

        const result = await session.transact(
          { actions: [action] },
          { broadcast: true }
        );

        console.log('✅ [DEMO transfer] Éxito:', result);

        const txId =
          result.transaction?.id?.toString() ||
          result.processed?.id?.toString() ||
          'unknown';

        return { success: true, transactionId: txId, int_ref, step: 'transfer' };
      } catch (err: any) {
        console.error('❌ [DEMO transfer] Error:', err);
        const errorMessage =
          err?.message ||
          err?.error?.details?.[0]?.message ||
          'Error al transferir NFTs para demo';
        return { success: false, error: errorMessage, step: 'transfer' };
      }
    },
    [session]
  );

  /**
   * Flujo completo de demo: (setproduct + addproddata) → transfer
   */
  const executeDemoFlow = useCallback(
    async (params: DemoFlowParams): Promise<DemoResult> => {
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
        console.log('🚀 [DEMO] Iniciando paso 1/2: setproduct + addproddata');

        const step1 = await setProductAndAddData(params, int_ref, ext_ref, params.referenceNftId);
        if (!step1.success) {
          setError(step1.error || 'Error en setproduct + addproddata');
          setCurrentStep('error');
          setLoading(false);
          return step1;
        }

        // PASO 2: transfer
        setCurrentStep('transfer');
        console.log('🚀 [DEMO] Iniciando paso 2/2: transfer');

        const step2 = await transferToDemo(params.assetIdsToSend, int_ref);
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
        console.error('❌ Error en flujo de demo:', err);
        const errorMessage = err?.message || 'Error desconocido en el flujo de demo';
        setError(errorMessage);
        setCurrentStep('error');
        setLoading(false);
        return { success: false, error: errorMessage };
      }
    },
    [session, setProductAndAddData, transferToDemo]
  );

  /**
   * Reponer stock: transfer con memo = int_ref
   */
  const restockDemoProduct = useCallback(
    async (assetIds: number[], int_ref: number): Promise<DemoResult> => {
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
            to: DEMO_CONTRACT,
            assetids: assetIds,
            memo: int_ref.toString(),
          },
        };

        console.log('📤 [DEMO restock] Enviando:', action);

        const result = await session.transact(
          { actions: [action] },
          { broadcast: true }
        );

        console.log('✅ [DEMO restock] Éxito:', result);

        const txId =
          result.transaction?.id?.toString() ||
          result.processed?.id?.toString() ||
          'unknown';

        setLoading(false);
        return { success: true, transactionId: txId, int_ref, step: 'transfer' };
      } catch (err: any) {
        console.error('❌ [DEMO restock] Error:', err);
        const errorMessage =
          err?.message ||
          err?.error?.details?.[0]?.message ||
          'Error al reponer stock de demo';
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
    executeDemoFlow,
    restockDemoProduct,
    loading,
    error,
    currentStep,
    clearError,
    resetStep,
  };
};