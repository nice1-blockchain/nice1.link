// src/hooks/useModify.ts
import { useCallback, useState } from 'react';
import { useAnchor } from '@nice1/react-tools';
import { GroupedAsset } from './useStock';

const CONTRACT_NAME = 'simpleassets'; // ⚠️ IMPORTANTE: Cambiar si usas otro contrato

export interface ModifyAssetParams {
  assetid: number;
  mdata: Record<string, any>;
}

export interface ModifyResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export const useModify = () => {
  const { session } = useAnchor();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Modificar (actualizar) mdata de un asset
   */
  const modifyAsset = useCallback(
    async (params: ModifyAssetParams): Promise<ModifyResult> => {
      if (!session) {
        const errMsg = 'No hay sesión activa. Por favor, conecta tu wallet.';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      setLoading(true);
      setError(null);

      try {
        const author = session.auth.actor.toString();
        const owner = session.auth.actor.toString();

        console.log('📤 Modificando asset:', {
          assetid: params.assetid,
          mdata: params.mdata,
        });

        // Construir acción update
        const action = {
          account: CONTRACT_NAME,
          name: 'update',
          authorization: [
            {
              actor: session.auth.actor.toString(),
              permission: session.auth.permission.toString(),
            },
          ],
          data: {
            author,
            owner,
            assetid: params.assetid,
            mdata: JSON.stringify(params.mdata), // Convertir a JSON string
          },
        };

        console.log('📤 Acción update:', action);

        // Ejecutar transacción
        const result = await session.transact(
          { actions: [action] },
          {
            broadcast: true,
          }
        );

        console.log('✅ Modificación exitosa:', result);

        setLoading(false);

        const txId =
          result.transaction?.id?.toString() ||
          result.processed?.id?.toString() ||
          'unknown';

        return {
          success: true,
          transactionId: txId,
        };
      } catch (err: any) {
        console.error('❌ Error modificando asset:', err);

        const errorMessage =
          err?.message ||
          err?.error?.details?.[0]?.message ||
          err?.toString() ||
          'Error desconocido al modificar el asset';

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
    modifyAsset,
    loading,
    error,
    clearError: () => setError(null),
  };
};