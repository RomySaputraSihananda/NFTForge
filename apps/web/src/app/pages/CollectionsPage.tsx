import { EthDiamond } from '../components/EthDiamond';
import { NFTCard, NFTCardSkeleton } from '../components/NFTCard';
import { NFT } from '../types/NFT';
import { useWallet } from '../web3/hooks/useWallet';

interface Props {
  nfts: NFT[];
  loading: boolean;
  onMintClick: () => void;
  onConnectClick: () => void;
  onRefresh: () => void;
}

export function CollectionsPage({ nfts, loading, onMintClick, onConnectClick, onRefresh }: Props) {
  const { account, connected } = useWallet();

  const myNFTs = connected && account
    ? nfts.filter((n) => {
        const effectiveOwner = n.listing?.active ? n.listing.seller : n.owner;
        return effectiveOwner.toLowerCase() === account.toLowerCase();
      })
    : [];

  const shortAccount = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-32 border border-white/5 bg-void-card">
        <div className="relative mb-6">
          <EthDiamond className="w-16 h-16 text-neon-cyan/20" />
          <div className="absolute inset-0 blur-lg opacity-30">
            <EthDiamond className="w-16 h-16 text-neon-cyan" />
          </div>
        </div>
        <p className="font-orbitron text-lg font-black text-white tracking-widest mb-2">
          MY COLLECTION
        </p>
        <p className="font-mono text-xs text-dim tracking-widest mb-8">
          Connect your wallet to see your NFTs
        </p>
        <button
          onClick={onConnectClick}
          className="flex items-center gap-2 bg-gradient-to-r from-neon-cyan to-neon-purple text-void font-orbitron text-[11px] font-black tracking-widest px-8 py-3 uppercase cursor-pointer transition-all hover:shadow-neon-cyan [clip-path:polygon(8px_0%,100%_0%,calc(100%-8px)_100%,0%_100%)]"
        >
          <EthDiamond className="w-4 h-4" />
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <EthDiamond className="w-5 h-5 text-neon-cyan" />
            <h1 className="font-orbitron text-xl font-black tracking-widest text-white">
              MY COLLECTION
            </h1>
          </div>
          <p className="font-mono text-xs text-dim tracking-widest pl-8">
            {shortAccount}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="border border-white/5 bg-void-card px-4 py-2 text-center">
            <p className="font-mono text-[9px] text-dim tracking-widest mb-0.5">OWNED</p>
            <p className="font-orbitron text-lg font-bold text-neon-cyan">
              {loading ? '—' : myNFTs.length}
            </p>
          </div>
          <button
            onClick={onMintClick}
            className="bg-gradient-to-r from-neon-cyan to-neon-purple text-void font-orbitron text-[11px] font-black tracking-widest py-2.5 px-5 uppercase cursor-pointer transition-all hover:shadow-neon-cyan [clip-path:polygon(6px_0%,100%_0%,calc(100%-6px)_100%,0%_100%)]"
          >
            + MINT NEW
          </button>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-neon-cyan/30 via-neon-purple/20 to-transparent mb-6" />

      {loading && myNFTs.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <NFTCardSkeleton key={i} index={i} />
          ))}
        </div>
      ) : myNFTs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-white/5 bg-void-card">
          <EthDiamond className="w-10 h-10 text-neon-cyan/20 mb-4" />
          <p className="font-orbitron text-sm text-dim tracking-widest mb-2">
            NO NFTS IN YOUR WALLET
          </p>
          <p className="font-mono text-2xs text-dim/60 mb-6">
            Mint your first NFT to start your collection
          </p>
          <button
            onClick={onMintClick}
            className="bg-gradient-to-r from-neon-cyan to-neon-purple text-void font-orbitron text-[11px] font-black tracking-widest py-3 px-8 uppercase cursor-pointer transition-all hover:shadow-neon-cyan [clip-path:polygon(6px_0%,100%_0%,calc(100%-6px)_100%,0%_100%)]"
          >
            Mint First NFT
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {myNFTs.map((nft, i) => (
            <NFTCard key={nft.id} nft={nft} index={i} onAction={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}
