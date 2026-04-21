import { useGasPrice, useBlockNumber } from 'wagmi';
import { useEffect, useState } from 'react';
import { formatGwei } from 'viem';

interface EthPrice {
  usd: number;
  change24h: number;
}

export function useGasData() {
  const { data: gasPrice } = useGasPrice({ query: { refetchInterval: 15_000 } });
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const [ethPrice, setEthPrice] = useState<EthPrice | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          'https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT'
        );
        const data = await res.json();
        setEthPrice({
          usd: parseFloat(data.lastPrice),
          change24h: parseFloat(data.priceChangePercent),
        });
      } catch {
      }
    };
    fetchPrice();
    const t = setInterval(fetchPrice, 60_000);
    return () => clearInterval(t);
  }, []);

  const gweiBase = gasPrice ? Math.round(Number(formatGwei(gasPrice))) : null;

  return {
    blockNumber: blockNumber ? Number(blockNumber) : null,
    gasTiers: gweiBase
      ? {
          slow: Math.max(1, Math.round(gweiBase * 0.8)),
          normal: gweiBase,
          fast: Math.round(gweiBase * 1.5),
          turbo: Math.round(gweiBase * 2),
        }
      : null,
    ethPrice: ethPrice?.usd ?? null,
    ethChange: ethPrice?.change24h ?? null,
  };
}
