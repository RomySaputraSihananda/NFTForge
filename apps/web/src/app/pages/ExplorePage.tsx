import { FeaturedHero } from '../components/FeaturedHero';
import { NetworkStatsBar } from '../components/NetworkStatsBar';
import { NFTCard, NFTCardSkeleton } from '../components/NFTCard';
import { EthDiamond } from '../components/EthDiamond';
import { NFT } from '../types/NFT';

interface Props {
  totalSupply: bigint | null;
  connected: boolean;
  onMintClick: () => void;
  nfts: NFT[];
  loading: boolean;
  onRefresh: () => void;
}

export function ExplorePage({ totalSupply, connected, onMintClick, nfts, loading, onRefresh }: Props) {
  return (
    <>
      <FeaturedHero totalSupply={totalSupply} connected={connected} onMintClick={onMintClick} />
      <NetworkStatsBar />

      <div>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
          <h2 className="font-orbitron text-lg font-bold tracking-widest text-white flex items-center gap-3">
            <EthDiamond className="w-5 h-5 text-neon-cyan" />
            Live Market
            <span className="font-mono text-[10px] text-dim tracking-widest border border-neon-cyan/20 px-2 py-0.5 bg-neon-cyan/5">
              {nfts.length} items
            </span>
            {loading && (
              <span className="font-mono text-[10px] text-neon-cyan/60 animate-pulse">syncing...</span>
            )}
          </h2>
          <button
            onClick={onRefresh}
            className="font-mono text-[10px] text-dim border border-white/10 px-3 py-1.5 hover:border-neon-cyan/40 hover:text-neon-cyan transition-colors cursor-pointer tracking-widest"
          >
            ↻ REFRESH
          </button>
        </div>

        {loading && nfts.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <NFTCardSkeleton key={i} index={i} />)}
          </div>
        ) : nfts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-white/5 bg-void-card">
            <EthDiamond className="w-12 h-12 text-neon-cyan/20 mb-4" />
            <p className="font-orbitron text-sm text-dim tracking-widest mb-2">NO NFTS MINTED YET</p>
            <p className="font-mono text-2xs text-dim/60 mb-6">Be the first to create an NFT on this contract</p>
            <button
              onClick={onMintClick}
              className="bg-gradient-to-r from-neon-cyan to-neon-purple text-void font-orbitron text-[11px] font-black tracking-widest py-3 px-8 uppercase cursor-pointer transition-all duration-200 hover:shadow-neon-cyan [clip-path:polygon(6px_0%,100%_0%,calc(100%-6px)_100%,0%_100%)]"
            >
              Create First NFT
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {nfts.map((nft, i) => <NFTCard key={nft.id} nft={nft} index={i} onAction={onRefresh} />)}
          </div>
        )}
      </div>
    </>
  );
}
