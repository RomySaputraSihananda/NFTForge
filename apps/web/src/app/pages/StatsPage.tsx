import { useReadContract, useChainId } from 'wagmi';
import { formatEther } from 'viem';
import { EthDiamond } from '../components/EthDiamond';
import { NFT } from '../types/NFT';
import { NFTFORGE_ABI } from '../web3/abi';
import { CONTRACT_ADDRESS, MAX_SUPPLY } from '../web3/config';
import { useGasData } from '../web3/hooks/useGasData';

interface Props {
  nfts: NFT[];
}

function StatCard({ label, value, sub, accent = 'text-neon-cyan' }: {
  label: string; value: string; sub?: string; accent?: string;
}) {
  return (
    <div className="relative bg-void-card border border-white/5 px-6 py-5 overflow-hidden group hover:border-neon-cyan/20 transition-colors [clip-path:polygon(10px_0%,100%_0%,calc(100%-10px)_100%,0%_100%)]">
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-neon-cyan/30" />
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-neon-cyan/3 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <p className="font-mono text-[9px] text-dim tracking-widest mb-2 uppercase">{label}</p>
      <p className={`font-orbitron text-2xl font-black ${accent} mb-1`}>{value}</p>
      {sub && <p className="font-mono text-[10px] text-dim/70">{sub}</p>}
    </div>
  );
}

function InfoRow({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
      <span className="font-mono text-2xs text-dim tracking-widest">{label}</span>
      <span className={`${mono ? 'font-mono' : 'font-orbitron'} text-xs text-white`}>{value}</span>
    </div>
  );
}

export function StatsPage({ nfts }: Props) {
  const chainId = useChainId();
  const { ethPrice, gasTiers } = useGasData();

  const { data: nameRaw } = useReadContract({ address: CONTRACT_ADDRESS, abi: NFTFORGE_ABI, functionName: 'name' });
  const { data: symbolRaw } = useReadContract({ address: CONTRACT_ADDRESS, abi: NFTFORGE_ABI, functionName: 'symbol' });
  const { data: totalSupplyRaw } = useReadContract({ address: CONTRACT_ADDRESS, abi: NFTFORGE_ABI, functionName: 'totalSupply', query: { refetchInterval: 12_000 } });
  const { data: mintPriceRaw } = useReadContract({ address: CONTRACT_ADDRESS, abi: NFTFORGE_ABI, functionName: 'MINT_PRICE' });

  const totalSupply = totalSupplyRaw ? Number(totalSupplyRaw) : 0;
  const mintPriceEth = mintPriceRaw ? formatEther(mintPriceRaw as bigint) : '0';
  const remaining = MAX_SUPPLY - totalSupply;
  const pct = ((totalSupply / MAX_SUPPLY) * 100).toFixed(2);
  const uniqueOwners = new Set(nfts.map((n) => n.owner)).size;
  const totalVolumeEth = (totalSupply * parseFloat(mintPriceEth)).toFixed(4);
  const totalVolumeUsd = ethPrice
    ? `$${(totalSupply * parseFloat(mintPriceEth) * ethPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
    : '—';

  const rarityDist = nfts.reduce<Record<string, number>>((acc, nft) => {
    const r = nft.metadata?.attributes?.find((a) => a.trait_type.toLowerCase() === 'rarity')?.value ?? 'Unknown';
    acc[r] = (acc[r] ?? 0) + 1;
    return acc;
  }, {});

  const chainName =
    chainId === 1 ? 'Ethereum Mainnet'
    : chainId === 11155111 ? 'Sepolia Testnet'
    : chainId === 31337 ? 'Localhost (Hardhat)'
    : `Chain ${chainId}`;

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <EthDiamond className="w-5 h-5 text-neon-cyan" />
        <h1 className="font-orbitron text-xl font-black tracking-widest text-white">STATS</h1>
        <span className="font-mono text-[10px] text-dim tracking-widest border border-white/10 px-2 py-0.5">LIVE</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Minted" value={totalSupply.toLocaleString()} sub={`${pct}% of supply`} accent="text-neon-cyan" />
        <StatCard label="Unique Owners" value={uniqueOwners.toLocaleString()} sub="distinct wallets" accent="text-neon-purple" />
        <StatCard label="Total Volume" value={`Ξ ${totalVolumeEth}`} sub={totalVolumeUsd} accent="text-neon-green" />
        <StatCard label="Remaining" value={remaining.toLocaleString()} sub={`${(100 - parseFloat(pct)).toFixed(2)}% available`} accent="text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-void-card border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-neon-cyan" />
            <h3 className="font-orbitron text-sm font-bold tracking-widest text-white">CONTRACT INFO</h3>
          </div>
          <InfoRow label="NAME" value={nameRaw as string ?? '—'} />
          <InfoRow label="SYMBOL" value={symbolRaw as string ?? '—'} />
          <InfoRow label="STANDARD" value="ERC-721" />
          <InfoRow label="NETWORK" value={chainName} />
          <InfoRow label="ADDRESS" value={`${CONTRACT_ADDRESS.slice(0, 10)}...${CONTRACT_ADDRESS.slice(-8)}`} />
          <InfoRow label="MAX SUPPLY" value={MAX_SUPPLY.toLocaleString()} />
          <InfoRow label="MINT PRICE" value={`${mintPriceEth} ETH`} />
        </div>

        <div className="space-y-6">
          <div className="bg-void-card border border-white/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-neon-purple" />
              <h3 className="font-orbitron text-sm font-bold tracking-widest text-white">SUPPLY</h3>
            </div>
            <div className="flex justify-between font-mono text-2xs text-dim mb-2">
              <span>{totalSupply.toLocaleString()} minted</span>
              <span>{MAX_SUPPLY.toLocaleString()} max</span>
            </div>
            <div className="h-3 bg-white/5 overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <p className="font-mono text-2xs text-dim text-right">{pct}% minted</p>
          </div>

          <div className="bg-void-card border border-white/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-neon-green" />
              <h3 className="font-orbitron text-sm font-bold tracking-widest text-white">GAS PRICES</h3>
            </div>
            {gasTiers ? (
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(gasTiers) as [string, number][]).map(([tier, gwei]) => (
                  <div key={tier} className="flex justify-between items-center bg-white/[0.02] border border-white/5 px-3 py-2">
                    <span className="font-mono text-[10px] text-dim tracking-widest">{tier.toUpperCase()}</span>
                    <span className="font-orbitron text-sm font-bold text-neon-green">{gwei} <span className="text-[9px] text-dim font-mono">gwei</span></span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-mono text-2xs text-dim animate-pulse">Fetching gas data...</p>
            )}
          </div>
        </div>
      </div>

      {Object.keys(rarityDist).length > 0 && (
        <div className="bg-void-card border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-4 bg-amber-400" />
            <h3 className="font-orbitron text-sm font-bold tracking-widest text-white">RARITY DISTRIBUTION</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(rarityDist).sort(([, a], [, b]) => b - a).map(([rarity, count]) => {
              const pctBar = ((count / nfts.length) * 100).toFixed(1);
              return (
                <div key={rarity}>
                  <div className="flex justify-between font-mono text-2xs text-dim mb-1">
                    <span className="text-white">{rarity}</span>
                    <span>{count} ({pctBar}%)</span>
                  </div>
                  <div className="h-1.5 bg-white/5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple transition-all duration-700" style={{ width: `${pctBar}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
