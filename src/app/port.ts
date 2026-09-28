import { createContext, useContext } from 'react';
import type { WalletPort } from './wallet';

export const PortContext = createContext<WalletPort | null>(null);

export function usePort(): WalletPort {
  const p = useContext(PortContext);
  if (!p) throw new Error('usePort outside a wallet provider');
  return p;
}
