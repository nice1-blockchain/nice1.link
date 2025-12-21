// src/hooks/useStock.ts
import { useCallback, useEffect, useState } from 'react';
import { useAnchor } from '@nice1/react-tools';

const CONTRACT_NAME = 'nice2simplea'; // Cambiar por el nombre real del contrato

export interface RawAsset {
  id: number;
  owner: string;
  author: string;
  category: string;
  idata: string; // JSON string
  mdata: string; // JSON string
}

export interface ParsedAssetData {
  name: string;
  [key: string]: any;
}

export interface GroupedAsset {
  name: string;
  category: string;
  image: string;
  copyCount: number;
  ids: number[];
  idata: ParsedAssetData;
  mdata: ParsedAssetData;
  author: string;
}

export const useStock = () => {
  const { session } = useAnchor();
  const [rawAssets, setRawAssets] = useState<RawAsset[]>([]);
  const [groupedAssets, setGroupedAssets] = useState<GroupedAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Parsear JSON de forma segura
   */
  const parseJSON = (jsonString: string): any => {
    try {
      return JSON.parse(jsonString);
    } catch {
      return {};
    }
  };

  /**
   * Extraer imagen de idata o mdata
   */
  const extractImage = (idata: any, mdata: any): string => {
    const imgFromMdata = mdata?.img;
    const imgFromIdata = idata?.img;

    const img = imgFromMdata || imgFromIdata || '';

    // Si es IPFS sin protocolo, añadir ipfs://
    if (img && !img.startsWith('http') && !img.startsWith('ipfs://')) {
      return `ipfs://${img}`;
    }

    return img;
  };

  /**
   * Agrupar assets por nombre
   */
  const groupAssets = useCallback((assets: RawAsset[]): GroupedAsset[] => {
    const grouped = new Map<string, GroupedAsset>();

    assets.forEach((asset) => {
      const idata = parseJSON(asset.idata);
      const mdata = parseJSON(asset.mdata);
      const name = idata.name || 'Sin nombre';
      const category = asset.category;

      const key = `${name}-${category}`; // Agrupar por nombre + categoría

      if (grouped.has(key)) {
        const existing = grouped.get(key)!;
        existing.copyCount++;
        existing.ids.push(asset.id);
      } else {
        grouped.set(key, {
          name,
          category,
          image: extractImage(idata, mdata),
          copyCount: 1,
          ids: [asset.id],
          idata,
          mdata,
          author: asset.author,
        });
      }
    });

    return Array.from(grouped.values());
  }, []);

  /**
   * Cargar assets desde blockchain
   */
  const loadAssets = useCallback(async () => {
    if (!session) {
      setRawAssets([]);
      setGroupedAssets([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { rows } = await session.client.v1.chain.get_table_rows({
        json: true,
        code: CONTRACT_NAME,
        table: 'sassets',
        scope: session.auth.actor.toString(),
        limit: 1000,
        reverse: false,
        show_payer: false,
      });

      setRawAssets(rows as RawAsset[]);
      const grouped = groupAssets(rows as RawAsset[]);
      setGroupedAssets(grouped);
    } catch (err: any) {
        console.error('Error cargando assets:', err);
        setError(err?.message || 'Error desconocido al cargar assets');
    } finally {
        setLoading(false);
    }
  }, [session, groupAssets]);

  /**
   * Cargar assets al montar o cuando cambie la sesión
   */
  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  /**
   * Filtrar por categoría
   */
  const filterByCategory = useCallback(
    (category: string | null): GroupedAsset[] => {
      if (!category) return groupedAssets;
      return groupedAssets.filter((asset) => asset.category === category);
    },
    [groupedAssets]
  );

  return {
    rawAssets,
    groupedAssets,
    loading,
    error,
    reload: loadAssets,
    filterByCategory,
  };
};