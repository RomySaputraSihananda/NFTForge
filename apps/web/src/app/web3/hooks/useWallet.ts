import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from 'wagmi';
import { sepolia } from 'wagmi/chains';

export function useWallet() {
  const { address, isConnected, isConnecting, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  const isWrongNetwork = isConnected && chainId !== sepolia.id;

  const switchToSepolia = () => switchChain({ chainId: sepolia.id });

  return {
    account: address,
    connected: isConnected,
    connecting: isConnecting || isPending,
    connectors,
    connect,
    disconnect,
    connectorName: connector?.name,
    isWrongNetwork,
    switchToSepolia,
  };
}
