// src/hooks/useRentalProducts.ts
import { useCallback, useEffect, useState } from 'react';
import { useAnchor } from '@nice1/react-tools';

const RENTAL_CONTRACT = 'n1liceseren';
const TABLE_PRODUCTOS_ALQUILER = 'products';
const TABLE_INT_REF = 'productdata';

export interface RentalProduct {
  int_ref: number;
  ext_ref: number;
  product: string;
  price: string;
  tokencontract: string;
  nftcontract: string;
  receiver1: string;
  percentr1: number;
  receiver2: string;
  percentr2: number;
  productowner: string;
  period: number;
  redelegate: boolean;
  referenceNftId?: number;
  stockCount?: number;
}

export const useRentalProducts = () => {
  const { session } = useAnchor();
  const [products, setProducts] = useState<RentalProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar productos en alquiler del usuario
   */
  const loadProducts = useCallback(async () => {
    if (!session) {
      setProducts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const owner = session.auth.actor.toString();

      const { rows } = await session.client.v1.chain.get_table_rows({
        json: true,
        code: RENTAL_CONTRACT,
        table: TABLE_PRODUCTOS_ALQUILER,
        scope: owner,
        limit: 100,
        reverse: false,
        show_payer: false,
      });

      console.log('📦 Productos en alquiler cargados:', rows);

      setProducts(rows as RentalProduct[]);
    } catch (err: any) {
      console.error('❌ Error cargando productos en alquiler:', err);
      if (err?.message?.includes('table not found') || err?.message?.includes('Table not found')) {
        console.log('ℹ️ Tabla de productos de alquiler no encontrada');
        setProducts([]);
      } else {
        setError(err?.message || 'Error al cargar productos en alquiler');
      }
    } finally {
      setLoading(false);
    }
  }, [session]);

  /**
   * Obtener int_ref de un producto por nombre
   */
  const getIntRefByProduct = useCallback(
    async (product: string): Promise<number | null> => {
      if (!session) return null;

      try {
        const owner = session.auth.actor.toString();

        const { rows } = await session.client.v1.chain.get_table_rows({
          json: true,
          code: RENTAL_CONTRACT,
          table: TABLE_INT_REF,
          scope: owner,
          limit: 100,
          reverse: false,
          show_payer: false,
        });

        const found = rows.find((r: any) => r.product === product.toLowerCase());
        return found?.int_ref || null;
      } catch (err) {
        console.error('Error obteniendo int_ref:', err);
        return null;
      }
    },
    [session]
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    reload: loadProducts,
    getIntRefByProduct,
  };
};