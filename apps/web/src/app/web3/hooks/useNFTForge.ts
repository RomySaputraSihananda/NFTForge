import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useState } from 'react';
import { NFTFORGE_ABI } from '../abi';
import { CONTRACT_ADDRESS } from '../config';

export function useNFTForge() {
  const [pendingHash, setPendingHash] = useState<`0x${string}` | undefined>();
  const { address } = useAccount();

  const { data: totalSupply, refetch: refetchSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFTFORGE_ABI,
    functionName: 'totalSupply',
    query: { refetchInterval: 12_000 },
  });

  const { data: mintPrice } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFTFORGE_ABI,
    functionName: 'MINT_PRICE',
  });

  const {
    writeContractAsync,
    isPending: minting,
    error: mintError,
    reset,
  } = useWriteContract();

  const { isLoading: waitingTx, isSuccess: mintSuccess } =
    useWaitForTransactionReceipt({ hash: pendingHash });

  const { data: userBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFTFORGE_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address), refetchInterval: 12_000 },
  });

  const mint = async (tokenURI: string) => {
    reset();
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: NFTFORGE_ABI,
      functionName: 'mint',
      args: [tokenURI],
      value: mintPrice as bigint,
    });
    setPendingHash(hash);
    return hash;
  };

  return {
    totalSupply: (totalSupply as bigint | undefined) ?? null,
    userBalance: (userBalance as bigint | undefined) ?? null,
    mintPrice: (mintPrice as bigint | undefined) ?? null,
    mint,
    minting: minting || waitingTx,
    mintSuccess,
    mintError: mintError?.message ?? null,
    refetchSupply,
  };
}
