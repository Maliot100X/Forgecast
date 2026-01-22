'use client';

import { useEffect, useState, useCallback } from 'react';
import { useFarcasterContext } from '@/components/FarcasterProvider';
import Image from 'next/image';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { Wallet, RefreshCw, LogOut } from 'lucide-react';
import AIChat from '@/components/AIChat';

interface CoinLog {
  args: {
    creator: string;
    coin: string;
    name: string;
    symbol: string;
    timestamp: string;
  };
  transactionHash: string;
}

function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function ProfilePage() {
  const { context, isSDKLoaded } = useFarcasterContext();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  
  const [activeTab, setActiveTab] = useState<'created' | 'holdings'>('created');

  // Fetch created coins
  const { data: createdCoins, isLoading: loadingCreated, refetch: refetchCreated } = useQuery<CoinLog[]>({
    queryKey: ['created-coins', address],
    queryFn: async () => {
      if (!address) return [];
      const res = await fetch(`/api/zora/user?address=${address}`);
      if (!res.ok) throw new Error('Failed to fetch created coins');
      return res.json();
    },
    enabled: !!address,
  });

  // Fetch holdings
  const { data: holdings, isLoading: loadingHoldings, refetch: refetchHoldings } = useQuery<CoinLog[]>({
    queryKey: ['holdings', address],
    queryFn: async () => {
      if (!address) return [];
      const res = await fetch(`/api/zora/holdings?address=${address}`);
      if (!res.ok) throw new Error('Failed to fetch holdings');
      return res.json();
    },
    enabled: !!address,
  });

  const handleSync = useCallback(() => {
    if (address) {
        refetchCreated();
        refetchHoldings();
    }
    // Context is auto-managed by SDK, but we can trigger a visual refresh effect if needed
  }, [address, refetchCreated, refetchHoldings]);

  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const user = context?.user;

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <button 
          onClick={handleSync}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20 transition-colors"
          title="Sync Profile"
        >
          <RefreshCw size={14} />
          Sync Farcaster
        </button>
      </div>
      
      {user ? (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center space-x-4">
            {user.pfpUrl && (
              <Image
                src={user.pfpUrl}
                alt={user.displayName || 'User'}
                width={64}
                height={64}
                className="rounded-full"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold">{user.displayName}</h2>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">Farcaster ID: <span className="font-mono text-foreground">{user.fid}</span></p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-500/10 text-yellow-500 p-4 rounded-lg text-sm">
          Could not load Farcaster profile. Please try refreshing.
        </div>
      )}

      {/* Wallet Section */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Wallet size={18} />
          Wallet Status
        </h3>
        
        {isConnected ? (
          <div className="space-y-3">
             <div className="text-sm text-muted-foreground bg-muted p-2 rounded break-all font-mono">
                {address}
              </div>
              <button
                onClick={() => disconnect()}
                className="flex items-center space-x-2 text-sm text-red-500 hover:text-red-600"
              >
                <LogOut size={14} />
                <span>Disconnect</span>
              </button>
          </div>
        ) : (
          <div className="space-y-3">
             <p className="text-sm text-muted-foreground">Connect a wallet to view assets</p>
             <div className="flex flex-col gap-2">
              {connectors
                .filter(c => c.id === 'farcaster' || c.id === 'coinbaseWalletSDK' || c.id === 'io.metamask' || c.name === 'Coinbase Wallet' || c.name === 'MetaMask')
                // Sort: Farcaster -> Coinbase -> MetaMask
                .sort((a, b) => {
                   const order = { 'farcaster': 1, 'coinbaseWalletSDK': 2, 'io.metamask': 3 };
                   // @ts-ignore
                   return (order[a.id] || 99) - (order[b.id] || 99);
                })
                .map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  className="w-full flex items-center justify-between p-3 bg-secondary/5 hover:bg-secondary/10 rounded-lg transition-colors border border-border"
                >
                  <span className="text-sm font-medium">
                    {connector.name === 'Coinbase Wallet' ? 'Base Mini Wallet' : connector.name}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-secondary/50"></div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {!isConnected ? (
        null 
      ) : (
        <div className="space-y-4">
          <div className="flex space-x-2 border-b border-border pb-1">
            <button
              onClick={() => setActiveTab('created')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === 'created' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Created Coins
              {activeTab === 'created' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('holdings')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === 'holdings' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Holdings
              {activeTab === 'holdings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          </div>

          <div className="space-y-3">
            {activeTab === 'created' ? (
              loadingCreated ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : !createdCoins || createdCoins.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No created coins found.
                </div>
              ) : (
                createdCoins.map((coin) => (
                  <CoinCard key={coin.transactionHash} coin={coin} />
                ))
              )
            ) : (
              loadingHoldings ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : !holdings || holdings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No holdings found.
                </div>
              ) : (
                holdings.map((coin) => (
                  <CoinCard key={coin.transactionHash} coin={coin} />
                ))
              )
            )}
          </div>
        </div>
      )}

      {/* AI Chat Integration */}
      <div className="mt-6">
        <AIChat />
      </div>
    </div>
  );
}

function CoinCard({ coin }: { coin: CoinLog }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">
            {coin.args.name[0]}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{coin.args.name}</h3>
            <p className="text-xs text-muted-foreground">${coin.args.symbol}</p>
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div className="flex items-center space-x-1 justify-end">
            <span>{new Date(Number(coin.args.timestamp) * 1000).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
