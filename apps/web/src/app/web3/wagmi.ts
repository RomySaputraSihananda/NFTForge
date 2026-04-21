import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected, metaMask, coinbaseWallet } from 'wagmi/connectors';
import { RPC_URL } from './config';

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({ appName: 'NFTFORGE' }),
  ],
  transports: {
    [sepolia.id]: http(RPC_URL),
  },
});
