// src/hooks/useSalesProducts.ts
import { useCallback, useEffect, useState } from 'react';
import { useAnchor } from '@nice1/react-tools';

const SALE_CONTRACT = 'n1licensepos';

// ⚠️ PLACEHOLDER: Reemplazar con el nombre real de la tabla
const TABLE_PRODUCTOS_VENTA = 'products';

// ⚠️ PLACEHOLDER: Tabla para obtener int_ref de productos existentes
const TABLE_INT_REF = 'productdata';

export interface SaleProduct {
  int_ref: bigint;
  ext_inf: bigint;
  product: string;
  price: string;
  tokencontract: string;
  nftcontract: string;
  receiver1: string;
  percentr1: number;
  receiver2: string;
  percentr2: number;
  productowner: string;
  referenceNftId?: number;
  stockCount?: number; // Cantidad de NFTs en venta
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
      // Si la tabla no existe aún, no es un error crítico
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
   * Obtener int_ref de un producto por su NFT de referencia
   * Útil para reponer stock
   */
  const getIntRefByNftProduct = useCallback(
    async (product: string): Promise<number | null> => {
      if (!session) return null;

      try {
        const owner = session.auth.actor.toString();

        // ⚠️ PLACEHOLDER: Ajustar según estructura real de la tabla
        const { rows } = await session.client.v1.chain.get_table_rows({
          json: true,
          code: SALE_CONTRACT,
          table: TABLE_INT_REF,
          scope: owner,
          limit: 100,
          reverse: false,
          show_payer: false,
        });

        // Buscar el producto que tiene este NFT como referencia
        const product = rows.find((p: any) => p.product === product);
        
        return product?.int_ref || null;
      } catch (err: any) {
        console.error('❌ Error obteniendo int_ref:', err);
        return null;
      }
    },
    [session]
  );

  /**
   * Verificar si un asset ya está en venta
   */
  const isProductOnSale = useCallback(
    (assetName: string): SaleProduct | null => {
      return products.find((p) => p.product === assetName) || null;
    },
    [products]
  );

  /**
   * Obtener producto por int_ref
   */
  const getProductByIntRef = useCallback(
    (int_ref: bigint): SaleProduct | null => {
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
    getIntRefByNftProduct,
    isProductOnSale,
    getProductByIntRef,
  };
};