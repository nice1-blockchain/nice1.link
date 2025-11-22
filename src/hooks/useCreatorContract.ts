// src/hooks/useCreatorContract.ts
import { useCallback, useState } from 'react';
import { useAnchor } from '@nice1/react-tools';

// Nombre del contrato (ajusta según tu configuración)
const CONTRACT_NAME = 'simpleassets'; // en jungle4

export interface CreateAssetParams {
  author: string;
  owner: string;
  category: string;
  idata: Record<string, any>;
  mdata: Record<string, any>;
  requireclaim: boolean;
}

export interface TransactionResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export const useCreatorContract = () => {
  const { session } = useAnchor();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Acción CREATE del contrato
   */
  const createAsset = useCallback(
    async (params: CreateAssetParams): Promise<TransactionResult> => {
      if (!session) {
        const errMsg = 'No hay sesión activa. Por favor, conecta tu wallet.';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      setLoading(true);
      setError(null);

      try {
        // Construir la acción para el contrato
        const action = {
          account: CONTRACT_NAME,
          name: 'create',
          authorization: [
            {
              actor: session.auth.actor.toString(),
              permission: session.auth.permission.toString(),
            },
          ],
          data: {
            author: params.author,
            category: params.category.toLowerCase(),
            owner: params.owner,
            idata: JSON.stringify(params.idata), // El contrato espera string JSON
            mdata: JSON.stringify(params.mdata), // El contrato espera string JSON
            requireclaim: params.requireclaim,
          },
        };

        console.log('📤 Enviando transacción:', action);

        // Ejecutar la transacción
        const result = await session.transact(
          { actions: [action] },
          {
            broadcast: true
          }
        );

        console.log('✅ Transacción exitosa:', result);

        setLoading(false);
        const txId = result.transaction?.id?.toString() || 
             result.processed?.id?.toString() || 
             'unknown';
        return {
          success: true,
          transactionId: txId,
        };
      } catch (err: any) {
        console.error('❌ Error en transacción:', err);
        
        // Extraer mensaje de error legible
        const errorMessage =
          err?.message ||
          err?.error?.details?.[0]?.message ||
          err?.toString() ||
          'Error desconocido al crear el activo';

        setError(errorMessage);
        setLoading(false);

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [session]
  );

  return {
    createAsset,
    loading,
    error,
    clearError: () => setError(null),
  };
};