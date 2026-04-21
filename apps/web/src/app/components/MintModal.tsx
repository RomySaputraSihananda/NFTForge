import { useRef, useState } from 'react';
import { MAX_SUPPLY } from '../web3/config';
import { useNFTForge } from '../web3/hooks/useNFTForge';
import { useIPFSUpload } from '../web3/hooks/useIPFSUpload';
import { EthDiamond } from './EthDiamond';
import { formatEther } from 'viem';

interface Props {
  onClose: () => void;
  onMinted?: () => void;
}

const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

type Step = 'form' | 'confirm' | 'uploading' | 'minting' | 'success';

export function MintModal({ onClose, onMinted }: Props) {
  const [step, setStep] = useState<Step>('form');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rarity, setRarity] = useState('Common');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { totalSupply, mintPrice, mint, minting, mintError } = useNFTForge();
  const { upload, uploading, uploadStep, uploadError, hasPinata } = useIPFSUpload();

  const minted = totalSupply !== null ? Number(totalSupply) : null;
  const pct = minted !== null ? ((minted / MAX_SUPPLY) * 100).toFixed(1) : null;

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFileChange(file);
  };

  const handleSubmit = () => {
    setFormError(null);
    if (!name.trim()) return setFormError('Name is required');
    if (!imageFile) return setFormError('Image is required');
    setStep('confirm');
  };

  const handleConfirm = async () => {
    try {
      setStep('uploading');
      const tokenURI = await upload(imageFile!, name.trim(), description.trim(), rarity);

      setStep('minting');
      const hash = await mint(tokenURI);
      setTxHash(hash as string);
      setStep('success');
      onMinted?.();
    } catch {
      setStep('form');
    }
  };

  const statusLabel =
    step === 'uploading'
      ? uploadStep === 'image'
        ? 'Uploading image to IPFS...'
        : 'Uploading metadata to IPFS...'
      : step === 'minting'
      ? 'Confirm in wallet...'
      : step === 'confirm' && (uploading || minting)
      ? 'Processing...'
      : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-void-card border border-neon-cyan/20 p-8 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-neon-cyan" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-neon-purple" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-orbitron text-lg font-black tracking-widest text-white">
            CREATE NFT
          </h2>
          <button
            onClick={onClose}
            className="font-mono text-dim text-lg hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {step === 'confirm' ? (
          <div className="space-y-4">
            <div className="flex gap-4">
              {imagePreview && (
                <img src={imagePreview} alt="preview" className="w-24 h-24 object-cover border border-white/10 flex-shrink-0" />
              )}
              <div className="space-y-1 min-w-0">
                <p className="font-orbitron text-sm font-bold text-white truncate">{name}</p>
                {description && <p className="font-mono text-[10px] text-dim leading-relaxed line-clamp-2">{description}</p>}
                <p className="font-mono text-[10px] text-neon-cyan tracking-widest">{rarity.toUpperCase()}</p>
              </div>
            </div>

            <div className="border border-white/8 bg-void px-4 py-3 space-y-2">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-dim">Mint price</span>
                <span className="text-neon-cyan">{mintPrice ? formatEther(mintPrice as bigint) : '0.01'} ETH</span>
              </div>
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-dim">Network</span>
                <span className="text-white">Ethereum Sepolia</span>
              </div>
              <div className="border-t border-white/5 pt-2 font-mono text-[10px] text-amber-400/80">
                Image will be uploaded to IPFS permanently after confirming.
              </div>
            </div>

            {(uploadError || mintError) && (
              <p className="font-mono text-2xs text-neon-pink leading-relaxed">
                {uploadError ?? mintError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 bg-gradient-to-r from-neon-cyan to-neon-purple text-void font-orbitron text-[11px] font-black tracking-widest py-3 uppercase cursor-pointer transition-all hover:shadow-neon-cyan [clip-path:polygon(6px_0%,100%_0%,calc(100%-6px)_100%,0%_100%)]"
              >
                CONFIRM & MINT
              </button>
              <button
                onClick={() => setStep('form')}
                className="px-5 bg-transparent border border-white/10 text-dim font-mono text-[10px] tracking-wider uppercase cursor-pointer hover:border-white/20 hover:text-white transition-colors"
              >
                BACK
              </button>
            </div>
          </div>
        ) : step === 'success' ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center border border-neon-green/40 bg-neon-green/8">
              <span className="text-neon-green text-xl">✓</span>
            </div>
            <p className="font-orbitron text-sm font-bold text-neon-green tracking-widest mb-2">
              MINTED SUCCESSFULLY
            </p>
            <p className="font-mono text-2xs text-dim tracking-widest mb-1">TX HASH</p>
            <p className="font-mono text-[10px] text-neon-cyan/80 break-all bg-void px-3 py-2 border border-white/5">
              {txHash}
            </p>
            <button
              onClick={onClose}
              className="mt-6 font-orbitron text-[11px] font-bold tracking-widest text-neon-cyan border border-neon-cyan/30 px-8 py-2.5 hover:bg-neon-cyan/5 transition-colors cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        ) : (
          <>
            {minted !== null && (
              <div className="mb-5">
                <div className="flex justify-between font-mono text-2xs text-dim mb-1.5">
                  <span>{minted.toLocaleString()} / {MAX_SUPPLY.toLocaleString()} MINTED</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1 bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="font-mono text-2xs text-dim tracking-widest block mb-2">
                IMAGE *
              </label>
              <div
                className={`relative border-2 border-dashed transition-colors cursor-pointer ${
                  imagePreview ? 'border-neon-cyan/40' : 'border-white/10 hover:border-neon-cyan/30'
                }`}
                style={{ aspectRatio: imagePreview ? undefined : '2/1' }}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-void/60 opacity-0 hover:opacity-100 transition-opacity">
                      <span className="font-mono text-2xs text-white tracking-widest">CHANGE IMAGE</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <span className="text-2xl text-dim">↑</span>
                    <span className="font-mono text-2xs text-dim tracking-widest">DROP IMAGE OR CLICK TO BROWSE</span>
                    <span className="font-mono text-[10px] text-dim/50">PNG, JPG, GIF, WEBP</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="font-mono text-2xs text-dim tracking-widest block mb-2">
                NAME *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cyber Phantom #001"
                maxLength={64}
                className="w-full bg-void border border-white/10 text-white font-mono text-xs px-4 py-3 focus:outline-none focus:border-neon-cyan/50 placeholder:text-white/20 transition-colors"
              />
            </div>

            <div className="mb-4">
              <label className="font-mono text-2xs text-dim tracking-widest block mb-2">
                DESCRIPTION
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your NFT..."
                rows={2}
                maxLength={256}
                className="w-full bg-void border border-white/10 text-white font-mono text-xs px-4 py-3 focus:outline-none focus:border-neon-cyan/50 placeholder:text-white/20 transition-colors resize-none"
              />
            </div>

            <div className="mb-5">
              <label className="font-mono text-2xs text-dim tracking-widest block mb-2">
                RARITY
              </label>
              <div className="flex gap-1 flex-wrap">
                {RARITIES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRarity(r)}
                    className={`font-mono text-[10px] tracking-widest px-3 py-1.5 border transition-all cursor-pointer ${
                      rarity === r
                        ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/8'
                        : 'border-white/10 text-dim hover:border-neon-cyan/40'
                    }`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-5 px-4 py-3 bg-neon-cyan/4 border border-neon-cyan/15">
              <EthDiamond className="w-4 h-4 text-neon-cyan flex-shrink-0" />
              <div>
                <p className="font-mono text-2xs text-dim tracking-widest">MINT PRICE</p>
                <p className="font-orbitron text-sm font-bold text-neon-cyan">
                  {mintPrice ? formatEther(mintPrice as bigint) : '...'} ETH
                </p>
              </div>
              {!hasPinata && (
                <p className="ml-auto font-mono text-[10px] text-amber-400/80 leading-relaxed text-right">
                  Set VITE_PINATA_JWT<br />in .env for IPFS upload
                </p>
              )}
            </div>

            {statusLabel && (
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                <p className="font-mono text-2xs text-neon-cyan tracking-widest">{statusLabel}</p>
              </div>
            )}
            {(formError || uploadError || mintError) && (
              <p className="font-mono text-2xs text-neon-pink mb-4 leading-relaxed">
                {formError ?? uploadError ?? mintError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={uploading || minting}
                className="
                  flex-1 bg-gradient-to-r from-neon-cyan to-neon-purple text-void
                  font-orbitron text-[11px] font-black tracking-widest py-3 uppercase
                  cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200 hover:shadow-neon-cyan hover:-translate-y-px
                  [clip-path:polygon(6px_0%,100%_0%,calc(100%-6px)_100%,0%_100%)]
                "
              >
                {uploading ? 'UPLOADING...' : minting ? 'MINTING...' : 'CREATE & MINT'}
              </button>
              <button
                onClick={onClose}
                className="px-5 bg-transparent border border-white/10 text-dim font-mono text-[10px] tracking-wider uppercase cursor-pointer hover:border-white/20 hover:text-white transition-colors"
              >
                CANCEL
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
