// What the button needs from a wallet provider. Privy implements it for real (privyWallet.tsx); the demo implements
// it with nothing real behind it (demo.ts). The screens only see this interface.

export interface WalletPort {
  kind: 'privy' | 'demo';
  /** The provider has loaded (Privy's `ready`). */
  ready: boolean;
  /** The provider failed to load. */
  error: string | null;
  authenticated: boolean;
  userId: string | null;
  /** The Phantom the person signed in with: where everything returns. */
  phantom: string | null;
  /** The person's embedded Solana wallet: the trading wallet. */
  trading: string | null;
  /** The trading wallet has a signer on it (Privy's `delegated`). */
  delegated: boolean;
  login(): void;
  logout(): Promise<void>;
  getAccessToken(): Promise<string | null>;
  /** Adds our server's signer, limited by the person's policy. */
  addSigner(signerId: string, policyId: string): Promise<void>;
  /** Removes every signer: only the person can then move the wallet. */
  removeSigners(): Promise<void>;
  /** Phantom signs and sends a SOL transfer to the trading wallet. Returns the signature (base58). */
  sendFromPhantom(lamports: bigint): Promise<string>;
  /** The trading wallet signs and sends SOL to the Phantom. Returns the signature (base58). */
  sendFromTrading(lamports: bigint): Promise<string>;
  /** Opens Privy's export screen for the trading wallet's key. */
  exportKey(): Promise<void>;
  balance(address: string): Promise<bigint>;
  /** Resolves once the signature is confirmed; throws if it failed or timed out. */
  confirm(signature: string): Promise<void>;
}

/** A user closing the wallet's window is not an error worth a red box. */
export function isUserRejection(e: unknown): boolean {
  const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();
  return /user rejected|rejected the request|user denied|user cancel|cancelled|canceled|exited|closed the modal|4001/.test(msg);
}

export function messageOf(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}
