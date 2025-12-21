// src/hooks/useBurn.ts
import { useCallback, useState } from 'react';
import { useAnchor } from '@nice1/react-tools';

const CONTRACT_NAME = 'nice2simplea';

export interface BurnResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export const useBurn = () => {
  const { session } = useAnchor();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const burnAsset = useCallback(
    async (assetIds: number[]): Promise<BurnResult> => {
      if (!session) {
        const errMsg = 'No hay sesión activa. Por favor, conecta tu wallet.';
        setError(errMsg);
        return { success: false, error: errMsg };
      }

      setLoading(true);
      setError(null);

      try {
        const owner = session.auth.actor.toString();

        const action = {
          account: CONTRACT_NAME,
          name: 'burn',
          authorization: [
            {
              actor: owner,
              permission: session.auth.permission.toString(),
            },
          ],
          data: {
            owner,
            assetids: assetIds,
          },
        };

        const result = await session.transact(
          { actions: [action] },
          { broadcast: true }
        );

        setLoading(false);
        const txId = result.transaction?.id?.toString() || 
                     result.processed?.id?.toString() || 'unknown';

        return { success: true, transactionId: txId };
      } catch (err: any) {
        const errorMessage = err?.message || err?.toString() || 'Error al quemar el asset';
        setError(errorMessage);
        setLoading(false);
        return { success: false, error: errorMessage };
      }
    },
    [session]
  );

  return { burnAsset, loading, error, clearError: () => setError(null) };
};