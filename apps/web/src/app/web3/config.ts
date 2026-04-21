import { sepolia } from 'viem/chains';

export const SUPPORTED_CHAINS = [sepolia] as const;

export const CONTRACT_ADDRESS = (
  import.meta.env.VITE_CONTRACT_ADDRESS ?? '0x0000000000000000000000000000000000000000'
) as `0x${string}`;

export const RPC_URL =
  import.meta.env.VITE_RPC_URL ?? 'http://127.0.0.1:8545';

export const MINT_PRICE_ETH = '0.01';
export const MAX_SUPPLY = 10_000;
