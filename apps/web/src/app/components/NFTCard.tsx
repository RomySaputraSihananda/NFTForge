import { useState } from 'react';
import { NFT } from '../types/NFT';
import { EthDiamond } from './EthDiamond';
import { ipfsToHttp } from '../web3/hooks/useNFTMarket';
import { formatEther } from 'viem';
import { useReadContract } from 'wagmi';
import { NFTFORGE_ABI } from '../web3/abi';
import { CONTRACT_ADDRESS } from '../web3/config';
import { NFTDetailModal } from './NFTDetailModal';
import { useWishlist } from '../hooks/useWishlist';

function useMintPrice() {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFTFORGE_ABI,
    functionName: 'MINT_PRICE',
  });
  return data ? formatEther(data as bigint) : null;
}

const rarityStyle: Record<string, string> = {
  legendary: 'text-amber-400 bg-amber-400/10 border-amber-400/40',
  epic:      'text-neon-purple bg-neon-purple/10 border-neon-purple/40',
  rare:      'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/40',
  uncommon:  'text-emerald-400 bg-emerald-400/10 border-emerald-400/40',
  common:    'text-slate-400 bg-slate-400/10 border-slate-400/40',
};

interface NFTCardProps {
  nft: NFT;
  index: number;
  onAction?: () => void;
}

export function NFTCard({ nft, index, onAction }: NFTCardProps) {
  const [hovered, setHovered] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const mintPrice = useMintPrice();
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(nft.id);

  const rarity = nft.metadata?.attributes?.find(
    (a) => a.trait_type.toLowerCase() === 'rarity'
  );
  const rarityTier = rarity?.value.toLowerCase() ?? 'common';
  const rs = rarityStyle[rarityTier] ?? rarityStyle.common;
  const imageUrl = nft.metadata?.image ? ipfsToHttp(nft.metadata.image) : null;
  const isListed = nft.listing?.active ?? false;
  const effectiveOwner = isListed && nft.listing ? nft.listing.seller : nft.owner;
  const shortOwner = `${effectiveOwner.slice(0, 6)}...${effectiveOwner.slice(-4)}`;

  return (
    <>
      <div
        className="group relative bg-void-card border border-white/5 rounded-px overflow-hidden transition-all duration-300 hover:border-neon-cyan/35 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_rgba(0,0,0,0.7),0_0_0_1px_rgba(0,245,255,0.08)]"
        style={{ animationDelay: `${index * 70}ms` }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-neon opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neon-cyan/70 z-10" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neon-purple/70 z-10" />

        <div
          className="relative overflow-hidden cursor-pointer"
          style={{ aspectRatio: '1' }}
          onClick={() => setShowDetail(true)}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={nft.metadata?.name ?? `NFT #${nft.id}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              style={{ filter: 'saturate(1.15) contrast(1.05)' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-void border border-white/5">
              {nft.metadata === null ? (
                <span className="font-mono text-2xs text-dim tracking-widest">NO IMAGE</span>
              ) : (
                <span className="font-mono text-2xs text-dim tracking-widest animate-pulse">LOADING...</span>
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-void-card via-transparent to-transparent" />

          <div className={`absolute top-2.5 right-2.5 z-10 border font-mono text-2xs px-2 py-0.5 tracking-widest backdrop-blur-sm ${rs}`}>
            ◆ {rarity?.value.toUpperCase() ?? 'COMMON'}
          </div>

          <div className={`absolute bottom-2 left-2 right-2 z-10 transition-all duration-300 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <p className="font-mono text-[10px] text-dim/80 tracking-widest truncate">
              OWNER <span className="text-neon-cyan/80">{shortOwner}</span>
            </p>
          </div>
        </div>

        <div className="p-4">
          <p className="font-mono text-[9px] text-dim tracking-widest mb-1">
            TOKEN #{String(nft.id).padStart(3, '0')}
          </p>
          <h3
            className="font-orbitron text-[13px] font-bold text-white tracking-wide mb-3 truncate cursor-pointer hover:text-neon-cyan transition-colors"
            onClick={() => setShowDetail(true)}
          >
            {nft.metadata?.name ?? `NFT #${nft.id}`}
          </h3>

          {nft.metadata?.description && (
            <p className="font-mono text-[10px] text-dim/70 mb-3 line-clamp-2 leading-relaxed">
              {nft.metadata.description}
            </p>
          )}

          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="font-mono text-[9px] text-dim tracking-widest mb-0.5">
                {isListed ? 'SALE PRICE' : 'MINT PRICE'}
              </p>
              <div className="flex items-center gap-1.5">
                <EthDiamond className="w-3.5 h-3.5 text-neon-purple flex-shrink-0" />
                <span className="font-orbitron text-base font-bold text-neon-cyan">
                  {isListed && nft.listing ? formatEther(nft.listing.price) : (mintPrice ?? '—')}
                </span>
                <span className="font-mono text-[10px] text-dim">ETH</span>
              </div>
            </div>
            <div className="text-right">
              {isListed ? (
                <span className="font-mono text-[10px] text-neon-green border border-neon-green/30 px-2 py-0.5">FOR SALE</span>
              ) : (
                <p className="font-mono text-[10px] text-dim/40 tracking-widest">not listed</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowDetail(true)}
              className={`flex-1 font-orbitron text-[10px] font-black tracking-widest py-2.5 uppercase cursor-pointer transition-all duration-200 hover:-translate-y-px [clip-path:polygon(6px_0%,100%_0%,calc(100%-6px)_100%,0%_100%)] ${
                isListed
                  ? 'bg-neon-green text-void hover:shadow-[0_0_20px_#00ff88]'
                  : 'bg-gradient-to-r from-neon-cyan to-neon-purple text-void hover:shadow-neon-cyan'
              }`}
            >
              {isListed ? 'BUY NOW' : 'View Details'}
            </button>
            <button
              onClick={() => toggle(nft.id)}
              className={`px-3 border font-mono text-base tracking-wider cursor-pointer transition-all duration-200 ${
                wishlisted
                  ? 'border-neon-pink/60 text-neon-pink bg-neon-pink/8 hover:bg-neon-pink/15'
                  : 'border-neon-cyan/25 text-dim hover:border-neon-pink/40 hover:text-neon-pink'
              }`}
              title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {wishlisted ? '♥' : '♡'}
            </button>
          </div>
        </div>
      </div>

      {showDetail && (
        <NFTDetailModal
          nft={nft}
          wishlisted={wishlisted}
          onToggleWishlist={() => toggle(nft.id)}
          onClose={() => setShowDetail(false)}
          onAction={onAction}
        />
      )}
    </>
  );
}

export function NFTCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="bg-void-card border border-white/5 rounded-px overflow-hidden animate-pulse"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="bg-white/5" style={{ aspectRatio: '1' }} />
      <div className="p-4 space-y-3">
        <div className="h-2 bg-white/5 rounded w-16" />
        <div className="h-3 bg-white/5 rounded w-3/4" />
        <div className="h-2 bg-white/5 rounded w-full" />
        <div className="h-8 bg-white/5 rounded mt-2" />
      </div>
    </div>
  );
}
