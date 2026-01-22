'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import sdk from '@farcaster/miniapp-sdk';

type FrameContext = Awaited<typeof sdk.context>;

interface FarcasterContextType {
  context: FrameContext | undefined;
  isSDKLoaded: boolean;
}

const FarcasterContext = createContext<FarcasterContextType>({
  context: undefined,
  isSDKLoaded: false,
});

export const useFarcasterContext = () => useContext(FarcasterContext);

export function FarcasterProvider({ children }: { children: React.ReactNode }) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();

  useEffect(() => {
    const load = async () => {
      const ctx = await sdk.context;
      setContext(ctx);
      sdk.actions.ready();
      setIsSDKLoaded(true);
    };
    if (sdk && !isSDKLoaded) {
      load();
    }
  }, [isSDKLoaded]);

  return (
    <FarcasterContext.Provider value={{ context, isSDKLoaded }}>
      {children}
    </FarcasterContext.Provider>
  );
}
