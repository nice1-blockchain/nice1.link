// src/hooks/useDuplicate.ts
import { useCallback, useState } from 'react';
import { useAnchor } from '@nice1/react-tools';
import { GroupedAsset } from './useStock';

const CONTRACT_NAME = 'niceXWax'; // Cambiar por el nombre real del contrato

export interface DuplicateResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  copiesCreated?: number;
}

export const useDuplicate = () => {
  const { session } = useAnchor();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Duplicar un asset N veces
   */
  const duplicateAsset = useCallback(
    async (asset: GroupedAsset, copies: number): Promise<DuplicateResult> => {
      if (!session) {
        const errMsg = 'No hay sesión activa. Por favor, conecta tu wallet.';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      if (copies < 1 || copies > 100) {
        const errMsg = 'El número de copias debe estar entre 1 y 100';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      setLoading(true);
      setError(null);

      try {
        const author = session.auth.actor.toString();

        // Construir array de acciones (una por cada copia)
        const actions: Array<{
          account: string;
          name: string;
          authorization: Array<{
            actor: string;
            permission: string;
          }>;
          data: {
            author: string;
            category: string;
            owner: string;
            idata: string;
            mdata: string;
            requireclaim: boolean;
          };
        }> = [];

        for (let i = 0; i < copies; i++) {
          actions.push({
            account: CONTRACT_NAME,
            name: 'create',
            authorization: [
              {
                actor: session.auth.actor.toString(),
                permission: session.auth.permission.toString(),
              },
            ],
            data: {
              author,
              category: asset.category,
              owner: author,
              idata: JSON.stringify(asset.idata),
              mdata: JSON.stringify(asset.mdata),
              requireclaim: false,
            },
          });
        }

        console.log(`📤 Duplicando asset ${copies} veces:`, {
          name: asset.name,
          category: asset.category,
          actions: actions.length,
        });

        // Ejecutar transacción masiva
        const result = await session.transact(
          { actions },
          {
            broadcast: true,
          }
        );

        console.log('✅ Duplicación exitosa:', result);

        setLoading(false);

        const txId =
          result.transaction?.id?.toString() ||
          result.processed?.id?.toString() ||
          'unknown';

        return {
          success: true,
          transactionId: txId,
          copiesCreated: copies,
        };
      } catch (err: any) {
        console.error('❌ Error duplicando asset:', err);

        const errorMessage =
          err?.message ||
          err?.error?.details?.[0]?.message ||
          err?.toString() ||
          'Error desconocido al duplicar el asset';

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
    duplicateAsset,
    loading,
    error,
    clearError: () => setError(null),
  };
};