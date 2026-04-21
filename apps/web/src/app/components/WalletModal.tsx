import { useWallet } from '../web3/hooks/useWallet';

interface Props {
  onClose: () => void;
}

const WALLET_ICONS: Record<string, string> = {
  MetaMask: '🦊',
  'Coinbase Wallet': '🔵',
  'Injected': '💉',
};

export function WalletModal({ onClose }: Props) {
  const { connectors, connect, connecting } = useWallet();

  const uniqueConnectors = connectors.filter(
    (c, i, arr) => arr.findIndex((x) => x.name === c.name) === i,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-void-card border border-neon-cyan/20 p-8 w-full max-w-sm relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-neon-cyan" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-neon-purple" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-orbitron text-base font-black tracking-widest text-white">
            CONNECT WALLET
          </h2>
          <button
            onClick={onClose}
            className="font-mono text-dim text-lg hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {uniqueConnectors.map((connector) => (
            <button
              key={connector.uid}
              disabled={connecting}
              onClick={() => {
                connect({ connector });
                onClose();
              }}
              className="
                flex items-center gap-4 w-full px-4 py-3.5
                border border-white/8 bg-white/[0.02]
                hover:border-neon-cyan/40 hover:bg-neon-cyan/5
                transition-all duration-200 cursor-pointer disabled:opacity-50
                group
              "
            >
              <span className="text-2xl leading-none">
                {WALLET_ICONS[connector.name] ?? '🔗'}
              </span>
              <div className="text-left">
                <p className="font-orbitron text-sm font-bold text-white group-hover:text-neon-cyan transition-colors">
                  {connector.name}
                </p>
                <p className="font-mono text-2xs text-dim tracking-wider">
                  {connector.type === 'injected' ? 'Browser Extension' : connector.type}
                </p>
              </div>
              <span className="ml-auto font-mono text-dim text-lg group-hover:text-neon-cyan transition-colors">
                →
              </span>
            </button>
          ))}
        </div>

        <p className="font-mono text-2xs text-dim/60 tracking-wider mt-5 text-center leading-relaxed">
          By connecting, you agree to our Terms of Service
          <br />and acknowledge our Privacy Policy.
        </p>
      </div>
    </div>
  );
}
