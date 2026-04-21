import { useReadContract } from 'wagmi';
import { useGasData } from '../web3/hooks/useGasData';
import { CONTRACT_ADDRESS, MAX_SUPPLY } from '../web3/config';
import { NFTFORGE_ABI } from '../web3/abi';

export function NetworkStatsBar() {
  const { ethPrice, ethChange, blockNumber } = useGasData();

  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: NFTFORGE_ABI,
    functionName: 'totalSupply',
    query: { refetchInterval: 12_000 },
  });

  const minted = totalSupply ? Number(totalSupply) : null;
  const mintedPct = minted !== null ? ((minted / MAX_SUPPLY) * 100).toFixed(1) : null;

  const stats = [
    {
      label: 'ETH Price',
      value: ethPrice ? `$${ethPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—',
      sub: ethChange !== null
        ? `${ethChange >= 0 ? '+' : ''}${ethChange.toFixed(1)}% today`
        : 'loading...',
      accent: 'text-neon-cyan',
    },
    {
      label: 'Block Height',
      value: blockNumber ? `${blockNumber.toLocaleString()}` : '—',
      sub: '~12s avg',
      accent: 'text-neon-purple',
    },
    {
      label: 'Total Minted',
      value: minted !== null ? `${minted.toLocaleString()} / ${MAX_SUPPLY.toLocaleString()}` : '—',
      sub: mintedPct !== null ? `${mintedPct}% of supply` : 'loading...',
      accent: 'text-neon-cyan',
    },
    {
      label: 'On-Chain NFTs',
      value: minted !== null ? minted.toLocaleString() : '—',
      sub: 'live from contract',
      accent: 'text-neon-green',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      {stats.map((s) => (
        <div
          key={s.label}
          className="
            relative bg-void-card border border-white/5 px-5 py-4
            [clip-path:polygon(8px_0%,100%_0%,calc(100%-8px)_100%,0%_100%)]
            overflow-hidden group hover:border-neon-cyan/20 transition-colors
          "
        >
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-neon-cyan/30" />
          <p className="font-mono text-[9px] text-dim tracking-widest mb-1 uppercase">{s.label}</p>
          <p className={`font-orbitron text-xl font-bold ${s.accent} mb-0.5`}>{s.value}</p>
          <p className="font-mono text-[9px] text-dim">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}
