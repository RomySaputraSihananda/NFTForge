import type { Abi } from 'viem';
import artifact from '@nftforge/contracts/artifacts/contracts/NFTForge.sol/NFTForge.json';

export const NFTFORGE_ABI = artifact.abi as Abi;
