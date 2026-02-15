// src/hooks/useStore.ts
// MIGRADO: localStorage → Supabase
import { useState, useEffect, useCallback } from 'react';
import { useSalesProducts, SaleProduct } from './useSalesProducts';
import { supabase, GameMetadataRow } from '../lib/supabase';

export interface GameMetadata {
  shortDescription: string;
  longDescription: string;
  previews: string[];
  videoUrl?: string;
  coverImage?: string;
}

export interface StoreItem extends SaleProduct {
  metadata: GameMetadata;
  displayImage: string;
}

// Convertir fila de Supabase → GameMetadata del frontend
const rowToMetadata = (row: GameMetadataRow): GameMetadata => ({
  shortDescription: row.short_description,
  longDescription: row.long_description,
  previews: row.previews || [],
  videoUrl: row.video_url || '',
  coverImage: row.cover_image || '',
});

// Metadata por defecto cuando no existe en Supabase
const DEFAULT_METADATA: GameMetadata = {
  shortDescription: 'Sin descripción corta disponible.',
  longDescription: 'Este juego aún no tiene una descripción extendida.',
  previews: [],
  videoUrl: '',
  coverImage: '',
};

export const useStore = () => {
  const { products, loading: salesLoading, error, reload } = useSalesProducts();
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [metadataDb, setMetadataDb] = useState<Record<string, GameMetadata>>({});
  const [metadataLoading, setMetadataLoading] = useState(false);

  // Cargar TODOS los metadatos desde Supabase
  const loadMetadata = useCallback(async () => {
    setMetadataLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from('game_metadata')
        .select('*');

      if (dbError) {
        console.error('❌ Error cargando metadatos:', dbError);
        return;
      }

      if (data) {
        const db: Record<string, GameMetadata> = {};
        (data as GameMetadataRow[]).forEach((row) => {
          db[row.product_name] = rowToMetadata(row);
        });
        setMetadataDb(db);
      }
    } catch (err) {
      console.error('❌ Error inesperado cargando metadatos:', err);
    } finally {
      setMetadataLoading(false);
    }
  }, []);

  // Cargar metadatos al montar
  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);

  // Mezclar productos de blockchain con metadatos de Supabase
  useEffect(() => {
    if (products) {
      const merged = products.map((p) => {
        const metadata = metadataDb[p.product] || DEFAULT_METADATA;
        return {
          ...p,
          metadata,
          displayImage: metadata.coverImage || '',
        };
      });
      setStoreItems(merged);
    }
  }, [products, metadataDb]);

  // Guardar/actualizar metadatos en Supabase (upsert)
  const updateGameMetadata = useCallback(
    async (productName: string, ownerAccount: string, data: GameMetadata) => {
      try {
        const { error: dbError } = await supabase
          .from('game_metadata')
          .upsert(
            {
              product_name: productName,
              owner_account: ownerAccount,
              short_description: data.shortDescription,
              long_description: data.longDescription,
              cover_image: data.coverImage || '',
              video_url: data.videoUrl || '',
              previews: data.previews || [],
            },
            { onConflict: 'product_name,owner_account' }
          );

        if (dbError) {
          console.error('❌ Error guardando metadatos:', dbError);
          return false;
        }

        // Actualizar estado local sin recargar todo
        setMetadataDb((prev) => ({
          ...prev,
          [productName]: data,
        }));

        console.log('✅ Metadatos guardados en Supabase:', productName);
        return true;
      } catch (err) {
        console.error('❌ Error inesperado guardando metadatos:', err);
        return false;
      }
    },
    []
  );

  // Subir imagen a Supabase Storage
  const uploadImage = useCallback(
    async (file: File, productName: string): Promise<string | null> => {
      const fileExt = file.name.split('.').pop();
      const filePath = `${productName}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('game-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('❌ Error subiendo imagen:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('game-assets')
        .getPublicUrl(filePath);

      return data.publicUrl;
    },
    []
  );

  return {
    storeItems,
    loading: salesLoading || metadataLoading,
    error,
    updateGameMetadata,
    uploadImage,
    refresh: async () => {
      reload();
      await loadMetadata();
    },
  };
};