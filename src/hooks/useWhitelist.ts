// src/hooks/useWhitelist.ts
import { useEffect, useState } from 'react';
import { useAnchor } from '@nice1/react-tools';

const WHITELIST_CONTRACT = 'n2gamedevwhl';
const WHITELIST_TABLE = 'gamedevwl';

export const useWhitelist = () => {
  const { session } = useAnchor();
  const [isWhitelisted, setIsWhitelisted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkWhitelist = async () => {
      if (!session) {
        setIsWhitelisted(false);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const currentAccount = session.auth.actor; // Keep as Name type

        // anchor-link: get_table_rows
        const { rows } = await session.client.v1.chain.get_table_rows({
            json: true,
            code: WHITELIST_CONTRACT,
            table: WHITELIST_TABLE,
            scope: WHITELIST_CONTRACT,
            lower_bound: currentAccount,
            upper_bound: currentAccount,
            limit: 1,
        });
        console.log("🔍 Respuesta cruda de la rows:", rows);

        const found = rows.some((row: any) => row.account === currentAccount.toString());
        console.log(`🔐 Whitelist [${currentAccount}]:`, found ? '✅' : '❌');
        setIsWhitelisted(found);
      } catch (err) {
        console.error('❌ Whitelist error:', err);
        setIsWhitelisted(false);
      } finally {
        setLoading(false);
      }
    };

    checkWhitelist();
  }, [session]);

  return { isWhitelisted, loading };
};