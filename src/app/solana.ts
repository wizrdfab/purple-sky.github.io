import {
  address,
  appendTransactionMessageInstructions,
  compileTransaction,
  createNoopSigner,
  createSolanaRpc,
  createTransactionMessage,
  getBase58Decoder,
  getTransactionEncoder,
  lamports,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  signature as toSignature,
} from '@solana/kit';
import { getTransferSolInstruction } from '@solana-program/system';

/** A signature as Solana's explorers and RPCs spell it. */
export function base58(bytes: Uint8Array): string {
  return getBase58Decoder().decode(bytes);
}

export function rpcClient(url: string) {
  return createSolanaRpc(url);
}

type Rpc = ReturnType<typeof rpcClient>;

export async function balanceOf(rpc: Rpc, owner: string): Promise<bigint> {
  const { value } = await rpc.getBalance(address(owner), { commitment: 'confirmed' }).send();
  return BigInt(value);
}

/** An unsigned v0 transfer of SOL, ready for a wallet to sign and send. */
export async function transferTx(rpc: Rpc, from: string, to: string, amount: bigint): Promise<Uint8Array> {
  const { value: blockhash } = await rpc.getLatestBlockhash({ commitment: 'confirmed' }).send();
  const ix = getTransferSolInstruction({
    source: createNoopSigner(address(from)),
    destination: address(to),
    amount: lamports(amount),
  });
  return pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayer(address(from), m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(blockhash, m),
    (m) => appendTransactionMessageInstructions([ix], m),
    (m) => compileTransaction(m),
    (tx) => new Uint8Array(getTransactionEncoder().encode(tx)),
  );
}

/** Polls until the signature is confirmed. A failed transaction or a minute without news throws. */
export async function confirmSignature(rpc: Rpc, sig: string, timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const { value } = await rpc.getSignatureStatuses([toSignature(sig)]).send();
    const st = value[0];
    if (st?.err) throw new Error(`transaction failed: ${JSON.stringify(st.err, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))}`);
    if (st && (st.confirmationStatus === 'confirmed' || st.confirmationStatus === 'finalized')) return;
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error('not confirmed within a minute: check the transaction on Solscan before trying again');
}

/** The network's base fee for a one-signature transaction. */
export const BASE_FEE_LAMPORTS = 5000n;

export function explorerTx(sig: string): string {
  return `https://solscan.io/tx/${sig}`;
}

export function explorerAccount(addr: string): string {
  return `https://solscan.io/account/${addr}`;
}
