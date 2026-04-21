import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState } from 'react';
import { parseEther } from 'viem';
import { NFTFORGE_ABI } from '../abi';
import { CONTRACT_ADDRESS } from '../config';

export function useMarketplace() {
  const [pendingHash, setPendingHash] = useState<`0x${string}` | undefined>();

  const { writeContractAsync, isPending, error, reset } = useWriteContract();
  const { isLoading: waitingTx, isSuccess } = useWaitForTransactionReceipt({ hash: pendingHash });

  const listForSale = async (tokenId: number, priceEth: string) => {
    reset();
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: NFTFORGE_ABI,
      functionName: 'listForSale',
      args: [BigInt(tokenId), parseEther(priceEth)],
    });
    setPendingHash(hash);
    return hash;
  };

  const buyNFT = async (tokenId: number, price: bigint) => {
    reset();
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: NFTFORGE_ABI,
      functionName: 'buyNFT',
      args: [BigInt(tokenId)],
      value: price,
    });
    setPendingHash(hash);
    return hash;
  };

  const updateListing = async (tokenId: number, newPriceEth: string) => {
    reset();
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: NFTFORGE_ABI,
      functionName: 'updateListing',
      args: [BigInt(tokenId), parseEther(newPriceEth)],
    });
    setPendingHash(hash);
    return hash;
  };

  const cancelListing = async (tokenId: number) => {
    reset();
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: NFTFORGE_ABI,
      functionName: 'cancelListing',
      args: [BigInt(tokenId)],
    });
    setPendingHash(hash);
    return hash;
  };

  const burn = async (tokenId: number) => {
    reset();
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: NFTFORGE_ABI,
      functionName: 'burn',
      args: [BigInt(tokenId)],
    });
    setPendingHash(hash);
    return hash;
  };

  return {
    listForSale,
    updateListing,
    buyNFT,
    cancelListing,
    burn,
    pending: isPending || waitingTx,
    isSuccess,
    error: error?.message ?? null,
    reset,
  };
}
