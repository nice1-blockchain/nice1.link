// src/hooks/useDemoProducts.ts
import { useCallback, useEffect, useState } from 'react';
import { useAnchor } from '@nice1/react-tools';

const DEMO_CONTRACT = 'n1licensedem';
const TABLE_PRODUCTOS_DEMO = 'products';
const TABLE_INT_REF = 'productdata';

export interface DemoProduct {
  int_ref: number;
  ext_ref: number;
  product: string;
  nftcontract: string;
  productowner: string;
  period: number;
  referenceNftId?: number;
  stockCount?: number;
}

export const useDemoProducts = () => {
  const { session } = useAnchor();
  const [products, setProducts] = useState<DemoProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user's demo products
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
        code: DEMO_CONTRACT,
        table: TABLE_PRODUCTOS_DEMO,
        scope: owner,
        limit: 100,
        reverse: false,
        show_payer: false,
      });

      console.log('📦 Demo products loaded:', rows);

      setProducts(rows as DemoProduct[]);
    } catch (err: any) {
      console.error('❌ Error loading demo products:', err);
      const errorMsg = err?.message || err?.toString() || '';

      // Handle common "no data" scenarios gracefully
      if (
        errorMsg.includes('table not found') ||
        errorMsg.includes('Table not found') ||
        errorMsg.includes('Account Query Exception') ||
        errorMsg.includes('does not exist') ||
        errorMsg.includes('scope not found')
      ) {
        console.log('ℹ️ No demo products found (table or scope empty)');
        setProducts([]);
      } else {
        setError(err?.message || 'Error loading demo products');
      }
    } finally {
      setLoading(false);
    }
  }, [session]);

  /**
   * Get int_ref of a product by name
   */
  const getIntRefByProduct = useCallback(
    async (product: string): Promise<number | null> => {
      if (!session) return null;

      try {
        const owner = session.auth.actor.toString();

        const { rows } = await session.client.v1.chain.get_table_rows({
          json: true,
          code: DEMO_CONTRACT,
          table: TABLE_INT_REF,
          scope: owner,
          limit: 100,
          reverse: false,
          show_payer: false,
        });

        const found = rows.find((r: any) => r.product === product.toLowerCase());
        return found?.int_ref || null;
      } catch (err) {
        console.error('Error getting int_ref:', err);
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