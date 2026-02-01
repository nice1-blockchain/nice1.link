// src/hooks/useSale.ts
import { useCallback, useState } from 'react';
import { useAnchor } from '@nice1/react-tools';

const SALE_CONTRACT = 'n1licensepos';
const NFT_CONTRACT = 'nice2simplea';
const TOKEN_CONTRACT = 'niceoneoffic';
const TOKEN_SYMBOL = 'NICEOFI';
const TOKEN_PRECISION = 4;

export interface SetProductParams {
  product: string;
  price: number;
  receiver1: string;
  percentr1: number;
  receiver2: string;
  percentr2: number;
}

export interface SaleFlowParams extends SetProductParams {
  referenceNftId: number; // ID más bajo (referencia)
  assetIdsToSend: number[]; // IDs a enviar como stock inicial
}

export interface SaleResult {
  success: boolean;
  transactionId?: string;
  int_ref?: number;
  error?: string;
  step?: 'setproduct' | 'addproductdata' | 'transfer';
}

type SaleStep = 'idle' | 'setproduct' | 'addproductdata' | 'transfer' | 'completed' | 'error';

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

export const useSale = () => {
  const { session } = useAnchor();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<SaleStep>('idle');

  /**
   * Paso 1: setproduct - Registra el producto en el contrato de venta
   */
  const setProduct = useCallback(
    async (params: SetProductParams, int_ref: number, ext_inf: number): Promise<SaleResult> => {
      if (!session) {
        return { success: false, error: 'No hay sesión activa', step: 'setproduct' };
      }

      try {
        const productOwner = session.auth.actor.toString();

        const action = {
          account: SALE_CONTRACT,
          name: 'setproduct',
          authorization: [
            {
              actor: productOwner,
              permission: session.auth.permission.toString(),
            },
          ],
          data: {
            productowner: productOwner,
            product: params.product,
            price: formatPrice(params.price),
            tokencontract: TOKEN_CONTRACT,
            nftcontract: NFT_CONTRACT,
            int_ref: int_ref,
            ext_inf: ext_inf,
            receiver1: params.receiver1,
            percentr1: params.percentr1,
            receiver2: params.receiver2 || '',
            percentr2: params.percentr2 || 0,
          },
        };

        console.log('📤 [setproduct] Enviando:', action);

        const result = await session.transact(
          { actions: [action] },
          { broadcast: true }
        );

        console.log('✅ [setproduct] Éxito:', result);

        const txId =
          result.transaction?.id?.toString() ||
          result.processed?.id?.toString() ||
          'unknown';

        return { success: true, transactionId: txId, int_ref, step: 'setproduct' };
      } catch (err: any) {
        console.error('❌ [setproduct] Error:', err);
        const errorMessage =
          err?.message ||
          err?.error?.details?.[0]?.message ||
          'Error al registrar producto';
        return { success: false, error: errorMessage, step: 'setproduct' };
      }
    },
    [session]
  );

  /**
   * Paso 2: addproductdata - Vincula el NFT de referencia al producto
   */
  const addProductData = useCallback(
    async (int_ref: number, referenceNftId: number): Promise<SaleResult> => {
      if (!session) {
        return { success: false, error: 'No hay sesión activa', step: 'addproductdata' };
      }

      try {
        const owner = session.auth.actor.toString();

        const action = {
          account: SALE_CONTRACT,
          name: 'addproductdata',
          authorization: [
            {
              actor: owner,
              permission: session.auth.permission.toString(),
            },
          ],
          data: {
            owner: owner,
            int_ref: int_ref,
            id: referenceNftId,
            productowner: owner,
          },
        };

        console.log('📤 [addproductdata] Enviando:', action);

        const result = await session.transact(
          { actions: [action] },
          { broadcast: true }
        );

        console.log('✅ [addproductdata] Éxito:', result);

        const txId =
          result.transaction?.id?.toString() ||
          result.processed?.id?.toString() ||
          'unknown';

        return { success: true, transactionId: txId, int_ref, step: 'addproductdata' };
      } catch (err: any) {
        console.error('❌ [addproductdata] Error:', err);
        const errorMessage =
          err?.message ||
          err?.error?.details?.[0]?.message ||
          'Error al vincular NFT de referencia';
        return { success: false, error: errorMessage, step: 'addproductdata' };
      }
    },
    [session]
  );

  /**
   * Paso 3: transfer - Envía NFTs al contrato de venta como stock inicial
   */
  const transferToSale = useCallback(
    async (assetIds: number[], int_ref: number): Promise<SaleResult> => {
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
            to: SALE_CONTRACT,
            assetids: assetIds,
            memo: int_ref.toString(),
          },
        };

        console.log('📤 [transfer] Enviando:', action);

        const result = await session.transact(
          { actions: [action] },
          { broadcast: true }
        );

        console.log('✅ [transfer] Éxito:', result);

        const txId =
          result.transaction?.id?.toString() ||
          result.processed?.id?.toString() ||
          'unknown';

        return { success: true, transactionId: txId, int_ref, step: 'transfer' };
      } catch (err: any) {
        console.error('❌ [transfer] Error:', err);
        const errorMessage =
          err?.message ||
          err?.error?.details?.[0]?.message ||
          'Error al transferir NFTs';
        return { success: false, error: errorMessage, step: 'transfer' };
      }
    },
    [session]
  );

  /**
   * Flujo completo de venta: setproduct → addproductdata → transfer
   * Cada paso requiere firma individual del usuario
   */
  const executeSaleFlow = useCallback(
    async (params: SaleFlowParams): Promise<SaleResult> => {
      if (!session) {
        const errMsg = 'No hay sesión activa. Por favor, conecta tu wallet.';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      setLoading(true);
      setError(null);

      // Generar referencias únicas
      const int_ref = generateRef();
      const ext_inf = generateRef();

      try {
        // PASO 1: setproduct
        setCurrentStep('setproduct');
        console.log('🚀 Iniciando paso 1: setproduct');
        
        const step1 = await setProduct(params, int_ref, ext_inf);
        if (!step1.success) {
          setError(step1.error || 'Error en setproduct');
          setCurrentStep('error');
          setLoading(false);
          return step1;
        }

        // PASO 2: addproductdata
        setCurrentStep('addproductdata');
        console.log('🚀 Iniciando paso 2: addproductdata');
        
        const step2 = await addProductData(int_ref, params.referenceNftId);
        if (!step2.success) {
          setError(step2.error || 'Error en addproductdata');
          setCurrentStep('error');
          setLoading(false);
          return step2;
        }

        // PASO 3: transfer (stock inicial)
        setCurrentStep('transfer');
        console.log('🚀 Iniciando paso 3: transfer');
        
        const step3 = await transferToSale(params.assetIdsToSend, int_ref);
        if (!step3.success) {
          setError(step3.error || 'Error en transfer');
          setCurrentStep('error');
          setLoading(false);
          return step3;
        }

        // TODO: Completado
        setCurrentStep('completed');
        setLoading(false);

        return {
          success: true,
          transactionId: step3.transactionId,
          int_ref,
        };
      } catch (err: any) {
        console.error('❌ Error en flujo de venta:', err);
        const errorMessage = err?.message || 'Error desconocido en el flujo de venta';
        setError(errorMessage);
        setCurrentStep('error');
        setLoading(false);
        return { success: false, error: errorMessage };
      }
    },
    [session, setProduct, addProductData, transferToSale]
  );

  /**
   * Reponer stock: transfer con memo = int_ref
   */
  const restockProduct = useCallback(
    async (assetIds: number[], int_ref: number): Promise<SaleResult> => {
      if (!session) {
        const errMsg = 'No hay sesión activa. Por favor, conecta tu wallet.';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      setLoading(true);
      setError(null);

      const result = await transferToSale(assetIds, int_ref);

      setLoading(false);
      if (!result.success) {
        setError(result.error || 'Error al reponer stock');
      }

      return result;
    },
    [session, transferToSale]
  );

  return {
    executeSaleFlow,
    restockProduct,
    loading,
    error,
    currentStep,
    clearError: () => setError(null),
    resetStep: () => setCurrentStep('idle'),
  };
};