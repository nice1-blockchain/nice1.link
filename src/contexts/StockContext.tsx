// src/contexts/StockContext.tsx
import React, { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react';
import { useAnchor } from '@nice1/react-tools';

const CONTRACT_NAME = 'nice2simplea';

export interface RawAsset {
  id: number;
  owner: string;
  author: string;
  category: string;
  idata: string;
  mdata: string;
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

interface StockContextType {
  rawAssets: RawAsset[];
  groupedAssets: GroupedAsset[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  filterByCategory: (category: string | null) => GroupedAsset[];
}

const StockContext = createContext<StockContextType | null>(null);

export const useStockContext = (): StockContextType => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStockContext debe usarse dentro de un StockProvider');
  }
  return context;
};

interface StockProviderProps {
  children: ReactNode;
}

export const StockProvider: React.FC<StockProviderProps> = ({ children }) => {
  const { session } = useAnchor();
  const [rawAssets, setRawAssets] = useState<RawAsset[]>([]);
  const [groupedAssets, setGroupedAssets] = useState<GroupedAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseJSON = (jsonString: string): any => {
    try {
      return JSON.parse(jsonString);
    } catch {
      return {};
    }
  };

  const extractImage = (idata: any, mdata: any): string => {
    const imgFromMdata = mdata?.img;
    const imgFromIdata = idata?.img;
    const img = imgFromMdata || imgFromIdata || '';

    if (img && !img.startsWith('http') && !img.startsWith('ipfs://')) {
      return `ipfs://${img}`;
    }
    return img;
  };

  const groupAssets = useCallback((assets: RawAsset[]): GroupedAsset[] => {
    const grouped = new Map<string, GroupedAsset>();

    assets.forEach((asset) => {
      const idata = parseJSON(asset.idata);
      const mdata = parseJSON(asset.mdata);
      const name = idata.name || 'Sin nombre';
      const category = asset.category;
      const key = `${name}-${category}`;

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

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const filterByCategory = useCallback(
    (category: string | null): GroupedAsset[] => {
      if (!category) return groupedAssets;
      return groupedAssets.filter((asset) => asset.category === category);
    },
    [groupedAssets]
  );

  const value: StockContextType = {
    rawAssets,
    groupedAssets,
    loading,
    error,
    reload: loadAssets,
    filterByCategory,
  };

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
};