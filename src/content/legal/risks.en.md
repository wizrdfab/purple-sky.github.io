# Risk disclosure

Version {{termsVersion}}. A draft written from the service's technical design, for a lawyer's review. This is a
translation; the Spanish version governs.

> **The essentials.** You can lose part or all of the SOL you put in your trading wallet. In the research,
> {{lostPct}}% of trades lost money and {{daysDown}} of {{researchDays}} days ended down. A day, a week or a whole
> trading period can end down. There are no promised returns, no insurance and no guarantee of any kind. Only use
> money you can afford to lose entirely.

## 1. The strategy is new and its record is short

- The results we publish are **research** on 17 to 27 September 2026: {{researchDays}} days of data. That is a
  small sample. This is why we show each average with its 95% interval, and even that interval may not cover what
  happens next.
- The research simulates real trading, but it is not real trading. The live record began on
  28 September 2026 with the founder's own wallet and is still short.
- Markets change. A rule that worked on those days can stop working without warning, for example if the market's
  behaviour changes, or if other traders copy the same idea.

## 2. What the research numbers show

- {{lostPct}}% of trades lost money.
- About {{bigLossPct}}% of trades lost more than {{bigLossOverPct}}% of what they put in. A single trade can lose a
  large part of what it put in, and several losses in a row can leave a period down.
- {{daysDown}} of the {{researchDays}} days ended down.
- These figures come from few days of data: reality can be worse.
- Liquidity can be thin: selling can move the price against you, and in extreme cases a token may not be sellable
  at all. A token that cannot be sold stays in your trading wallet and is yours.

## 3. Execution on the network

- Time passes between each decision and its transaction, during which the price can move: a trade can fill at a
  worse price than expected.
- Other traders can front-run your orders (MEV, "sandwiches").
- Every trade pays Solana network fees and the exchange's fees. With small amounts, these fees weigh more.
- A transaction can fail, land late or never confirm. The Solana network can become congested or halt.

## 4. Technology and third parties

- **Our software can have bugs.** We test it, but no software is free of faults. A bug could cause wrong buys or
  sales, or a sale that does not happen in time.
- The service depends on third parties we do not control: Privy (the wallets and the sign-in), network access and
  market data providers, the exchange it trades on, our server provider and GitHub (this site). If any of them fails or changes its terms, the service may stop or get worse.
- **The permission you give us has limits, but it is not perfect.** The policy that Privy enforces only allows
  buying and selling tokens on a Solana decentralized exchange and sending SOL to your Phantom, to PurpleSky's fee wallet and to small network tips. It does
  not allow sending funds to any other address. Even so, if someone took control of our server or of its key, they
  could trade your wallet badly or send SOL to PurpleSky's fee wallet. Nor can the policy check that the fee is
  computed correctly; our software does that, and every settlement is on chain for you to check.

## 5. On your side

- Your Phantom and your device are your responsibility. We will never ask for your seed phrase or your private key.
  Distrust anyone who does so in our name.
- If you export your trading wallet's key, keep it as you would keep cash.
- Moving funds out of your trading wallet during a period ends it early. Removing PurpleSky's permission during a
  period stops the trader from selling what is open; those positions are then yours to manage.

## 6. Legal and regulatory risk

- The service is under legal review in Chile. It opens to other people only after that review, and the rules can
  change. We might have to modify, pause or close it. If that happens during your period, we will end it and settle
  it as if you had chosen to end early.
- Crypto assets are not legal tender in Chile, and the service has no state guarantee or insurance.
- Your tax obligations on any gains are yours. Ask an adviser if in doubt.

## 7. How much to put in

Only what you could lose entirely without it affecting your life. The minimum is {{minSol}} SOL and the maximum
{{maxSol}} SOL per person. The low maximum is deliberate.

Questions? Write to {{email}}.
