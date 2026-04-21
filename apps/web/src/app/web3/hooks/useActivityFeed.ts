import { usePublicClient } from 'wagmi';
import { useEffect, useState } from 'react';
import { parseAbiItem } from 'viem';
import { CONTRACT_ADDRESS } from '../config';

export interface ActivityItem {
  tokenId: number;
  from: string;
  to: string;
  txHash: string;
  blockNumber: number;
  type: 'mint' | 'transfer';
}

export function useActivityFeed() {
  const client = usePublicClient();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    if (!client) return;
    setLoading(true);
    try {
      const logs = await client.getLogs({
        address: CONTRACT_ADDRESS,
        event: parseAbiItem(
          'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
        ),
        fromBlock: 0n,
        toBlock: 'latest',
      });

      const items: ActivityItem[] = logs
        .map((log) => ({
          tokenId: Number(log.args.tokenId ?? 0),
          from: log.args.from as string,
          to: log.args.to as string,
          txHash: log.transactionHash ?? '',
          blockNumber: Number(log.blockNumber ?? 0),
          type: (log.args.from === '0x0000000000000000000000000000000000000000'
            ? 'mint'
            : 'transfer') as 'mint' | 'transfer',
        }))
        .reverse();

      setActivities(items);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [client]);

  return { activities, loading, refetch: fetchLogs };
}
