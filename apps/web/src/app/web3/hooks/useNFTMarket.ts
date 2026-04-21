import { useReadContracts, useReadContract } from 'wagmi';
import { useEffect, useMemo, useRef, useState } from 'react';
import { NFTFORGE_ABI } from '../abi';
import { CONTRACT_ADDRESS } from '../config';
import { NFT, NFTListing, NFTMetadata } from '../../types/NFT';

export function ipfsToHttp(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  }
  return uri;
}

const metaCache = new Map<string, NFTMetadata | null>();

export function useNFTMarket() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [metaLoading, setMetaLoading] = useState(false);

  const { data: totalSupply, refetch: refetchSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFTFORGE_ABI,
    functionName: 'totalSupply',
    query: { refetchInterval: 12_000 },
  });

  const count = totalSupply ? Number(totalSupply as bigint) : 0;

  const contracts = useMemo(() =>
    Array.from({ length: count }, (_, i) => [
      {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: NFTFORGE_ABI,
        functionName: 'tokenURI' as const,
        args: [BigInt(i + 1)] as [bigint],
      },
      {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: NFTFORGE_ABI,
        functionName: 'ownerOf' as const,
        args: [BigInt(i + 1)] as [bigint],
      },
      {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: NFTFORGE_ABI,
        functionName: 'listings' as const,
        args: [BigInt(i + 1)] as [bigint],
      },
    ]).flat(),
    [count]
  );

  const { data: contractData, refetch: refetchContracts } = useReadContracts({
    contracts,
    query: { enabled: count > 0, refetchInterval: 12_000 },
  });

  const baseNFTs = useMemo(() => {
    if (!contractData || contractData.length === 0) return [];

    const result: Array<{ id: number; tokenURI: string; owner: string; listing?: NFTListing }> = [];
    for (let i = 0; i < count; i++) {
      const uriRes   = contractData[i * 3];
      const ownerRes = contractData[i * 3 + 1];
      const listRes  = contractData[i * 3 + 2];

      if (uriRes?.status === 'success' && ownerRes?.status === 'success') {
        let listing: NFTListing | undefined;
        if (listRes?.status === 'success' && listRes.result) {
          const [seller, price, active] = listRes.result as [string, bigint, boolean];
          if (active) listing = { seller, price, active };
        }
        result.push({
          id: i + 1,
          tokenURI: uriRes.result as string,
          owner: ownerRes.result as string,
          listing,
        });
      }
    }
    return result;
  }, [contractData, count]);

  const fetchingRef = useRef(false);
  useEffect(() => {
    if (baseNFTs.length === 0) {
      setNfts([]);
      return;
    }

    const uncached = baseNFTs.filter((n) => !metaCache.has(n.tokenURI));

    const buildNFTs = () =>
      baseNFTs.map((n) => ({
        ...n,
        metadata: metaCache.has(n.tokenURI) ? metaCache.get(n.tokenURI)! : null,
      }));

    if (uncached.length === 0) {
      setNfts(buildNFTs());
      return;
    }

    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setMetaLoading(true);

    Promise.all(
      uncached.map(async (n) => {
        try {
          const res = await fetch(ipfsToHttp(n.tokenURI));
          if (!res.ok) throw new Error('fetch failed');
          const metadata: NFTMetadata = await res.json();
          metaCache.set(n.tokenURI, metadata);
        } catch {
          metaCache.set(n.tokenURI, null);
        }
      })
    ).then(() => {
      setNfts(buildNFTs());
      setMetaLoading(false);
      fetchingRef.current = false;
    });
  }, [baseNFTs]);

  const refetch = async () => {
    await refetchSupply();
    await refetchContracts();
  };

  return {
    nfts,
    loading: metaLoading,
    totalSupply: totalSupply ?? null,
    refetch,
  };
}
