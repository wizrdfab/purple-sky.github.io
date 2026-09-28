import { PrivyProvider, usePrivy, useSigners, type User, type WalletWithMetadata } from '@privy-io/react-auth';
import {
  toSolanaWalletConnectors,
  useExportWallet,
  useSignAndSendTransaction,
  useWallets,
  type ConnectedStandardSolanaWallet,
} from '@privy-io/react-auth/solana';
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { config, solanaRpcUrl, solanaRpcWsUrl } from '../config';
import { PortContext } from './port';
import { balanceOf, base58, confirmSignature, rpcClient, transferTx } from './solana';
import type { WalletPort } from './wallet';

// The real wallet: Privy's React SDK (docs.privy.io, @privy-io/react-auth 3.x).
// - Login: Privy's modal, wallet only, Phantom only; the embedded Solana wallet is created on login for every user.
// - Our server's access: useSigners().addSigners with the key quorum and policy the API returns.
// - Sends: the connected wallets' signAndSendTransaction; the embedded wallet asks its owner in Privy's window.

const CHAIN = 'solana:mainnet' as const;
const connectors = toSolanaWalletConnectors();

function isEmbedded(a: { walletClientType?: string }): boolean {
  return a.walletClientType === 'privy' || a.walletClientType === 'privy-v2';
}

/** The person's Phantom (the login wallet) and embedded trading wallet, from Privy's user record. */
export function walletsOf(user: User | null): { phantom: WalletWithMetadata | null; trading: WalletWithMetadata | null } {
  const sol = (user?.linkedAccounts ?? []).filter(
    (a): a is WalletWithMetadata => a.type === 'wallet' && a.chainType === 'solana',
  );
  const external = sol.filter((a) => !isEmbedded(a));
  return {
    phantom: external.find((a) => a.walletClientType === 'phantom') ?? external[0] ?? null,
    trading: sol.find(isEmbedded) ?? null,
  };
}

function Bridge({ children }: { children: ReactNode }) {
  const privy = usePrivy();
  const { wallets } = useWallets();
  const { addSigners, removeSigners } = useSigners();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const { exportWallet } = useExportWallet();
  const rpc = useMemo(() => rpcClient(solanaRpcUrl()), []);
  const [slow, setSlow] = useState(false);
  const { ready, authenticated } = privy;
  const userId = privy.user?.id ?? null;

  useEffect(() => {
    if (privy.ready) return;
    const t = setTimeout(() => setSlow(true), 20_000);
    return () => clearTimeout(t);
  }, [privy.ready]);

  const { phantom, trading } = walletsOf(privy.user);
  const phantomAddr = phantom?.address ?? null;
  const tradingAddr = trading?.address ?? null;
  const delegated = Boolean(trading?.delegated);
  const error = privy.error?.message ?? (slow && !privy.ready ? 'timeout' : null);

  // Privy's hooks hand back new objects as it re-renders. The port the screens depend on must change only when what
  // they show changes, or every Privy render would re-read the API and the balances. So the methods read the latest
  // hooks through a ref, and the port is rebuilt only on the values below.
  const latest = useRef({ privy, wallets, addSigners, removeSigners, signAndSendTransaction, exportWallet });
  latest.current = { privy, wallets, addSigners, removeSigners, signAndSendTransaction, exportWallet };

  const port = useMemo<WalletPort>(() => {
    async function send(fromAddr: string | null, toAddr: string | null, amount: bigint): Promise<string> {
      if (!fromAddr || !toAddr) throw new Error('wallet not ready');
      const wallet: ConnectedStandardSolanaWallet | undefined = latest.current.wallets.find((w) => w.address === fromAddr);
      if (!wallet) {
        // Phantom is not connected in this tab (a reload): ask Privy to reconnect it.
        latest.current.privy.connectWallet({ walletChainType: 'solana-only', walletList: ['phantom'] });
        throw new Error('reconnect Phantom, then try again');
      }
      const tx = await transferTx(rpc, fromAddr, toAddr, amount);
      const { signature } = await latest.current.signAndSendTransaction({ transaction: tx, wallet, chain: CHAIN });
      return base58(signature);
    }
    const needTrading = () => {
      if (!tradingAddr) throw new Error('no trading wallet yet');
      return tradingAddr;
    };

    return {
      kind: 'privy',
      ready,
      error,
      authenticated,
      userId,
      phantom: phantomAddr,
      trading: tradingAddr,
      delegated,
      login: () => latest.current.privy.login(),
      logout: () => latest.current.privy.logout(),
      getAccessToken: () => latest.current.privy.getAccessToken(),
      addSigner: async (signerId, policyId) => {
        await latest.current.addSigners({ address: needTrading(), signers: [{ signerId, policyIds: [policyId] }] });
      },
      removeSigners: async () => {
        await latest.current.removeSigners({ address: needTrading() });
      },
      sendFromPhantom: (amount) => send(phantomAddr, tradingAddr, amount),
      sendFromTrading: (amount) => send(tradingAddr, phantomAddr, amount),
      exportKey: async () => {
        await latest.current.exportWallet({ address: needTrading() });
      },
      balance: (addr) => balanceOf(rpc, addr),
      confirm: (sig) => confirmSignature(rpc, sig),
    };
  }, [ready, error, authenticated, userId, phantomAddr, tradingAddr, delegated, rpc]);

  return <PortContext.Provider value={port}>{children}</PortContext.Provider>;
}

export default function PrivyWallet({ children }: { children: ReactNode }) {
  const solanaRpcs = useMemo(
    () => ({
      [CHAIN]: {
        rpc: createSolanaRpc(solanaRpcUrl()),
        rpcSubscriptions: createSolanaRpcSubscriptions(solanaRpcWsUrl()),
        blockExplorerUrl: 'https://solscan.io',
      },
    }),
    [],
  );
  const site = config.siteUrl.replace(/\/+$/, '');
  return (
    <PrivyProvider
      appId={config.privyAppId}
      clientId={config.privyClientId || undefined}
      config={{
        loginMethods: ['wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#8b5cf6',
          landingHeader: 'PurpleSky',
          walletChainType: 'solana-only',
          walletList: ['phantom'],
          showWalletLoginFirst: true,
        },
        externalWallets: { solana: { connectors } },
        embeddedWallets: { solana: { createOnLogin: 'all-users' } },
        solana: { rpcs: solanaRpcs },
        legal: { termsAndConditionsUrl: `${site}/terms/`, privacyPolicyUrl: `${site}/privacy/` },
      }}
    >
      <Bridge>{children}</Bridge>
    </PrivyProvider>
  );
}
