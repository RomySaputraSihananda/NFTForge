import React, { useEffect, useState } from 'react';
import { CONTRACT_ADDRESS, MAX_SUPPLY } from '../web3/config';
import { EthDiamond } from './EthDiamond';
import { useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { NFTFORGE_ABI } from '../web3/abi';

interface Props {
  totalSupply: bigint | null;
  connected: boolean;
  onMintClick: () => void;
}

export function FeaturedHero({ totalSupply, connected, onMintClick }: Props) {
  const { data: mintPriceRaw } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFTFORGE_ABI,
    functionName: 'MINT_PRICE',
  });
  const mintPrice = mintPriceRaw ? formatEther(mintPriceRaw as bigint) : '...';
  const [timeLeft, setTimeLeft] = useState({ h: 4, m: 23, s: 11 });

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 0; m = 0; s = 0; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const minted = totalSupply !== null ? Number(totalSupply) : null;
  const pct = minted !== null ? ((minted / MAX_SUPPLY) * 100).toFixed(1) : '68.4';
  const mintedDisplay =
    minted !== null
      ? `${minted.toLocaleString()} / ${MAX_SUPPLY.toLocaleString()}`
      : '— / 10K';

  const shortAddress = `${CONTRACT_ADDRESS.slice(0, 6)}...${CONTRACT_ADDRESS.slice(-4)}`;

  const handleCopy = () => navigator.clipboard.writeText(CONTRACT_ADDRESS);

  return (
    <div className="relative overflow-hidden border border-neon-cyan/10 rounded-px mb-8 bg-void-card">
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neon-cyan z-20" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neon-purple z-20" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-neon-cyan/5 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-80 h-80 rounded-full bg-neon-purple/6 blur-[100px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        <div className="p-10 flex flex-col justify-center relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-pink animate-pulse" />
            <span className="font-mono text-2xs text-neon-pink tracking-widest">
              LIVE DROP
            </span>
          </div>

          <h1
            className="font-orbitron font-black leading-none tracking-tight mb-2"
            style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}
          >
            <span className="text-white">PHANTOM</span>
            <br />
            <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              PROTOCOL
            </span>
          </h1>

          <p className="font-mono text-2xs text-dim tracking-widest mb-6">
            by NFTFORGE — {MAX_SUPPLY.toLocaleString()} ITEMS ON ETHEREUM
          </p>

          <div className="flex items-center gap-2 mb-6 w-fit px-3 py-1.5 bg-neon-purple/8 border border-neon-purple/20 rounded-sm">
            <EthDiamond className="w-4 h-4 text-neon-purple" />
            <span className="font-mono text-2xs text-neon-purple tracking-widest">
              ETHEREUM MAINNET
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: 'MINT PRICE', value: `Ξ ${mintPrice}` },
              { label: 'MINTED', value: mintedDisplay },
              { label: 'ROYALTY', value: '5%' },
            ].map((s) => (
              <div key={s.label} className="border border-white/5 bg-white/[0.02] px-3 py-2.5">
                <p className="font-mono text-[9px] text-dim tracking-widest mb-1">{s.label}</p>
                <p className="font-orbitron text-sm font-bold text-white truncate">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-6">
            <span className="font-mono text-2xs text-dim tracking-widest mr-1">ENDS IN</span>
            {[pad(timeLeft.h), pad(timeLeft.m), pad(timeLeft.s)].map((v, i) => (
              <React.Fragment key={i}>
                <div className="text-center bg-void border border-neon-cyan/15 px-3 py-1 min-w-[48px]">
                  <span className="font-orbitron text-lg font-black text-neon-cyan block leading-none">{v}</span>
                  <span className="font-mono text-[8px] text-dim tracking-widest">{['HRS', 'MIN', 'SEC'][i]}</span>
                </div>
                {i < 2 && <span className="font-orbitron text-neon-cyan/40 text-lg">:</span>}
              </React.Fragment>
            ))}
          </div>

          <div className="mb-6">
            <div className="flex justify-between font-mono text-2xs text-dim mb-1.5">
              <span>MINTED</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onMintClick}
              className="
                bg-gradient-to-r from-neon-cyan to-neon-purple text-void
                font-orbitron text-[11px] font-black tracking-widest
                py-3.5 px-8 uppercase cursor-pointer
                transition-all duration-200 hover:shadow-neon-cyan hover:-translate-y-px
                [clip-path:polygon(8px_0%,100%_0%,calc(100%-8px)_100%,0%_100%)]
              "
            >
              {connected ? 'Mint Now' : 'Connect & Mint'}
            </button>
            <a
              href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="
                bg-transparent border border-neon-cyan/30 text-neon-cyan
                font-orbitron text-[11px] font-bold tracking-widest
                py-3.5 px-6 uppercase cursor-pointer
                transition-all duration-200 hover:bg-neon-cyan/5 hover:border-neon-cyan
                [clip-path:polygon(8px_0%,100%_0%,calc(100%-8px)_100%,0%_100%)]
                inline-flex items-center
              "
            >
              Etherscan ↗
            </a>
          </div>
        </div>

        <div className="relative min-h-[360px] lg:min-h-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=800&h=800&fit=crop"
            alt="Featured NFT"
            className="w-full h-full object-cover"
            style={{ filter: 'saturate(1.2) contrast(1.08)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-void-card via-transparent to-transparent lg:block hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-void-card/60 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 bg-void/80 backdrop-blur-sm border border-neon-cyan/15 px-3 py-2">
            <p className="font-mono text-[9px] text-dim tracking-widest mb-0.5">
              CONTRACT ADDRESS
            </p>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-neon-cyan">{shortAddress}</span>
              <button
                onClick={handleCopy}
                className="font-mono text-[9px] text-neon-purple border border-neon-purple/30 px-2 py-0.5 hover:bg-neon-purple/10 transition-colors cursor-pointer"
              >
                COPY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
