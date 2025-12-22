// src/hooks/useModifyBatch.ts
import { useCallback, useState } from 'react';
import { useAnchor } from '@nice1/react-tools';

const CONTRACT_NAME = 'nice2simplea';
const BATCH_SIZE = 50; // Máximo 50 acciones por transacción

export interface ModifyBatchProgress {
  totalActions: number;
  completedActions: number;
  currentBatch: number;
  totalBatches: number;
  status: 'idle' | 'processing' | 'awaiting_signature' | 'completed' | 'error';
  error?: string;
}

export interface ModifyBatchResult {
  success: boolean;
  transactionIds: string[];
  totalModified: number;
  error?: string;
}

export const useModifyBatch = () => {
  const { session } = useAnchor();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ModifyBatchProgress>({
    totalActions: 0,
    completedActions: 0,
    currentBatch: 0,
    totalBatches: 0,
    status: 'idle',
  });

  /**
   * Modificar múltiples assets en lotes de 50
   * Cada lote requiere una firma del usuario
   */
  const modifyBatch = useCallback(
    async (
      assetIds: number[],
      mdata: Record<string, any>
    ): Promise<ModifyBatchResult> => {
      if (!session) {
        return {
          success: false,
          transactionIds: [],
          totalModified: 0,
          error: 'No hay sesión activa. Por favor, conecta tu wallet.',
        };
      }

      const totalActions = assetIds.length;
      const totalBatches = Math.ceil(totalActions / BATCH_SIZE);

      setLoading(true);
      setProgress({
        totalActions,
        completedActions: 0,
        currentBatch: 0,
        totalBatches,
        status: 'processing',
      });

      const transactionIds: string[] = [];
      let completedActions = 0;

      try {
        const author = session.auth.actor.toString();
        const owner = session.auth.actor.toString();
        const mdataString = JSON.stringify(mdata);

        // Dividir en lotes de 50
        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
          const start = batchIndex * BATCH_SIZE;
          const end = Math.min(start + BATCH_SIZE, totalActions);
          const batchIds = assetIds.slice(start, end);

          // Actualizar estado: esperando firma
          setProgress((prev) => ({
            ...prev,
            currentBatch: batchIndex + 1,
            status: 'awaiting_signature',
          }));

          console.log(
            `📤 Lote ${batchIndex + 1}/${totalBatches}: Modificando ${batchIds.length} assets...`
          );

          // Construir acciones para este lote
          const actions = batchIds.map((assetId) => ({
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
              assetid: assetId,
              mdata: mdataString,
            },
          }));

          // Ejecutar transacción (requiere firma del usuario)
          const result = await session.transact(
            { actions },
            { broadcast: true }
          );

          const txId =
            result.transaction?.id?.toString() ||
            result.processed?.id?.toString() ||
            `batch-${batchIndex + 1}`;

          transactionIds.push(txId);
          completedActions += batchIds.length;

          console.log(`✅ Lote ${batchIndex + 1} completado. TX: ${txId}`);

          // Actualizar progreso
          setProgress((prev) => ({
            ...prev,
            completedActions,
            status: 'processing',
          }));
        }

        setProgress((prev) => ({
          ...prev,
          status: 'completed',
        }));

        setLoading(false);

        return {
          success: true,
          transactionIds,
          totalModified: completedActions,
        };
      } catch (err: any) {
        console.error('❌ Error en modificación por lotes:', err);

        const errorMessage =
          err?.message ||
          err?.error?.details?.[0]?.message ||
          err?.toString() ||
          'Error desconocido al modificar los assets';

        setProgress((prev) => ({
          ...prev,
          status: 'error',
          error: errorMessage,
        }));

        setLoading(false);

        return {
          success: false,
          transactionIds,
          totalModified: completedActions,
          error: errorMessage,
        };
      }
    },
    [session]
  );

  const resetProgress = useCallback(() => {
    setProgress({
      totalActions: 0,
      completedActions: 0,
      currentBatch: 0,
      totalBatches: 0,
      status: 'idle',
    });
  }, []);

  return {
    modifyBatch,
    loading,
    progress,
    resetProgress,
    BATCH_SIZE,
  };
};