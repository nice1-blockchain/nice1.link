// src/hooks/useSalesProducts.ts
import { useCallback, useEffect, useState } from 'react';
import { useAnchor } from '@nice1/react-tools';

const SALE_CONTRACT = 'n1licensepos';

// ⚠️ PLACEHOLDER: Reemplazar con el nombre real de la tabla si es diferente
const TABLE_PRODUCTOS_VENTA = 'products';

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
   * Cargar productos en venta del usuario
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

      // Consultar tabla de productos (scope = productowner)
      const { rows } = await session.client.v1.chain.get_table_rows({
        json: true,
        code: SALE_CONTRACT,
        table: TABLE_PRODUCTOS_VENTA,
        scope: owner,
        limit: 100,
        reverse: false,
        show_payer: false,
      });

      console.log('📦 Productos en venta cargados:', rows);

      setProducts(rows as SaleProduct[]);
    } catch (err: any) {
      console.error('❌ Error cargando productos en venta:', err);
      if (err?.message?.includes('table not found') || err?.message?.includes('Table not found')) {
        console.log('ℹ️ Tabla de productos no encontrada (puede que no exista aún)');
        setProducts([]);
      } else {
        setError(err?.message || 'Error al cargar productos en venta');
      }
    } finally {
      setLoading(false);
    }
  }, [session]);

  /**
   * Verificar si un producto ya está en venta por su nombre
   * Retorna el producto si existe, null si no
   */
  const getProductByName = useCallback(
    (productName: string): SaleProduct | null => {
      return products.find((p) => p.product.toLowerCase() === productName.toLowerCase()) || null;
    },
    [products]
  );

  /**
   * Verificar si un asset (por nombre) ya está en venta
   */
  const isProductOnSale = useCallback(
    (assetName: string): boolean => {
      return products.some((p) => p.product.toLowerCase() === assetName.toLowerCase());
    },
    [products]
  );

  /**
   * Obtener producto por int_ref
   */
  const getProductByIntRef = useCallback(
    (int_ref: number): SaleProduct | null => {
      return products.find((p) => p.int_ref === int_ref) || null;
    },
    [products]
  );

  // Cargar al montar y cuando cambia la sesión
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    reload: loadProducts,
    getProductByName,
    isProductOnSale,
    getProductByIntRef,
  };
};