import { useState } from 'react';
import { EthDiamond } from './components/EthDiamond';
import { GasTicker } from './components/GasTicker';
import { MintModal } from './components/MintModal';
import { WalletModal } from './components/WalletModal';
import { useWallet } from './web3/hooks/useWallet';
import { useNFTForge } from './web3/hooks/useNFTForge';
import { useNFTMarket } from './web3/hooks/useNFTMarket';
import { useWishlist } from './hooks/useWishlist';
import { ExplorePage } from './pages/ExplorePage';
import { CollectionsPage } from './pages/CollectionsPage';
import { StatsPage } from './pages/StatsPage';
import { ActivityPage } from './pages/ActivityPage';
import { CONTRACT_ADDRESS } from './web3/config';

type Page = 'explore' | 'collections' | 'stats' | 'activity';

const NAV_ITEMS: { id: Page; label: string }[] = [
  { id: 'explore',     label: 'Explore'     },
  { id: 'collections', label: 'Collections' },
  { id: 'stats',       label: 'Stats'       },
  { id: 'activity',    label: 'Activity'    },
];

export function App() {
  const [page, setPage] = useState<Page>('explore');
  const [showMintModal, setShowMintModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { account, connected, connecting, disconnect, isWrongNetwork, switchToSepolia } = useWallet();
  const { totalSupply, userBalance } = useNFTForge();
  const { nfts, loading, refetch } = useNFTMarket();
  const { count: wishlistCount } = useWishlist();

  const shortAccount = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : null;

  const handleMintClick = () => {
    if (!connected) setShowWalletModal(true);
    else setShowMintModal(true);
  };

  const navigate = (p: Page) => {
    setPage(p);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="min-h-screen bg-void text-white font-syne"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0,245,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.025) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    >
      <header className="sticky top-0 z-50 bg-void/95 backdrop-blur-xl border-b border-white/10">
        {isWrongNetwork && (
          <div className="bg-neon-pink/10 border-b border-neon-pink/30 px-6 py-2 flex items-center justify-between gap-4">
            <p className="font-mono text-[11px] text-neon-pink tracking-widest">
              Wrong network — switch to Ethereum Sepolia to continue
            </p>
            <button
              onClick={switchToSepolia}
              className="font-mono text-[10px] text-neon-pink border border-neon-pink/40 px-3 py-1 hover:bg-neon-pink/10 transition-colors cursor-pointer flex-shrink-0"
            >
              SWITCH TO SEPOLIA
            </button>
          </div>
        )}
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-4">

          <button
            onClick={() => navigate('explore')}
            className="flex items-center gap-3 flex-shrink-0 cursor-pointer group"
          >
            <div className="relative">
              <EthDiamond className="w-8 h-8 text-neon-cyan transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 blur-md opacity-40 group-hover:opacity-70 transition-opacity">
                <EthDiamond className="w-8 h-8 text-neon-cyan" />
              </div>
            </div>
            <div>
              <p className="font-orbitron text-base font-black tracking-widest bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent leading-none">
                NFTFORGE
              </p>
              <p className="font-mono text-[8px] text-dim tracking-widest">NFT ON ETHEREUM</p>
            </div>
          </button>

          <nav className="hidden lg:flex items-center h-full">
            {NAV_ITEMS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => navigate(id)}
                className={`
                  relative h-full px-5 font-mono text-xs tracking-widest uppercase
                  transition-all duration-200 cursor-pointer
                  ${page === id
                    ? 'text-neon-cyan after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-neon-cyan'
                    : 'text-white/50 hover:text-white/80 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-neon-cyan after:scale-x-0 after:transition-transform hover:after:scale-x-100'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 flex-shrink-0">
            {wishlistCount > 0 && (
              <div className="relative hidden sm:block">
                <button className="w-9 h-9 flex items-center justify-center border border-neon-pink/30 text-neon-pink hover:bg-neon-pink/10 transition-colors cursor-pointer font-mono text-base">
                  ♥
                </button>
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-neon-pink text-void font-orbitron text-[9px] font-black flex items-center justify-center">
                  {wishlistCount}
                </span>
              </div>
            )}

            {connected && (
              <button
                onClick={handleMintClick}
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-neon-cyan to-neon-purple text-void font-orbitron text-[10px] font-black tracking-widest px-4 py-2 uppercase cursor-pointer transition-all hover:shadow-neon-cyan hover:-translate-y-px [clip-path:polygon(6px_0%,100%_0%,calc(100%-6px)_100%,0%_100%)]"
              >
                + MINT
              </button>
            )}

            {connected && shortAccount ? (
              <div className="flex items-center gap-2">
                {userBalance !== null && userBalance > 0n && (
                  <span className="hidden md:block font-mono text-2xs text-dim/80 tracking-widest border border-white/8 px-2 py-1">
                    {Number(userBalance)} NFT{Number(userBalance) !== 1 ? 's' : ''}
                  </span>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-neon-cyan/5 border border-neon-cyan/25">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                  <span className="font-mono text-xs text-neon-cyan tracking-wide">{shortAccount}</span>
                </div>
                <button
                  onClick={disconnect}
                  className="hidden sm:block font-mono text-[9px] text-dim border border-white/10 px-2 py-1.5 hover:border-neon-pink/40 hover:text-neon-pink transition-colors cursor-pointer"
                >
                  DISCONNECT
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                disabled={connecting}
                className="flex items-center gap-2 bg-gradient-to-r from-neon-cyan to-neon-purple text-void font-orbitron text-[10px] font-black tracking-widest px-5 py-2.5 uppercase cursor-pointer disabled:opacity-60 transition-all hover:shadow-neon-cyan hover:-translate-y-px [clip-path:polygon(6px_0%,100%_0%,calc(100%-6px)_100%,0%_100%)]"
              >
                <EthDiamond className="w-3.5 h-3.5" />
                {connecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex flex-col gap-1 p-2 cursor-pointer"
            >
              <span className={`w-5 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`w-5 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`w-5 h-0.5 bg-white transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-void-card border-t border-white/10">
            {NAV_ITEMS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => navigate(id)}
                className={`w-full text-left px-6 py-4 font-mono text-sm tracking-widest uppercase border-b border-white/5 transition-colors cursor-pointer ${
                  page === id ? 'text-neon-cyan bg-neon-cyan/5' : 'text-white/60 hover:text-white hover:bg-white/3'
                }`}
              >
                {label}
              </button>
            ))}
            {connected && (
              <button
                onClick={() => { handleMintClick(); setMobileMenuOpen(false); }}
                className="w-full text-left px-6 py-4 font-mono text-sm tracking-widest uppercase text-neon-purple border-b border-white/5 cursor-pointer hover:bg-neon-purple/5 transition-colors"
              >
                + MINT NFT
              </button>
            )}
          </div>
        )}

        <GasTicker />
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {page === 'explore' && (
          <ExplorePage
            totalSupply={totalSupply}
            connected={connected}
            onMintClick={handleMintClick}
            nfts={nfts}
            loading={loading}
            onRefresh={refetch}
          />
        )}
        {page === 'collections' && (
          <CollectionsPage
            nfts={nfts}
            loading={loading}
            onMintClick={handleMintClick}
            onConnectClick={() => setShowWalletModal(true)}
            onRefresh={refetch}
          />
        )}
        {page === 'stats' && <StatsPage nfts={nfts} />}
        {page === 'activity' && <ActivityPage />}
      </main>

      <footer className="border-t border-white/5 bg-void-card/50 mt-16">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <EthDiamond className="w-8 h-8 text-neon-cyan" />
                  <div className="absolute inset-0 blur-sm opacity-50"><EthDiamond className="w-8 h-8 text-neon-cyan" /></div>
                </div>
                <span className="font-orbitron text-xl font-black tracking-widest bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                  NFTFORGE
                </span>
              </div>
              <p className="font-mono text-xs text-dim/80 leading-relaxed max-w-xs mb-5">
                Create, mint, and explore NFTs directly on Ethereum.
                Every transaction is secured on-chain with no intermediaries.
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-neon-green/5 border border-neon-green/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                  <span className="font-mono text-[10px] text-neon-green tracking-widest">LIVE ON-CHAIN</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-neon-purple/5 border border-neon-purple/20">
                  <EthDiamond className="w-3 h-3 text-neon-purple" />
                  <span className="font-mono text-[10px] text-neon-purple tracking-widest">ERC-721</span>
                </div>
              </div>
            </div>

            <div>
              <p className="font-mono text-[10px] text-neon-cyan tracking-widest mb-4 uppercase">Navigate</p>
              <ul className="space-y-2.5">
                {NAV_ITEMS.map(({ id, label }) => (
                  <li key={id}>
                    <button
                      onClick={() => navigate(id)}
                      className={`font-mono text-xs tracking-wide transition-colors cursor-pointer hover:text-neon-cyan ${
                        page === id ? 'text-neon-cyan' : 'text-dim/80'
                      }`}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-mono text-[10px] text-neon-cyan tracking-widest mb-4 uppercase">Contract</p>
              <ul className="space-y-2.5">
                <li>
                  <p className="font-mono text-[9px] text-dim tracking-widest mb-0.5">ADDRESS</p>
                  <p className="font-mono text-[10px] text-white/70 break-all">
                    {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}
                  </p>
                </li>
                <li className="pt-1">
                  <button
                    onClick={() => navigator.clipboard.writeText(CONTRACT_ADDRESS)}
                    className="font-mono text-[10px] text-neon-purple border border-neon-purple/30 px-3 py-1 hover:bg-neon-purple/10 transition-colors cursor-pointer"
                  >
                    COPY ADDRESS
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-wrap justify-between items-center gap-4">
            <p className="font-mono text-[10px] text-dim/60 tracking-widest">
              © 2024 NFTFORGE — ALL RIGHTS RESERVED
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {[
                { label: 'ERC-721', color: 'text-neon-cyan' },
                { label: 'IPFS STORAGE', color: 'text-neon-purple' },
                { label: 'ON-CHAIN', color: 'text-neon-green' },
              ].map(({ label, color }) => (
                <span key={label} className={`font-mono text-[10px] tracking-widest ${color}`}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {showMintModal && (
        <MintModal onClose={() => setShowMintModal(false)} onMinted={() => { refetch(); setPage('explore'); }} />
      )}
      {showWalletModal && <WalletModal onClose={() => setShowWalletModal(false)} />}
    </div>
  );
}

export default App;
