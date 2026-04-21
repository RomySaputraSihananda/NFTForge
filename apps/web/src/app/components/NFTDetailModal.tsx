import { useState } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { NFT } from '../types/NFT';
import { ipfsToHttp } from '../web3/hooks/useNFTMarket';
import { CONTRACT_ADDRESS } from '../web3/config';
import { EthDiamond } from './EthDiamond';
import { useMarketplace } from '../web3/hooks/useMarketplace';

const rarityStyle: Record<string, string> = {
  legendary: 'text-amber-400 border-amber-400/40 bg-amber-400/8',
  epic:      'text-neon-purple border-neon-purple/40 bg-neon-purple/8',
  rare:      'text-neon-cyan border-neon-cyan/40 bg-neon-cyan/8',
  uncommon:  'text-emerald-400 border-emerald-400/40 bg-emerald-400/8',
  common:    'text-slate-400 border-slate-400/40 bg-slate-400/8',
};

interface Props {
  nft: NFT;
  wishlisted: boolean;
  onToggleWishlist: () => void;
  onClose: () => void;
  onAction?: () => void;
}

export function NFTDetailModal({ nft, wishlisted, onToggleWishlist, onClose, onAction }: Props) {
  const { address } = useAccount();
  const { listForSale, updateListing, buyNFT, cancelListing, burn, pending, error } = useMarketplace();

  const [listPrice, setListPrice] = useState('');
  const [showListForm, setShowListForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updatePrice, setUpdatePrice] = useState('');
  const [showBurnConfirm, setShowBurnConfirm] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [actionDone, setActionDone] = useState<string | null>(null);

  const imageUrl = nft.metadata?.image ? ipfsToHttp(nft.metadata.image) : null;
  const rarity = nft.metadata?.attributes?.find((a) => a.trait_type.toLowerCase() === 'rarity');
  const rarityTier = rarity?.value.toLowerCase() ?? 'common';
  const rs = rarityStyle[rarityTier] ?? rarityStyle.common;
  const otherAttrs = nft.metadata?.attributes?.filter((a) => a.trait_type.toLowerCase() !== 'rarity') ?? [];

  const isListed = nft.listing?.active ?? false;
  const seller = nft.listing?.seller?.toLowerCase();
  const isOwner = address
    ? isListed
      ? seller === address.toLowerCase()
      : nft.owner.toLowerCase() === address.toLowerCase()
    : false;

  const shortOwner = isListed && nft.listing
    ? `${nft.listing.seller.slice(0, 8)}...${nft.listing.seller.slice(-6)}`
    : `${nft.owner.slice(0, 8)}...${nft.owner.slice(-6)}`;

  const done = async (label: string, hash: string) => {
    setTxHash(hash);
    setActionDone(label);
    onAction?.();
  };

  const handleList = async () => {
    if (!listPrice || parseFloat(listPrice) <= 0) return;
    try {
      const hash = await listForSale(nft.id, listPrice);
      await done('LISTED FOR SALE', hash as string);
      setShowListForm(false);
    } catch {}
  };

  const handleBuy = async () => {
    if (!nft.listing) return;
    try {
      const hash = await buyNFT(nft.id, nft.listing.price);
      await done('PURCHASED', hash as string);
    } catch {}
  };

  const handleUpdatePrice = async () => {
    if (!updatePrice || parseFloat(updatePrice) <= 0) return;
    try {
      const hash = await updateListing(nft.id, updatePrice);
      await done('PRICE UPDATED', hash as string);
      setShowUpdateForm(false);
    } catch {}
  };

  const handleCancel = async () => {
    try {
      const hash = await cancelListing(nft.id);
      await done('LISTING CANCELLED', hash as string);
    } catch {}
  };

  const handleBurn = async () => {
    try {
      const hash = await burn(nft.id);
      await done('NFT BURNED', hash as string);
      setShowBurnConfirm(false);
    } catch {}
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-void-card border border-neon-cyan/20 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neon-cyan z-10" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-neon-purple z-10" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neon-purple z-10" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neon-cyan z-10" />

        {actionDone && txHash && (
          <div className="border-b border-neon-green/20 bg-neon-green/5 px-6 py-3 flex items-center gap-3">
            <span className="text-neon-green text-base">✓</span>
            <div className="flex-1 min-w-0">
              <p className="font-orbitron text-[11px] font-bold text-neon-green tracking-widest">{actionDone}</p>
              <p className="font-mono text-[10px] text-dim truncate">{txHash}</p>
            </div>
            <button onClick={onClose} className="font-mono text-2xs text-neon-green border border-neon-green/30 px-3 py-1 cursor-pointer hover:bg-neon-green/10">
              CLOSE
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative aspect-square md:aspect-auto md:min-h-[400px] overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt={nft.metadata?.name} className="w-full h-full object-cover" style={{ filter: 'saturate(1.1) contrast(1.05)' }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-void min-h-[300px]">
                <EthDiamond className="w-16 h-16 text-neon-cyan/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-void-card/40 to-transparent pointer-events-none" />

            {rarity && (
              <div className={`absolute top-3 left-3 font-mono text-[10px] tracking-widest px-2.5 py-1 border backdrop-blur-sm ${rs}`}>
                ◆ {rarity.value.toUpperCase()}
              </div>
            )}

            {isListed && (
              <div className="absolute bottom-3 left-3 right-3 bg-void/80 backdrop-blur-sm border border-neon-green/30 px-3 py-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                <span className="font-mono text-[10px] text-neon-green tracking-widest">FOR SALE</span>
                <span className="ml-auto font-orbitron text-sm font-bold text-neon-green">
                  {formatEther(nft.listing!.price)} ETH
                </span>
              </div>
            )}
          </div>

          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[9px] text-dim tracking-widest mb-1">TOKEN #{String(nft.id).padStart(3, '0')}</p>
                <h2 className="font-orbitron text-xl font-black text-white leading-tight">
                  {nft.metadata?.name ?? `NFT #${nft.id}`}
                </h2>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={onToggleWishlist}
                  className={`w-9 h-9 flex items-center justify-center border transition-all cursor-pointer ${
                    wishlisted ? 'border-neon-pink/60 bg-neon-pink/10 text-neon-pink' : 'border-white/15 text-dim hover:border-neon-pink/40 hover:text-neon-pink'
                  }`}
                >
                  {wishlisted ? '♥' : '♡'}
                </button>
                <button onClick={onClose} className="w-9 h-9 flex items-center justify-center border border-white/10 text-dim hover:text-white hover:border-white/30 transition-colors cursor-pointer font-mono">
                  ✕
                </button>
              </div>
            </div>

            {nft.metadata?.description && (
              <p className="font-mono text-xs text-dim/80 leading-relaxed border-l-2 border-neon-cyan/20 pl-3">
                {nft.metadata.description}
              </p>
            )}

            <div className="border border-white/8 bg-void p-4 space-y-3">

              {isListed && nft.listing && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[9px] text-dim tracking-widest mb-0.5">PRICE</p>
                      <div className="flex items-center gap-2">
                        <EthDiamond className="w-4 h-4 text-neon-cyan" />
                        <span className="font-orbitron text-xl font-bold text-neon-cyan">
                          {formatEther(nft.listing.price)}
                        </span>
                        <span className="font-mono text-xs text-dim">ETH</span>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-neon-green border border-neon-green/30 px-2 py-1">FOR SALE</span>
                  </div>

                  {isOwner ? (
                    <div className="space-y-2">
                      {showUpdateForm ? (
                        <div className="space-y-2">
                          <label className="font-mono text-[9px] text-dim tracking-widest block">NEW PRICE (ETH)</label>
                          <div className="flex gap-2">
                            <input
                              type="number" step="0.001" min="0.001"
                              value={updatePrice}
                              onChange={(e) => setUpdatePrice(e.target.value)}
                              placeholder={nft.listing ? formatEther(nft.listing.price) : '0.05'}
                              className="flex-1 bg-void-card border border-white/10 text-white font-mono text-sm px-3 py-2 focus:outline-none focus:border-neon-cyan/50 placeholder:text-white/20"
                            />
                            <button onClick={handleUpdatePrice} disabled={pending || !updatePrice} className="px-4 bg-neon-cyan text-void font-orbitron text-[10px] font-black tracking-widest uppercase cursor-pointer disabled:opacity-50 hover:bg-neon-cyan/80 transition-colors">
                              {pending ? '...' : 'UPDATE'}
                            </button>
                            <button onClick={() => setShowUpdateForm(false)} className="px-3 border border-white/10 text-dim font-mono text-[10px] cursor-pointer hover:border-white/20 transition-colors">✕</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setShowUpdateForm(true)} className="w-full border border-neon-cyan/30 text-neon-cyan font-orbitron text-[11px] font-bold tracking-widest py-2.5 uppercase cursor-pointer hover:bg-neon-cyan/10 transition-colors">
                          UPDATE PRICE
                        </button>
                      )}
                      <button
                        onClick={handleCancel}
                        disabled={pending}
                        className="w-full border border-amber-400/40 text-amber-400 font-orbitron text-[11px] font-bold tracking-widest py-2.5 uppercase cursor-pointer hover:bg-amber-400/10 transition-colors disabled:opacity-50"
                      >
                        {pending ? 'PROCESSING...' : 'CANCEL LISTING'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleBuy}
                      disabled={pending || !address}
                      className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple text-void font-orbitron text-[11px] font-black tracking-widest py-3 uppercase cursor-pointer disabled:opacity-50 transition-all hover:shadow-neon-cyan [clip-path:polygon(6px_0%,100%_0%,calc(100%-6px)_100%,0%_100%)]"
                    >
                      {pending ? 'PROCESSING...' : !address ? 'CONNECT WALLET' : `BUY NOW — ${formatEther(nft.listing.price)} ETH`}
                    </button>
                  )}
                </>
              )}

              {!isListed && isOwner && (
                <>
                  {!showListForm ? (
                    <button
                      onClick={() => setShowListForm(true)}
                      className="w-full bg-gradient-to-r from-neon-cyan to-neon-purple text-void font-orbitron text-[11px] font-black tracking-widest py-3 uppercase cursor-pointer transition-all hover:shadow-neon-cyan [clip-path:polygon(6px_0%,100%_0%,calc(100%-6px)_100%,0%_100%)]"
                    >
                      LIST FOR SALE
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <label className="font-mono text-[9px] text-dim tracking-widest block">SALE PRICE (ETH)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.001"
                          min="0.001"
                          value={listPrice}
                          onChange={(e) => setListPrice(e.target.value)}
                          placeholder="0.05"
                          className="flex-1 bg-void-card border border-white/10 text-white font-mono text-sm px-3 py-2 focus:outline-none focus:border-neon-cyan/50 placeholder:text-white/20"
                        />
                        <button
                          onClick={handleList}
                          disabled={pending || !listPrice}
                          className="px-4 bg-neon-cyan text-void font-orbitron text-[10px] font-black tracking-widest uppercase cursor-pointer disabled:opacity-50 hover:bg-neon-cyan/80 transition-colors"
                        >
                          {pending ? '...' : 'LIST'}
                        </button>
                        <button
                          onClick={() => setShowListForm(false)}
                          className="px-3 border border-white/10 text-dim font-mono text-[10px] cursor-pointer hover:border-white/20 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {!isListed && !isOwner && (
                <div className="flex items-center gap-2 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-dim" />
                  <p className="font-mono text-[10px] text-dim tracking-widest">NOT FOR SALE</p>
                </div>
              )}

              {error && <p className="font-mono text-[10px] text-neon-pink leading-relaxed">{error}</p>}
            </div>

            <div className="space-y-0">
              <p className="font-mono text-[9px] text-dim tracking-widest mb-2 uppercase">Details</p>
              {[
                { label: 'Contract', value: `${CONTRACT_ADDRESS.slice(0, 8)}...${CONTRACT_ADDRESS.slice(-6)}`, copy: CONTRACT_ADDRESS },
                { label: 'Token ID', value: `#${nft.id}` },
                { label: 'Standard', value: 'ERC-721' },
                { label: 'Owner', value: shortOwner, copy: isListed ? nft.listing?.seller : nft.owner },
              ].map(({ label, value, copy }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="font-mono text-[10px] text-dim">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-white/80">{value}</span>
                    {copy && (
                      <button onClick={() => navigator.clipboard.writeText(copy)} className="font-mono text-[9px] text-neon-purple/70 hover:text-neon-purple cursor-pointer">⎘</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {otherAttrs.length > 0 && (
              <div>
                <p className="font-mono text-[9px] text-dim tracking-widest mb-2 uppercase">Attributes</p>
                <div className="grid grid-cols-2 gap-2">
                  {otherAttrs.map((attr) => (
                    <div key={attr.trait_type} className="border border-white/8 bg-white/[0.02] px-3 py-2">
                      <p className="font-mono text-[9px] text-dim tracking-widest mb-0.5">{attr.trait_type.toUpperCase()}</p>
                      <p className="font-orbitron text-xs font-bold text-white">{attr.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isOwner && !isListed && (
              <div className="pt-2 border-t border-white/5">
                {!showBurnConfirm ? (
                  <button
                    onClick={() => setShowBurnConfirm(true)}
                    className="font-mono text-[10px] text-dim/60 hover:text-neon-pink transition-colors cursor-pointer tracking-widest"
                  >
                    🗑 Delete (burn) this NFT
                  </button>
                ) : (
                  <div className="border border-neon-pink/30 bg-neon-pink/5 p-3 space-y-2">
                    <p className="font-mono text-[10px] text-neon-pink tracking-widest">
                      This will permanently destroy the NFT. This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleBurn}
                        disabled={pending}
                        className="flex-1 bg-neon-pink text-void font-orbitron text-[10px] font-black tracking-widest py-2 uppercase cursor-pointer disabled:opacity-50 hover:bg-neon-pink/80 transition-colors"
                      >
                        {pending ? 'BURNING...' : 'CONFIRM BURN'}
                      </button>
                      <button
                        onClick={() => setShowBurnConfirm(false)}
                        className="px-4 border border-white/10 text-dim font-mono text-[10px] cursor-pointer hover:border-white/20 transition-colors"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
