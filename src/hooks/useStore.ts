// src/hooks/useStore.ts
import { useState, useEffect, useCallback } from 'react';
import { useSalesProducts, SaleProduct } from './useSalesProducts';

export interface GameMetadata {
  shortDescription: string;
  longDescription: string;
  previews: string[];
  videoUrl?: string;
  coverImage?: string;
}

export interface StoreItem extends SaleProduct {
  metadata: GameMetadata;
  displayImage: string; // Imagen normalizada para la UI
}

const STORAGE_KEY = 'n1_store_metadata_db';

export const useStore = () => {
  const { products, loading: salesLoading, error, reload } = useSalesProducts();
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [localDb, setLocalDb] = useState<Record<string, GameMetadata>>({});

  // Cargar base de datos local desde localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setLocalDb(JSON.parse(saved));
      } catch (e) {
        console.error("Error cargando STORE_DB:", e);
      }
    }
  }, []);

  // Mezclar productos de la blockchain con metadatos locales
  useEffect(() => {
    if (products) {
      const merged = products.map((p) => {
        const metadata = localDb[p.product] || {
          shortDescription: "Sin descripción corta disponible.",
          longDescription: "Este juego aún no tiene una descripción extendida.",
          previews: [],
          videoUrl: "",
          coverImage: ""
        };

        return {
          ...p,
          metadata,
          // La imagen principal será la de portada del store, o un placeholder
          displayImage: metadata.coverImage || "" 
        };
      });
      setStoreItems(merged);
    }
  }, [products, localDb]);

  const updateGameMetadata = useCallback((productName: string, data: GameMetadata) => {
    setLocalDb((prev) => {
      const newState = { ...prev, [productName]: data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  return {
    storeItems,
    loading: salesLoading,
    error,
    updateGameMetadata,
    refresh: reload
  };
};