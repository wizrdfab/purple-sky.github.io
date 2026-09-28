# Terms and conditions

Version {{termsVersion}}. A draft written from the service's technical design, for a lawyer's review. Not yet in
force. This is a translation; the Spanish version governs.

## 1. Who we are

The service is provided by {{companyName}}, RUT {{companyRut}}, domiciled at {{companyAddress}}, represented by
{{companyRepresentative}} ("PurpleSky", "we"). Contact: {{email}}.

## 2. What the service is

1. PurpleSky is software that, during a period you choose (the "trading period"), trades a Solana wallet that
   **you own** (your "trading wallet"), with an automated strategy that buys and sells tokens.
2. Your trading wallet is created by Privy, a wallet provider, when you sign in with your Phantom wallet. Funds never
   leave a wallet that is yours, except to return to your Phantom or to pay the fee described in section 8.
3. PurpleSky does not receive your funds into accounts of its own, does not hold them and does not pool them with
   other people's. It is not a bank, gives no financial advice or personal recommendations, and promises no return.

## 3. Who may use it

To use the service you must:

1. be 18 or older and able to enter into contracts;
2. use your own funds, of lawful origin;
3. have a Phantom wallet under your control;
4. not be somewhere the service is prohibited, and not act on behalf of someone else.

Until the service opens to the general public, we may limit who can start a period.

## 4. Your trading wallet

1. You own it. You can export its private key at any time from the site; Privy shows it in a window of its own and
   PurpleSky never sees it.
2. We will never ask for your seed phrase or your private key.
3. Your use of Privy and Phantom is also governed by their own terms.

## 5. The permission you give us

1. When you start a period, you authorize, through Privy, our server to sign transactions from your trading wallet
   under a policy created for you alone. The policy:
   - allows buying and selling tokens on a Solana decentralized exchange and paying network fees;
   - allows sending SOL to your Phantom, to PurpleSky's fee wallet, and small network tips;
   - refuses any other transfer and any other program.
2. You can remove the permission from the site when no period is running. If you remove it during a period, the
   trader can no longer sell what is open: those positions are yours to manage, and the period ends.

## 6. The trading period

1. **Length:** {{periodDays}} days, as you choose.
2. **Amounts:** your trading wallet must hold between {{minSol}} and {{maxSol}} SOL at the start. The total across
   everyone is capped (today, {{totalCapSol}} SOL); we may refuse a period when there is no room left.
3. **Starting balance:** the SOL in your trading wallet at the start, which we record and show you.
4. **How it trades:** each trade uses only part of your wallet's free SOL. The trader buys only in its trading
   hours, and may not trade for whole days when nothing meets its rules. We may adjust the
   strategy's parameters; if we change the strategy itself, we will say so before new periods.
5. **Pauses:** we may pause buying on a technical fault, a risk or a legal requirement. A pause does not end your
   period, and you can end it early whenever you like.
6. **Adding SOL during the period:** if you send SOL to your trading wallet during a period, we add it to your
   starting balance: we never charge a fee on your own money.

## 7. Ending early

1. You can end your period at any time with the "End early" button.
2. The trader sells what is open at market price and settles as at the end of the period (section 8), on the profit
   up to that moment.
3. Moving funds out of your trading wallet during a period, by any means other than the trader, counts as ending
   early.

## 8. The end of the period, settlement and the fee

1. At the end of the period, or when you end early, the trader sells the open positions at market price.
2. **Result:** the final balance in SOL minus the starting balance. A token that cannot be sold stays in your
   trading wallet, is yours, and counts as zero in the final balance.
3. **Fee:** only if the result is positive, the share of the profit you chose at the start (at least
   {{feeMinPct}}%). No profit, no fee.
4. **Return:** we send the fee to PurpleSky's fee wallet and all the rest of the SOL to your Phantom. The network
   fees of these transfers come out of your trading wallet.
5. Every settlement is recorded on chain and we show you its transactions. If you see a mistake, write to {{email}}
   and we will look into it; if it was ours, we will correct it.
6. We will issue the tax document that applies to the fee.
7. Part of the fees supports nature causes, as published on the site.

## 9. Risks and no guarantees

1. You can lose part or all of what you put in: in the research, {{lostPct}}% of trades lost money. Read the risk
   disclosure, which is part of these terms.
2. Research or past results do not assure future results. We promise no return.

## 10. Our liability

1. We provide the service with due care and are liable for damage we cause through our own fault or intent,
   including our software's errors in a settlement.
2. We are not liable for the market's own losses, for failures of third parties (the Solana network, Privy, the exchange
   and others), or for what you do with your Phantom, your device or an exported key.
3. Nothing in these terms limits the rights that Chile's consumer protection law (Ley N° 19.496) grants you and that
   cannot be waived.

## 11. Changes to the service and to the terms

1. We may change these terms. Changes apply to periods that start after they are published; a running period keeps
   the version you accepted.
2. We may stop offering new periods. If we must close the service during your period, we will end it and settle it as
   if you had chosen to end early.

## 12. Personal data

We handle your data as the privacy notice on the site describes.

## 13. Communications

We will inform you on the site and, if you gave us a contact, by email or Telegram. Write to us at {{email}}.

## 14. Governing law and complaints

1. These terms are governed by the laws of Chile.
2. You can complain to us directly at {{email}}. You can also turn to the National Consumer Service (SERNAC) and to
   the courts that Ley N° 19.496 provides for.

## 15. Acceptance

You accept these terms by ticking the box before starting a period. We record the version you accepted and the date
and time. You can read, print or save this page at any time at {{siteUrl}}/terms/.
