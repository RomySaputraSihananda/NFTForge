import { useGasData } from '../web3/hooks/useGasData';
import { EthDiamond } from './EthDiamond';

const tierStyle = {
  slow: { color: 'bg-emerald-500/20 border-emerald-500/40', text: 'text-emerald-400' },
  normal: { color: 'bg-amber-500/20 border-amber-500/40', text: 'text-amber-400' },
  fast: { color: 'bg-orange-500/20 border-orange-500/40', text: 'text-orange-400' },
  turbo: { color: 'bg-red-500/20 border-red-500/40', text: 'text-red-400' },
};

export function GasTicker() {
  const { blockNumber, gasTiers, ethPrice, ethChange } = useGasData();

  return (
    <div className="bg-void-card border-b border-neon-cyan/8">
      <div className="max-w-[1400px] mx-auto px-6 py-2 flex items-center gap-4">
        <div className="flex items-center gap-2 pr-4 border-r border-neon-cyan/10">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse inline-block" />
          <span className="font-mono text-2xs text-dim tracking-widest">BLOCK</span>
          <span className="font-orbitron text-xs font-bold text-neon-green">
            #{blockNumber ? blockNumber.toLocaleString() : '—'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-2xs text-dim tracking-widest mr-1">GAS</span>
          {gasTiers ? (
            (Object.entries(gasTiers) as [keyof typeof tierStyle, number][]).map(([label, gwei]) => (
              <div
                key={label}
                className={`flex items-center gap-1 px-2 py-0.5 border rounded-sm ${tierStyle[label].color}`}
              >
                <span className={`font-mono text-2xs tracking-wider ${tierStyle[label].text}`}>
                  {label.toUpperCase()}
                </span>
                <span className={`font-orbitron text-[11px] font-bold ${tierStyle[label].text}`}>
                  {gwei}
                </span>
                <span className={`font-mono text-[9px] ${tierStyle[label].text} opacity-70`}>
                  gwei
                </span>
              </div>
            ))
          ) : (
            <span className="font-mono text-2xs text-dim animate-pulse">fetching...</span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <EthDiamond className="w-3.5 h-3.5 text-neon-purple" />
          <span className="font-orbitron text-xs font-bold text-white">
            {ethPrice ? `$${ethPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—'}
          </span>
          {ethChange !== null && (
            <span className={`font-mono text-2xs ${ethChange >= 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
              {ethChange >= 0 ? '+' : ''}{ethChange.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
