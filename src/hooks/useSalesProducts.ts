// src/hooks/useSalesProducts.ts
import { useCallback, useEffect, useState } from 'react';
import { useAnchor } from '@nice1/react-tools';

const SALE_CONTRACT = 'n1licensepos';
const TABLE_PRODUCTOS_VENTA = 'products';
const TABLE_INT_REF = 'productdata';

export interface SaleProduct {
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
  active?: boolean;
  referenceNftId?: number;
  stockCount?: number;
}

export const useSalesProducts = () => {
  const { session } = useAnchor();
  const [products, setProducts] = useState<SaleProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user's sale products
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
        code: SALE_CONTRACT,
        table: TABLE_PRODUCTOS_VENTA,
        scope: owner,
        limit: 100,
        reverse: false,
        show_payer: false,
      });

      console.log('📦 Sale products loaded:', rows);

      setProducts(rows as SaleProduct[]);
    } catch (err: any) {
      console.error('❌ Error loading sale products:', err);
      const errorMsg = err?.message || err?.toString() || '';
      
      // Handle common "no data" scenarios gracefully
      if (
        errorMsg.includes('table not found') ||
        errorMsg.includes('Table not found') ||
        errorMsg.includes('Account Query Exception') ||
        errorMsg.includes('does not exist') ||
        errorMsg.includes('scope not found')
      ) {
        console.log('ℹ️ No sale products found (table or scope empty)');
        setProducts([]);
        // Don't set error - this is a normal state
      } else {
        setError(err?.message || 'Error loading sale products');
      }
    } finally {
      setLoading(false);
    }
  }, [session]);

  /**
   * Get int_ref of a product by name
   */
  const getIntRefByNftProduct = useCallback(
    async (productName: string): Promise<number | null> => {
      if (!session) return null;

      try {
        const owner = session.auth.actor.toString();

        const { rows } = await session.client.v1.chain.get_table_rows({
          json: true,
          code: SALE_CONTRACT,
          table: TABLE_INT_REF,
          scope: owner,
          limit: 100,
          reverse: false,
          show_payer: false,
        });

        const found = rows.find((p: any) => p.product === productName);
        return found?.int_ref || null;
      } catch (err: any) {
        console.error('❌ Error getting int_ref:', err);
        return null;
      }
    },
    [session]
  );

  /**
   * Get product by name
   */
  const getProductByName = useCallback(
    (productName: string): SaleProduct | null => {
      return products.find((p) => p.product.toLowerCase() === productName.toLowerCase()) || null;
    },
    [products]
  );

  /**
   * Check if asset is on sale
   */
  const isProductOnSale = useCallback(
    (assetName: string): SaleProduct | null => {
      return products.find((p) => p.product === assetName) || null;
    },
    [products]
  );

  /**
   * Get product by int_ref
   */
  const getProductByIntRef = useCallback(
    (int_ref: number): SaleProduct | null => {
      return products.find((p) => p.int_ref === int_ref) || null;
    },
    [products]
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    reload: loadProducts,
    getIntRefByNftProduct,
    getProductByName,
    isProductOnSale,
    getProductByIntRef,
  };
};