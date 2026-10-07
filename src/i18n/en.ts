import { config } from '../config';
import { RESEARCH, RISK } from '../content/facts';
import { date, num, pct, sol } from '../format';
import type { Dict } from './es';

// Words: "trading period", "end early", "your wallet". Never "deposit" or "lock", and no promised returns.

const L = 'en' as const;
const d = config.defaults;
const n = RESEARCH.strategy;
const noYear = (iso: string) => date(iso, L).replace(', 2026', '');

export const en: Dict = {
  lang: {
    code: 'en',
    other: 'ES',
    otherLabel: 'Leer en castellano',
  },
  skip: 'Skip to content',
  nav: {
    how: 'How it works',
    numbers: 'Results',
    risks: 'Risks',
    fees: 'Fee',
    about: 'About',
    app: 'Start',
    menu: 'Menu',
  },
  hero: {
    kicker: 'Solana · a wallet that is yours',
    title: 'Your wallet, traded for a period you choose.',
    lead:
      'PurpleSky runs a Solana trading strategy on a wallet that belongs to you. ' +
      `You choose how much (${num(d.perPersonMinSol, L)} to ${num(d.perPersonMaxSol, L)} SOL) and for how long. ` +
      'At the end, everything goes back to your Phantom. You can end early whenever you like.',
    cta: 'Start',
    ctaWaitlist: 'Join the waitlist',
    ctaRisks: 'Read the risks first',
    waitlistNote:
      "The test run on the founder's own funds was successful. " +
      'For now we open only to people invited privately. You can sign up and we will let you know.',
    openNote:
      "The test run on the founder's own funds was successful. " +
      'We are opening step by step, starting with people invited privately.',
  },
  risk: {
    title: 'First of all: the risks',
    items: [
      'You can lose part or all of what you put in.',
      `In the research, ${RISK.lostPct}% of trades lost money, and about ${RISK.bigLossPct}% lost more than ${RISK.bigLossOverPct}% of what they put in.`,
      `${RISK.daysDown} of the ${RISK.days} research days ended down. A day, a week or a whole trading period can end down.`,
      `The strategy is new: ${n.sessions} days of research, and a live record that began on ${date(RESEARCH.liveSince, L)}.`,
      'This is not financial advice, and not a regulated investment product. There are no promised returns and no insurance of any kind.',
      'Only use money you can afford to lose entirely.',
    ],
    more: 'Read the full risk disclosure',
  },
  how: {
    title: 'How it works',
    lead: 'One button, five steps. Your funds never leave a wallet that is yours.',
    steps: [
      {
        title: 'You connect Phantom',
        body:
          'You sign in by signing a message with Phantom (it moves no funds). A trading wallet is created in your ' +
          'name, with Privy. It is yours: you can export its private key whenever you want.',
      },
      {
        title: `You put in ${num(d.perPersonMinSol, L)} to ${num(d.perPersonMaxSol, L)} SOL`,
        body:
          `You move SOL from Phantom to your trading wallet. For now, the total across everyone is capped at ${num(d.totalCapSol, L)} SOL.`,
      },
      {
        title: 'You choose the period and your fee',
        body:
          `${d.periodDays.join(' or ')} days. The fee is a share of the profit, at the end: at least ${d.feeMinPct}%, ` +
          'more if you wish. No profit, no fee.',
      },
      {
        title: 'You grant a narrow permission',
        body:
          'Our server may trade your wallet during the period, under a policy that Privy enforces: buys and sales ' +
          'on a Solana decentralized exchange, and transfers only back to your Phantom, plus the fee to ours.',
      },
      {
        title: 'At the end, everything comes back',
        body:
          'When the period ends, or when you end it early, the trader sells what is open and sends everything to ' +
          'your Phantom, less the fee if there was a profit. Automatically.',
      },
    ],
    policyTitle: 'What the permission allows, and what it does not',
    policyAllows: [
      'Buying and selling tokens on a Solana decentralized exchange, and paying network fees.',
      'Sending SOL to your Phantom.',
      "Sending the fee to PurpleSky's wallet at settlement.",
    ],
    policyDenies: ['Sending SOL or tokens to any other address.', 'Using any other Solana program.'],
    policyNote:
      'The policy limits where money can go; it cannot check that the fee is computed correctly. Our software does ' +
      'that, and every settlement is on chain for you to verify.',
    controlTitle: 'You stay in control',
    control: [
      'End early, at any time.',
      "Remove PurpleSky's permission when no period is running.",
      "Export your trading wallet's private key.",
    ],
    strategyTitle: 'The strategy, plainly',
    strategy: [
      'It buys and sells Solana tokens automatically, by its own rules.',
      "Each trade uses only part of your wallet's balance, never all of it.",
    ],
  },
  numbers: {
    title: 'What the strategy has shown',
    lead:
      `Research on ${noYear(RESEARCH.dataFrom)} to ${date(RESEARCH.dataTo, L)}, simulating real trading, fees ` +
      'included. The range is the 95% interval.',
    perTrade: 'per trade, on average',
    range: (lo: number, hi: number) => `95% interval: ${pct(lo, L)} to ${pct(hi, L)}`,
    research: {
      label: `Research · live since ${noYear(RESEARCH.liveSince)}`,
      details: `${n.trades} trades over ${n.sessions} days · ${n.wonPct}% won · ${n.sessionsPositive} of ${n.sessions} days positive`,
    },
    live: {
      label: 'Live record',
      empty:
        `It began on ${date(RESEARCH.liveSince, L)} with the founder's own wallet. We will publish it here as it ` +
        'grows, good or bad.',
      stats: (trades: number, mean: number, won: number | null, since: string) =>
        `${trades} trades since ${date(since, L)} · average ${pct(mean, L)}` + (won === null ? '' : ` · ${num(won, L, 0)}% won`),
      updated: (when: string) => `Updated: ${when}`,
    },
    caveatsTitle: 'What these numbers are, and what they are not',
    caveats: [
      `They cover ${n.sessions} days of data. That is little: the interval is wide and the future can differ.`,
      'An average per trade is not what your wallet earns: each trade uses only part of the balance, so it moves the ' +
        'wallet far less than the trade itself, and before network costs.',
      `They are averages: ${RISK.lostPct}% of trades lost money in the research.`,
      'None of this is a promise or a forecast.',
    ],
  },
  fees: {
    title: 'The fee, and where it goes',
    items: [
      "We charge only if you gain: a share of the period's profit, at the end. No profit, no fee.",
      `The minimum is ${d.feeMinPct}%. You may choose to give more.`,
      'If you end early, the fee is computed on the profit up to that moment.',
    ],
    exampleTitle: 'Illustrative examples, not expectations',
    exampleWin:
      `You start with ${sol(0.3, L)} and the period ends with ${sol(0.36, L)}: the profit is ${sol(0.06, L)}; at ` +
      `${d.feeMinPct}%, the fee is ${sol(0.006, L)} and you receive ${sol(0.354, L)}.`,
    exampleLoss: `You start with ${sol(0.3, L)} and it ends with ${sol(0.25, L)}: there is no fee and you receive ${sol(0.25, L)}.`,
    costs: "Trades also pay Solana's network fees and the exchange's. They are already deducted in the results above.",
    causesTitle: 'Nature causes',
    causes:
      'Part of the fees supports nature causes. Before opening to other people we will publish here the causes, the ' +
      'share of each fee they receive, and every donation with its transaction.',
  },
  ideas: {
    title: 'Long-term ideas',
    items: [
      'Raise the caps only when the live results match the research.',
      'Add strategies only if they pass the same tests: hypotheses written down first, tested on data not used to form them.',
      'Publish the full live record, losses included.',
    ],
    note: 'These are ideas, not commitments.',
  },
  about: {
    title: 'About',
    founder:
      "PurpleSky is one person's project in Chile: a trader with thousands of hours of market experience, who has " +
      'followed blockchain technology since its early days. A Chilean SpA runs it; its details are in the terms.',
    contact: 'Write to us',
    builtTitle: 'How it was built',
    built: [
      'First, research on historical data, with hypotheses written down before they were tested.',
      'Then, simulated trading.',
      `Since ${noYear(RESEARCH.liveSince)}, the founder's own funds.`,
    ],
  },
  footer: {
    rights: 'PurpleSky, part of FL Org.',
    notAdvice: 'Nothing on this site is financial advice. You can lose everything you put in.',
    risks: 'Risks',
    terms: 'Terms',
    privacy: 'Privacy',
    draft: 'The terms, the risks and the privacy notice are drafts under legal review.',
  },
  doc: {
    draft: 'DRAFT for legal review. Not yet in force.',
    back: 'Back to the home page',
    otherLang: 'This is a translation. The Spanish version governs.',
    loading: 'Loading…',
  },
  notFound: {
    title: 'This page does not exist',
    back: 'Go to the home page',
  },
  app: {
    title: 'Your trading period',
    demoBanner: 'DEMO: nothing here is real. No real wallets, funds or trades; the numbers are made up.',
    demoExit: 'Leave the demo',
    notConfigured: 'The button is not connected yet. Meanwhile, you can walk through the flow in the demo.',
    openDemo: 'Open the demo',
    signUpByContact: 'To sign up now, write to us or join our Telegram:',
    loading: 'Loading…',
    loadFailed: 'We could not load the sign-in. Reload the page; if it keeps failing, write to us.',
    apiDown: 'We cannot reach the server right now. Your funds are not affected. Try again in a few minutes.',
    retry: 'Try again',
    logout: 'Sign out',
    cancelled: 'You cancelled the signature.',
    failed: (msg: string) => `Something went wrong: ${msg}`,
    connect: {
      title: 'Connect your Phantom',
      body: 'You sign in by signing a message with Phantom; it moves no funds. A trading wallet that is yours is created.',
      button: 'Connect Phantom',
      mobile: "On a phone, open this page inside the Phantom app's browser.",
    },
    wallets: {
      phantom: 'Your Phantom',
      trading: 'Your trading wallet',
      creating: 'Creating your trading wallet…',
      copy: 'Copy',
      copied: 'Copied',
      explorer: 'View on Solscan',
    },
    waitlist: {
      title: 'We are not open to other people yet',
      body:
        "Before trading anyone else's money we wait for a lawyer's review and a clean test run on the founder's own " +
        'funds. Sign up and we will let you know when it opens.',
      amount: 'How much would you put in? (SOL)',
      days: 'Period',
      fee: 'Fee on the profit',
      contact: 'Email or Telegram username (optional)',
      risks: 'I have read the risks: I could lose part or all of it.',
      submit: 'Sign me up',
      done: 'Done: you are on the list. We will let you know when it opens.',
      doneFallback: 'Your sign-in is recorded. We will announce the opening on Telegram and X.',
      demo: 'See the whole flow in the demo (nothing real)',
    },
    steps: ['Risks and terms', 'Your trading wallet', 'Period and fee', 'Authorize and start'],
    terms: {
      title: 'The risks and the terms',
      summary: [
        'You can lose part or all of the SOL you put in your trading wallet.',
        'During the period, our server trades that wallet under a policy: token trades only, and SOL only back to your Phantom, plus the fee to ours.',
        'You can end early whenever you like: the trader sells what is open and returns everything, less the fee if there was a profit.',
        'There are no promised returns. Past or research results assure nothing.',
      ],
      readRisks: 'Risk disclosure',
      readTerms: 'Terms',
      readPrivacy: 'Privacy',
      checkRisk: 'I understand I can lose part or all of the SOL I put in the trading wallet.',
      checkTerms: (v: string) => `I have read and accept the terms (version ${v}) and the privacy notice.`,
      checkAge: 'I am 18 or older.',
      continue: 'Continue',
    },
    fund: {
      title: 'Your trading wallet',
      balance: "Your trading wallet's balance",
      phantomBalance: 'Balance in your Phantom',
      range: (min: number, max: number) => `To start, your trading wallet must hold between ${sol(min, L)} and ${sol(max, L)}.`,
      totalLeft: (x: number) => `Room left across everyone: ${sol(x, L)}.`,
      amount: 'SOL to move from Phantom',
      after: (x: number) => `Your trading wallet will hold ${sol(x, L)}.`,
      send: 'Move from Phantom',
      signing: 'Waiting for your signature…',
      confirming: 'Confirming on the network…',
      ok: 'Your trading wallet is within the limits.',
      tooMuch: (x: number) => `Your trading wallet holds more than the limit. Send ${sol(x, L)} back to Phantom to start.`,
      returnExcess: 'Send the excess back to Phantom',
      errLow: (min: number) => `That would leave you under the ${sol(min, L)} minimum.`,
      errHigh: (max: number) => `That would take you over the ${sol(max, L)} maximum.`,
      errPhantom: 'Not enough SOL in Phantom (leave a little for the network fee).',
      errFull: 'There is no room left across everyone for now. Please try again later.',
      continue: 'Continue',
      back: 'Back',
    },
    period: {
      title: 'Period and fee',
      days: (k: number) => `${k} days`,
      fee: 'Your fee on the profit',
      feeHelp: (min: number) => `At least ${min}%. Charged only if the period ends with a profit.`,
      hours: 'The trader buys only during its trading hours. Outside them, your wallet waits.',
      continue: 'Continue',
      back: 'Back',
    },
    start: {
      title: 'Authorize and start',
      body:
        "When you press it, three things happen: we register your wallet and create its policy; Privy asks you to " +
        "approve PurpleSky's permission on your trading wallet; and the period starts.",
      amount: 'In your trading wallet',
      period: 'Period',
      fee: 'Fee on the profit',
      ends: 'Ends around',
      button: 'Authorize and start',
      registering: 'Creating your policy…',
      authorizing: "Approve the permission in Privy's window…",
      starting: 'Starting the period…',
      back: 'Back',
    },
    dash: {
      periodOf: (k: number) => `${k}-day trading period`,
      status: { active: 'Running', closing: 'Closing: selling and returning', settled: 'Ended' },
      ends: (when: string) => `Ends: ${when}`,
      endedAt: (when: string) => `Ended: ${when}`,
      started: 'At the start',
      now: 'Now',
      result: 'Result',
      fee: 'Chosen fee',
      open: 'Open positions',
      none: 'None right now',
      openCount: (k: number) => (k === 1 ? '1 position' : `${k} positions`),
      closed: 'Trades closed this period',
      noClosed: 'None yet',
      closedCount: (k: number, won: number) => `${k} · ${won} with a profit`,
      endEarly: 'End early',
      endConfirm:
        'The trader will sell what is open at market price and send everything to your Phantom, less the fee if ' +
        'there is a profit so far. End the period now?',
      endYes: 'Yes, end it',
      endNo: 'Keep going',
      settlement: 'Settlement',
      final: 'Final balance',
      profit: 'Profit',
      feePaid: 'Fee paid',
      returned: 'Sent to your Phantom',
      tx: 'transaction',
      newPeriod: 'Start another period',
      refresh: 'Refresh',
      updated: (t: string) => `Updated ${t}`,
      hours: 'It buys only during its trading hours.',
    },
    tools: {
      title: 'Your wallet is yours',
      export: 'Export the private key',
      exportNote:
        'Privy shows the key in a separate window; PurpleSky never sees it. Moving funds during a period ends it early.',
      returnAll: 'Send the whole balance to Phantom',
      returnNote: 'Available when no period is running.',
      revoke: "Remove PurpleSky's permission",
      revokeNote: "During a period, use “End early”: without the permission, the trader cannot sell what is open.",
      revoked: 'Permission removed. PurpleSky can no longer trade your wallet.',
      sent: 'Sent.',
    },
  },
};
