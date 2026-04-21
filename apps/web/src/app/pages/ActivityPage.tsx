import { EthDiamond } from '../components/EthDiamond';
import { useActivityFeed } from '../web3/hooks/useActivityFeed';
import { useNFTMarket } from '../web3/hooks/useNFTMarket';
import { ipfsToHttp } from '../web3/hooks/useNFTMarket';
import { CONTRACT_ADDRESS } from '../web3/config';

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function ActivityPage() {
  const { activities, loading, refetch } = useActivityFeed();
  const { nfts } = useNFTMarket();

  const getNFT = (tokenId: number) => nfts.find((n) => n.id === tokenId);

  const etherscanBase = CONTRACT_ADDRESS === '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    ? 'http://localhost'
    : 'https://sepolia.etherscan.io';

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <EthDiamond className="w-5 h-5 text-neon-cyan" />
          <h1 className="font-orbitron text-xl font-black tracking-widest text-white">ACTIVITY</h1>
          <span className="font-mono text-[10px] text-dim tracking-widest border border-white/10 px-2 py-0.5">
            {activities.length} events
          </span>
        </div>
        <button
          onClick={refetch}
          className="font-mono text-[10px] text-dim border border-white/10 px-3 py-1.5 hover:border-neon-cyan/40 hover:text-neon-cyan transition-colors cursor-pointer tracking-widest"
        >
          ↻ REFRESH
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-void-card border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-white/5 bg-void-card">
          <EthDiamond className="w-10 h-10 text-neon-cyan/20 mb-4" />
          <p className="font-orbitron text-sm text-dim tracking-widest">NO ACTIVITY YET</p>
          <p className="font-mono text-2xs text-dim/60 mt-2">Transactions will appear here once NFTs are minted</p>
        </div>
      ) : (
        <div className="bg-void-card border border-white/5 overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-white/5 bg-white/[0.02]">
            {['ITEM', 'EVENT', 'FROM', 'TO', 'TX'].map((h) => (
              <span key={h} className="font-mono text-[9px] text-dim tracking-widest">{h}</span>
            ))}
          </div>

          <div className="divide-y divide-white/5">
            {activities.map((item, i) => {
              const nft = getNFT(item.tokenId);
              const imgUrl = nft?.metadata?.image ? ipfsToHttp(nft.metadata.image) : null;
              const isMint = item.type === 'mint';
              const isLocalhost = etherscanBase === 'http://localhost';

              return (
                <div
                  key={`${item.txHash}-${i}`}
                  className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border border-white/10 overflow-hidden flex-shrink-0 bg-void">
                      {imgUrl ? (
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <EthDiamond className="w-4 h-4 text-neon-cyan/30" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-orbitron text-[11px] font-bold text-white truncate max-w-[120px]">
                        {nft?.metadata?.name ?? `#${item.tokenId}`}
                      </p>
                      <p className="font-mono text-[9px] text-dim">TOKEN #{String(item.tokenId).padStart(3, '0')}</p>
                    </div>
                  </div>

                  <div>
                    <span className={`font-mono text-[10px] tracking-widest px-2 py-0.5 border ${
                      isMint
                        ? 'text-neon-green border-neon-green/30 bg-neon-green/5'
                        : 'text-neon-cyan border-neon-cyan/30 bg-neon-cyan/5'
                    }`}>
                      {isMint ? 'MINT' : 'TRANSFER'}
                    </span>
                  </div>

                  <p className="font-mono text-[10px] text-dim truncate">
                    {isMint ? (
                      <span className="text-dim/40">—</span>
                    ) : (
                      shortAddr(item.from)
                    )}
                  </p>

                  <p className="font-mono text-[10px] text-neon-cyan truncate">
                    {shortAddr(item.to)}
                  </p>

                  {item.txHash && !isLocalhost ? (
                    <a
                      href={`${etherscanBase}/tx/${item.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] text-neon-purple border border-neon-purple/30 px-2 py-0.5 hover:bg-neon-purple/10 transition-colors whitespace-nowrap"
                    >
                      VIEW ↗
                    </a>
                  ) : (
                    <span className="font-mono text-[9px] text-dim">
                      #{item.blockNumber}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
