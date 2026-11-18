---
title: "Inside the $6.3B Binance Heist: Infrastructure, Attack Chain, and the Neural Networks That Chase Stolen Crypto"
description: "On 29 October 2026, attackers drained about $6.3 billion from Binance's hot wallets across ten blockchains in roughly 20 minutes. It is the largest crypto theft on record, more than four times the…"
date: 2026-11-07
tags: [security, crypto, machine-learning]
original: https://www.linkedin.com/pulse/inside-63b-binance-heist-infrastructure-attack-chain-neural-nithin-j-hjuof
---

On 29 October 2026, attackers drained about $6.3 billion from Binance's hot wallets across ten blockchains in roughly 20 minutes. It is the largest crypto theft on record, more than four times the $1.5 billion Bybit hack of February 2025.

The surprising part: no private key leaked. The attackers never cracked the vault. They spent five months walking from one engineer's laptop to the machine that tells the vault what to sign, and then asked it, politely, to sign everything.

**TL;DR**

- **Entry:** a tampered developer-tool installer (June) and a fake job interview with a malicious coding assignment (September).
- **Pivot:** an internal AI tool was used to jump from one engineer's computer to two more (20 October). One of them held a container-deployment token.
- **Strike:** that token deployed a container that reached Binance's internal wallet-signing service (29 October). The service signed the attacker's transactions on ten chains.
- **Amplifier:** on Ethereum, 50 signed EIP-7702 authorizations turned a hot wallet into an attacker-controlled sweeper. Halting withdrawals could not undo an on-chain delegation.
- **Aftermath:** about $2.85–3 billion frozen with partners like Tether and Circle; Binance covered user losses from its own reserves; the FBI attributes the attack to North Korea's TraderTraitor group.

This article explains how an exchange like Binance is wired, follows the attack step by step down to the individual transactions, and then looks at where neural networks fit: what they catch, what they missed here, and how graph neural networks follow stolen money across a blockchain.

## Before you start: the hard parts in plain English

This article gets technical. One analogy runs through all of it: **Binance is a giant bank, and the thief never broke into the vault. He got a job-interview pass, wandered into the back office, and handed the managers payment orders they signed without reading.**

## The bank analogy

- **The bank's account book → internal ledger.** Binance's database of who owns what. Trades between users only change rows here.
- **The underground vault → cold wallet.** Offline wallets holding most of the coins. Slow to open, hard to reach.
- **The cash drawer at the counter → hot wallet.** Online wallets holding enough to pay withdrawals fast. This is what got emptied.
- **A vault door needing 2 of 3 managers to turn their keys together → MPC signing.** The private key is split into shares on several machines. Some of them must cooperate to sign, and no one ever holds the whole key.
- **The rulebook managers check before signing → policy engine.** Rules such as "no payment over $5M" or "only pay known addresses", checked before any signature.
- **The clerk who brings payment orders to the managers → withdrawal service.** The system that turns your "withdraw" click into a signing request.
- **A cheque's serial number → nonce.** A counter of how many transactions a wallet has sent. Each transaction must carry the next number.
- **A power of attorney filed at the public registry → EIP-7702 delegation.** A signed note that makes a wallet run someone else's program. Once on the blockchain, only a new signed note cancels it.
- **The person holding that power of attorney, emptying the drawer at will → sweeper contract.** The attacker's program that drained the hot wallet.

## The whole attack as a bank story

1. **The fake toolbox (June).** A clerk downloads what looks like a normal toolbox; it's rigged. Security notices and gives him a new desk, but the thief has already read the staff directory.
2. **The fake job interview (September).** Another clerk is "interviewed" by a fake company and asked to do a take-home task at his work desk. The task plants a hidden listening device.
3. **The office intercom (20 October).** The bank has a smart assistant (an internal AI tool) that can reach every clerk's desk. The thief uses it to get into two more desks. In one drawer he finds a staff badge that lets him set up a new desk inside the back office (a container-deployment token).
4. **The forged orders (29 October).** From his new desk, the thief sends payment orders to the managers. They come through the official internal channel, so the managers sign them. Cash drawers in ten branches (ten blockchains) are emptied in about 20 minutes.
5. **The power of attorney.** In one branch (Ethereum), the thief also gets the managers to sign a power of attorney giving his program control of the drawer. The bank shuts the counter (halts withdrawals), but the registry still says he has the right to empty the drawer. Cancelling it means the managers must sign a new form together, which takes about four hours.
6. **The 50 forms.** Each form is valid only for the drawer's current cheque number, and the drawer keeps paying customers, so the number keeps changing. The thief pre-signs 50 forms numbered 1,000 to 1,049 and submits them all at once. Whichever number is current, one form matches.

**The lesson in one line:** the vault (MPC keys) worked perfectly. The managers just trusted whoever handed them the orders.

## The other hard terms

- **Blockchain:** a public record book of every transaction that anyone can read and no one can quietly edit.
- **Private key / signature:** a secret number that proves a wallet's owner approved a transaction. Signing = stamping the order with that secret.
- **Smart contract:** a program that lives on the blockchain and runs when someone calls it.
- **Stablecoin freeze:** USDT and USDC are issued by companies (Tether, Circle) that can lock coins at a given address. Bitcoin and ETH have no such company, so they can't be frozen.
- **Supply-chain attack:** poisoning a tool people trust (an installer, a package) instead of attacking them directly.
- **Lateral movement:** after getting into one computer, hopping to others inside the same company.
- **Container / deployment token:** a container is a packaged program running on company servers; the token is a pass that allows launching one. Here, it let the thief run code right next to the signing service.
- **Zero-day:** malware or a flaw that security tools have never seen, so nothing flags it.

## The machine-learning terms, by analogy

- **Neural network:** a function with millions of adjustable knobs, tuned by showing it examples until its guesses are right.
- **Graph:** dots connected by lines. Here, dots are wallets or transactions and lines are money moving between them.
- **Graph neural network (GNN):** "you are known by the company you keep." Each layer is one round of gossip: every wallet hears a summary from its neighbours. After two rounds, a wallet knows if it is two hops from a stolen-money address, even if it looks clean itself.
- **Isolation forest:** a game of 20 questions. Ask random yes/no questions ("over $1M?", "new address?") to single out one request. Odd requests are singled out in very few questions; normal ones take many.
- **F1 score:** a grade for catching rare bad cases. If 2 in 100 transactions are criminal, a model that says "all clean" is 98% accurate and useless. F1 rewards catching the bad ones without too many false alarms.
- **Distribution shift:** the world changes after training, like a fraud detector trained before a new scam appears. In the Elliptic study, every model failed after a dark market suddenly shut down.

## How an exchange like Binance holds your money

An exchange runs two layers of money: a database that says what you own, and real blockchain wallets that hold the coins. The attack lived in the bridge between them.

1. **The internal ledger.** Your Binance balance is a row in Binance's database. Trades between users never touch a blockchain; Binance just updates rows.
2. **Cold wallets.** Most coins sit in offline wallets, slow to move and hard to reach.
3. **Hot wallets.** Online wallets hold enough to pay withdrawals quickly. This attack hit the hot wallets.
4. **The signing service.** Every hot-wallet transaction needs a signature. Binance's hot wallets used multi-party computation (MPC), which splits signing power across several parties, so no single machine holds the whole key.
5. **The withdrawal pipeline.** You click withdraw → a withdrawal service checks it → it asks the signer → the signed transaction is broadcast to the blockchain.

The weak point is the line between the service that *requests* a withdrawal and the signer that *decides*. Security analysts argue the signer should enforce its own limits: value and velocity caps, allowlisted destinations, blocked transaction types. In this attack the requester was compromised, and the signer trusted it.

## Inside the signing path: MPC and the policy engine

**Threshold signing.** In an MPC wallet the private key k never exists in one place. A distributed key generation (DKG) gives each of n signing nodes a share kᵢ. Any t of them can jointly produce a valid ECDSA signature; fewer than t learn nothing about k. With 2-of-3, shares sit on three machines and any two can sign. To the blockchain the result is an ordinary signature from one address.

If the shares came from a polynomial of degree t − 1, the key is a weighted sum of any t shares (Lagrange interpolation at x = 0):

![](/blog/inside-the-binance-heist/1.webp)

Worked check, 2-of-3 with f(x) = 7 + 3x, so k = 7: the shares are k₁ = 10, k₂ = 13, k₃ = 16. Using nodes 1 and 2: λ₁ = 2/(2 − 1) = 2 and λ₂ = 1/(1 − 2) = −1, so k = 2·10 − 13 = 7. Threshold ECDSA protocols compute the signature *as if* they used this sum, without ever forming k.

**The catch.** MPC defends against key *theft*, not key *misuse*. The nodes sign whatever an authenticated request asks, if policy allows it. So the money is only as safe as two things: whatever may submit requests, and the policy engine in front of the nodes.

![](/blog/inside-the-binance-heist/2.webp)

Typical signer policies, and my assessment of how each would have fared here:

- **Requester identity** (only the withdrawal service's workload identity may call): passed, because the attacker's container ran with valid deploy credentials.
- **Transaction-type allowlist** (only ETH and token transfers; reject 0x05 authorizations): would have blocked all 50 EIP-7702 slips.
- **Destination allowlist** (hot → cold and hot → customer addresses only): blocks direct transfers, but a 7702 authorization has no destination to check.
- **Value and velocity caps** (per transaction, per wallet, per hour, across chains): would have throttled the ordinary transfers on the other nine chains.
- **Out-of-band approval** (a human approves anything above a threshold or batched): would have stopped both paths, at the cost of slower payouts.

The common thread: each check must live *in the signer*, not in the service that asks. A check in the requester disappears when the requester is the attacker.

![](/blog/inside-the-binance-heist/3.webp)

Binance has not published its full architecture. The picture above is the standard exchange design plus what the post-mortem confirmed (hot wallets, MPC, an internal wallet-signing service).

## The attack chain, step by step

The heist took five months of patience and about 20 minutes of execution. Binance's 3 November post-mortem names three engineers: A, B and C.

![](/blog/inside-the-binance-heist/4.webp)

- **June · First foothold.** Engineer A, a wallet DevOps engineer, searched for a popular AI coding tool and ran a tampered Homebrew installer. Binance caught it, replaced his laptop and rotated his credentials, but the attacker had already learned his role and his teammates' names.
- **September · Fake job interview.** Engineer B got a recruiter message on a real job site. After a video call with a fake HR person and a chat with a "CEO" of a nonexistent company, he downloaded a coding assignment to his work computer. Its setup swapped the genuine pyenv for a doctored copy and opened a line to the attacker. The malware was a zero-day and erased its own traces.
- **20 October · Lateral movement.** From B's machine, the attacker used an internal AI tool to take over A's and C's computers. On A's machine sat a token allowed to deploy containers.
- **29 October, 17:15–19:56 UTC · Reaching the signer.** The attacker logged into C's computer, used A's stolen token to deploy a container, and ran a script that reached Binance's internal wallet-signing service.
- **29 October, 20:05 UTC · The drain.** Five XRP Ledger hot wallets sent 233.46 million XRP to the attacker. Solana, Optimism, Bitcoin and Ethereum followed.

Three details stand out:

- **Cleaning up the first infection was not enough.** The June malware was removed, yet the attacker kept the map: who works on wallets and who they talk to. September's fake interview targeted that map.
- **The AI tool was the bridge.** Binance has not named the tool or explained how it let an outsider jump between machines. One security founder put it simply: the AI tools on a compromised laptop had more access than the engineer using them.
- **A deployment token lived on a laptop.** That single credential turned a desktop compromise into the power to run code next to the signer.

## The chain in MITRE ATT&CK terms

Mapping each stage to an ATT&CK technique shows where a detection could have sat. The mapping is my reading of the post-mortem, not Binance's. Format: stage → tactic · technique → telemetry that could catch it.

- **Tampered Homebrew installer** → Initial Access · T1195.002 Compromise Software Supply Chain → package hashes vs official taps; installs from search-ad domains.
- **Recruiter message on a job site** → Initial Access · T1566.003 Spearphishing via Service → reported recruiter contacts; known lure personas.
- **Running the coding assignment** → Execution · T1204.002 User Execution: Malicious File → process tree: setup script spawning shell and network calls.
- **Doctored pyenv binary** → Persistence · T1554 Compromise Host Software Binary → file-integrity monitoring on toolchain paths.
- **Callback to attacker server** → Command and Control · T1071 Application Layer Protocol → new long-lived outbound connections from dev laptops.
- **Self-deleting traces** → Defense Evasion · T1070 Indicator Removal → gaps in endpoint logs; EDR tamper alerts.
- **AI tool used to reach A's and C's machines** → Lateral Movement · T1072 Software Deployment Tools (closest fit: internal tooling abused) → AI-tool actions on hosts other than the caller's own.
- **Deploy token found on A's laptop** → Credential Access · T1552.001 Credentials In Files → secret scanning on endpoints; token age and location.
- **Container deployed next to the signer** → Execution · T1610 Deploy Container → deploys from a laptop, off-hours, outside CI.
- **Signing service drained ten chains** → Impact · T1657 Financial Theft → signer-side value, velocity and type anomalies.

Read top to bottom, the list shows the attacker spent five months in stages that each produce ordinary-looking endpoint events. Only the last two stages touch money, and together they took under seven hours (17:15 to 23:56 UTC).

*In plain words:* MITRE ATT&CK is a shared dictionary of hacker moves, like a playbook where every play has a number. Each line names the play used and the alarm that could have rung. Most of the plays happened on ordinary laptops, weeks or months before any money moved, which is where defenders had the most time.

![](/blog/inside-the-binance-heist/5.webp)

Stablecoin issuers moved within an hour, but native coins kept leaving until Binance cleared the Ethereum delegation at 00:10 UTC.

## Deep dive: how the attacker reached the wallets and moved the money

**In plain words:** the attacker never opened the vault. He sneaked into the room where payment orders are written, wrote his own, and slid them under the managers' door. The managers stamped them because they came from inside the building.

## Part 1: getting to the wallets

The attacker needed one thing: a way to make Binance's signing service sign *his* transactions. It took four hops.

**Hop 1: a laptop that knows the right people (June).** Engineer A worked on wallet infrastructure. His June infection was cleaned up, but it leaked two things that don't expire: who works on the wallets, and who they talk to.

*In plain words:* the thief got the staff directory, so he knew exactly whose desk to aim for next.

**Hop 2: a laptop the attacker controls (September).** The fake interview put a doctored pyenv on Engineer B's work computer. pyenv is a tool developers run constantly to switch Python versions, so a poisoned copy runs again and again without looking odd. It opened a line to the attacker's server, and the zero-day malware erased its own traces.

*In plain words:* the thief now has a hidden remote control inside one employee's computer.

**Hop 3: from one laptop to the ones that matter (20 October).** From B's machine, the attacker used an internal AI tool to take over A's and C's computers. Binance has not said how. The general risk is well known: internal AI assistants are often given wide access (code, tickets, sometimes the ability to run commands on machines), so whoever controls one user's session can borrow all of that reach. On A's laptop sat the prize: a container deployment token.

*In plain words:* a deployment token is a pass that says "this person may start programs on the company's servers." Finding it on a laptop is like finding a master staff badge in a desk drawer.

**Hop 4: a program inside the trusted zone (29 October, 17:15–19:56 UTC).** The attacker logged into C's computer, used A's token to deploy a container, and ran a malicious script that reached the wallet-signing service. A container is a packaged program running on company servers. Started with a real token, it lives *inside* the server network, the zone the signing service is built to trust.

*In plain words:* the thief used the master badge to set up his own desk inside the back office, right next to the managers.

**What we don't know.** Binance has not disclosed exactly how the script convinced the signer it was a legitimate caller. In general, internal services trust callers in one of three ways, and any of them would fail the same way here: by network location ("anything inside this zone may call me"), by the identity of the workload that's calling (which a container started with real credentials can inherit), or by a credential stored where the caller can read it. Which one applied at Binance is an open question.

**The result.** TRM Labs' assessment is that the attacker gained the ability to make Binance's hot-wallet signing system sign whatever transactions he wanted. Binance found no sign that any private key left its systems. MPC kept the key safe; it could not stop the key being *used* by the wrong requester.

## Part 2: how the transfers actually worked

With the signer on his side, the attacker used two different techniques. On most chains he forged ordinary payment orders. On one Ethereum wallet he took over the wallet itself.

**Technique A: ordinary signed transfers (most chains).** Every blockchain transfer is a small message ("send this amount from this wallet to that address") plus a signature from the wallet's key. Change one byte and the signature breaks, which is why nobody can fake one without the signer. The details differ by chain:

- **Bitcoin** keeps coins as separate "notes" received earlier (UTXOs). A transaction lists the notes it spends and the new owners, and every note needs its own signature. An exchange hot wallet holds many such notes, so moving 18,270 BTC means signing many inputs.
- **Account chains** (XRP, TRON, Solana, Ethereum) keep one balance per address. A transfer carries a sequence counter or a recent-block reference so it can't be replayed. One transfer = one signature.
- **Tokens on Ethereum** (USDT, USDC and so on) are not stored in the wallet itself. They are entries in each token's own contract, so moving them means the wallet must *call* that contract ("transfer X to Y"). Every token is a separate call.

*In plain words:* each transfer is a cheque. The attacker had the managers sign cheque after cheque, and the bank's own stamp made each one valid.

**Technique B: taking over the wallet (Ethereum, "Binance 14").** The biggest Ethereum hot wallet held ETH plus dozens of tokens. Draining it the normal way would mean many separately signed transactions, each waiting for the right nonce. Instead, at 20:20 UTC, the attacker sent the 50 EIP-7702 authorizations explained step by step in the next section. About three and a half minutes later he called the wallet, which now ran his sweeper code. One transaction moved 167,464 ETH and 63 tokens, including about $1.6 billion in USDT. That is 64 transfers in a single transaction, worth more than $2.5 billion. The sweeper stayed in control, so later sweeps continued until 23:56 UTC.

*In plain words:* instead of forging 64 cheques, the thief got a power of attorney over the whole account, then emptied it in one visit and came back for whatever arrived later.

**What left each wallet** (wallet · technique · signatures needed · reported outflow):

- **Five XRP Ledger hot wallets (20:05 UTC)** · ordinary transfers · one per transfer · 233.46 million XRP (~$296M).
- **Bitcoin hot wallets** · ordinary transactions (UTXO) · one per input spent · 18,270 BTC (~$1.5B).
- **TRON, Solana, Optimism and others** · ordinary transfers · one per transfer · TRON ~$628M, Solana ~$96M, smaller chains ~$77M.
- **A second Ethereum hot wallet** · ordinary transfers, no delegation · one per transfer · 28,006 ETH, 55.7M USDT, 25.9M RLUSD.
- **Binance 14 (Ethereum)** · EIP-7702 delegation + sweeper · 50 authorizations, then none · 167,464 ETH + 63 tokens (~$1.6B USDT) in one transaction.
- **Avalanche and Polygon wallets (23:05 UTC)** · second wave · not detailed in reports · not broken out.

Per-chain figures from Wikipedia's summary and TRM Labs. Analytics firms differ slightly on the total: TRM Labs counts $6.36B, Elliptic $6.43B across 11 chains.

**Why it took only 20 minutes.** The attacker had prepared everything in advance:

1. **28 October:** three small Tornado Cash withdrawals funded an "operator" wallet to pay gas fees, with no link to his identity.
2. **29 October, early:** he deployed the sweeper contract and rehearsed it on three test wallets.
3. **29 October, 20:05 onward:** the pre-signed batches went out across chains in parallel.

*In plain words:* the robbery was rehearsed. On the night, it was a script running, not a person typing.

The real defence was never "spot it during the 20 minutes." Funds on ten chains left faster than a human could read an alert. It had to be a rule inside the signer that refuses before signing.

## The Ethereum trick: EIP-7702 and the 50 authorizations

On Ethereum, the attacker didn't just send coins out. He took over the wallet itself, which is why stopping withdrawals didn't stop the bleeding. Three ideas make the trick clear: the two kinds of Ethereum account, what EIP-7702 changed, and the nonce.

**Idea 1: Ethereum has two kinds of account.**

- **Externally owned account (EOA):** controlled by a private key; can start a transaction by signing it; has no code (until EIP-7702). Bank analogy: a customer who signs cheques. In this attack: Binance 14, the hot wallet.
- **Contract account:** controlled by code stored on the blockchain; cannot start a transaction, only reacts when called. Bank analogy: a vending machine, where a request goes in and a fixed program runs. In this attack: the attacker's sweeper contract.

**Idea 2: what EIP-7702 changed.** Since Ethereum's Pectra upgrade (7 May 2025), an EOA can sign an *authorization* that says "when someone calls me, run the code at address S." The account keeps its address, its balance and its key; it gains a program. Wallets use this for useful things: batching several actions into one transaction, letting someone else pay the gas, setting spending limits.

Technically, the network writes a 23-byte *delegation indicator* into the account's code slot: 0xef0100 followed by S's 20-byte address. From then on, every call to the account loads S's code and runs it in the account's own context, with the account's balance, its token holdings and its identity as the sender of any onward transfer.

*Analogy:* Binance 14 is a house with one key. EIP-7702 lets the owner hire a butler (the delegate contract) who answers the door and carries out requests on the owner's behalf. The owner hires the butler by signing a letter. The attacker got Binance's own signer to sign a letter hiring *his* butler, whose only standing order was "hand everything to my boss." Closing the front office (halting withdrawals) didn't help: the butler was already inside, and only a new signed letter could dismiss him.

Compare this with the more familiar token approval. An approval lets one app spend one token, up to a limit. A delegation hands the contract every action the account can take, for every asset it holds, until it is revoked.

**Idea 3: the nonce.** Every EOA has a counter, its *nonce*: the number of transactions it has sent so far. A transaction or authorization is valid only if it carries the current value, and once used the counter moves up by one. That is what stops replay: an old signed message cannot be submitted again.

*Analogy:* a deli ticket machine. The board shows "now serving 1,003". Ticket 1,003 is served; ticket 1,000 has expired. For an ordinary transaction, a future number such as 1,010 waits its turn. For an EIP-7702 authorization, a number that doesn't match is simply thrown away. Binance 14 was paying customers all evening, so its "now serving" number kept moving while the attacker's transaction waited to be included in a block. That moving target is the problem the 50 authorizations solve.

## Inside a type-0x04 transaction

The whole takeover rode on one special transaction. Picture a courier envelope: the envelope is signed by whoever sends it and pays the postage (here, the attacker's operator wallet), and inside are permission slips, each signed by a *different* account (here, all 50 by Binance 14).

**The envelope.** EIP-7702 adds transaction type 0x04 ("set code"). It is an ordinary EIP-1559 transaction with one extra field, the authorization list. RLP (recursive length prefix) is Ethereum's standard way of packing a list of fields into bytes:

![](/blog/inside-the-binance-heist/6.webp)

Each field, with its envelope analogy:

- **chain_id:** which network (1 = Ethereum mainnet). Analogy: which country's postal service.
- **nonce:** the *sender's* own counter. Analogy: the sender's ticket number.
- **max_priority_fee_per_gas, max_fee_per_gas:** the tip to the block builder, and the most the sender will pay per unit of gas. Analogy: postage and tip.
- **gas_limit:** the most computation the transaction may use. Analogy: the weight limit.
- **destination:** the address the call goes to (may not be empty in a 0x04 transaction). Analogy: the recipient.
- **value, data:** ETH sent along, and the function call to make. Analogy: cash inside, and the letter of instructions.
- **access_list:** addresses and storage slots declared up front for cheaper access. Analogy: rooms the courier will enter.
- **authorization_list:** the new field, the permission slips. Analogy: the signed permission slips.
- **signature_y_parity, signature_r, signature_s:** the sender's signature over all of the above. Analogy: the sender's signature on the envelope.

**The slips.** Each slip is a tuple of six fields, [chain_id, address, nonce, y_parity, r, s]:

- **chain_id:** where the slip is valid; 0 = on every EVM chain. At Binance: not reported.
- **address:** the contract to delegate to. At Binance: the attacker's sweeper.
- **nonce:** must equal the signing account's current nonce. At Binance: one value per slip, in sequence.
- **y_parity, r, s:** the signing account's ECDSA signature. At Binance: produced by Binance's own signing service.

Notice what a slip does *not* contain: the name of the account that signed it. The network works that out from the signature itself.

**What exactly gets signed.** The signing account never signs the slip directly; it signs a fingerprint of it:

![](/blog/inside-the-binance-heist/7.webp)

- rlp([chain_id, address, nonce]) packs the three fields into bytes.
- 0x05 is a *magic* prefix byte. It marks the bytes as an EIP-7702 authorization, so the same signature can never be reinterpreted as a transaction signature (transactions begin with their own type byte, such as 0x02 or 0x04). *Analogy:* a stamp reading "PERMISSION SLIP, NOT A CHEQUE".
- keccak256 hashes everything into a 32-byte fingerprint, and that fingerprint is what the key signs.
- ecrecover(msg, y_parity, r, s) runs the maths in reverse: from the fingerprint and the signature it computes the one address whose key could have produced them. That address is the *authority*.

Why this matters at Binance: the MPC signer only ever saw a 32-byte fingerprint. Nothing in 32 random-looking bytes says "this hands your wallet to a stranger" unless the policy engine rebuilds the original fields and checks them.

**How the network processes each slip.** Before the envelope's own call runs (and after the sender's nonce is bumped), the network walks the slips in order. Format: check → why it exists → at Binance.

1. chain_id is 0 or this chain's ID → a slip meant for another network can't be used here → passed (implied: the delegation landed).
2. nonce < 2⁶⁴ − 1 → keeps the counter in range → passed (implied).
3. authority = ecrecover(msg, y_parity, r, s) → finds the signer without naming it → recovered Binance 14.
4. Add the authority to accessed addresses → gas accounting (EIP-2929).
5. The authority's code is empty or already a delegation → real contracts can't be overwritten → passed: Binance 14 was a plain EOA, and from slip #5 on it was already delegated.
6. The authority's current nonce equals the slip's nonce → old slips can't be replayed → failed for #1–#3, passed from #4 on.
7. Refund some gas if the account already exists → gas accounting.
8. Write 0xef0100 ‖ address into the authority's code → installs the delegation → code now pointed at the sweeper.
9. The authority's nonce += 1 → the slip can't be used twice → triggered the cascade (dry run below).

Three rules sit around this list. If any step fails, that slip is skipped and the next one is processed; the transaction itself does not fail. If one authority appears in several valid slips, the last one wins. And delegations are not rolled back even if the envelope's own call later reverts.

![](/blog/inside-the-binance-heist/8.webp)

Three properties mattered here:

- **Signer ≠ sender.** The transaction came from an attacker address funded through Tornado Cash. Only the 50 slips needed Binance 14's signature, so the attacker needed the signing service's cooperation per slip, never for a full Binance transaction.
- **Skip, don't fail.** Stale slips are silently skipped, so stuffing in extra ones costs only gas.
- **Blind signing.** An MPC signer signs a 32-byte digest. Unless the policy engine decodes what produced that digest, a 7702 authorization (0x05-prefixed) looks like any other hash.

*In plain words:* a type-0x04 transaction is an envelope that can carry signed permission slips from other wallets. The network checks each slip: right chain, right counter number, real signature. A bad slip is quietly thrown away instead of rejecting the whole envelope, so stuffing in 50 slips costs the attacker nothing but fees.

## Dry run: why 50 slips always land

Setup: slip #k carries nonce 999 + k, so #1 to #50 cover nonces 1,000 to 1,049, all pointing at sweeper S. Let N be Binance 14's nonce when the block executes the transaction. Trace for N = 1,003 (slip · slip nonce · account nonce before · result · account nonce after):

- #1 · 1,000 · 1,003 · ≠, skipped · 1,003
- #2 · 1,001 · 1,003 · ≠, skipped · 1,003
- #3 · 1,002 · 1,003 · ≠, skipped · 1,003
- #4 · 1,003 · 1,003 · =, code ← 0xef0100 ‖ S · 1,004
- #5 · 1,004 · 1,004 · =, code ← 0xef0100 ‖ S · 1,005
- …
- #50 · 1,049 · 1,049 · =, code ← 0xef0100 ‖ S · 1,050

Step 9 causes a cascade: once one slip matches, the incremented nonce makes the next one match too. For 1,000 ≤ N ≤ 1,049:

![](/blog/inside-the-binance-heist/9.webp)

Check against the trace: N = 1,003 gives 47 valid slips (#4 to #50) and final nonce 1,050. N = 1,049 gives exactly one. N ≥ 1,050 means Binance sent 50 or more transactions before inclusion, so every slip is stale and the attack fails. The 50 slips bought a window of 49 Binance transactions.

![](/blog/inside-the-binance-heist/10.webp)

One consequence follows from step 9 but has not been reported by investigators: the nonce jump to 1,050 invalidates any legitimate Binance withdrawals already signed for nonces N to 1,049.

**After delegation.** Any call to Binance 14 now runs S's code in Binance 14's own context: its ETH balance, its token holdings, its storage. The sweeper only accepts commands from the attacker's operator address. The attacker can call it again and again with no further Binance signature, which is why TRM Labs saw sweeps continue until 23:56 UTC.

*In plain words:* from the outside, Binance 14 still looked like Binance's wallet. Inside, every call to it now ran the attacker's program, with the wallet's full balance at its disposal.

![](/blog/inside-the-binance-heist/11.webp)

That's what happened on the night. At 20:20 UTC, one Ethereum transaction carried 50 authorizations, all signed by the hot wallet labelled "Binance 14", all pointing at the attacker's sweeper contract. A little over three minutes later, 167,464 ETH and 63 tokens, including about $1.6 billion in USDT, had left the wallet.

**Why "stop withdrawals" didn't work.** Binance halted withdrawals, but the delegation lived on the blockchain, outside Binance's systems. Undoing it meant signing a new authorization, and MPC meant no single key could do that quickly. Binance improvised a revocation procedure. At 00:10 UTC on 30 October it pointed the delegation to the zero address, about four hours after the first coins moved.

## Detecting and revoking a delegation

A delegated account has exactly 23 bytes of code that start with 0xef0100, so a monitor can watch every treasury address with one RPC call per block:

![](/blog/inside-the-binance-heist/12.webp)

That check fires after the damage starts. The stronger control sits before signing: the policy engine refuses any digest whose preimage begins with the 0x05 magic byte, unless the delegate is allowlisted. A signer that only sees 32-byte hashes cannot enforce this, so the request must carry the decoded payload and the signer must re-hash it to prove the two match.

Revocation is just another authorization: a slip whose address is 0x0000…0000, which makes step 8 clear the code. It still needs a valid signature from the wallet, which is why MPC slowed Binance down: the key-share holders had to run a ceremony nobody had rehearsed.

*In plain words:* you can spot a hijacked wallet because it suddenly "has code" starting with 0xef0100. But that alarm rings after the theft starts. The real fix is earlier: the signer should refuse to sign permission slips at all unless the target program is on an approved list.

**Root cause vs amplifier.** EIP-7702 explains the giant Ethereum sweep, not the whole theft. Bitcoin, TRON, Solana and XRP were drained with ordinary signed transfers. The root cause was a compromised signing pipeline; 7702 only made the Ethereum side faster and harder to stop.

## Follow the money

The moment funds landed in the attacker's wallets, two clocks started: the issuers racing to freeze, and the attacker racing to turn freezable coins into coins that cannot be frozen.

![](/blog/inside-the-binance-heist/13.webp)

**Why some coins can be frozen and others can't.** USDT and USDC are not native to Ethereum. Each is a smart contract run by a company, and the contract keeps a blacklist that the company controls (USDT's contract has an addBlackList function; USDC has a blacklister role). Once an address is on it, the contract refuses every transfer out of that address. ETH and BTC have no issuer and no such switch: only the network's consensus rules decide who can spend them.

*In plain words:* stablecoins are like bank deposits, so the bank can lock the account. ETH and BTC are like cash in your pocket, and nobody can reach in.

**The issuers' clock.** Tether froze 971.1M USDT and Circle 823M USDC in the main receiving wallet at 21:01 and 21:04 UTC, about an hour after the first outflow. Ripple and World Liberty Financial froze assets too, and the Arbitrum Security Council moved about $30M in ETH and ARB out of the attacker's reach. In total, about $2.85–3 billion was frozen or intercepted.

**The attacker's clock.** Three moves, all aimed at getting out of freezable assets fast:

1. **Dump at a loss.** About 325M USDT was sold to market makers at more than 10% below face value. Losing 10 cents per dollar is cheap next to losing the whole dollar to a freeze.
2. **Borrow against it.** He posted USDT as collateral on Aave, a lending protocol, and borrowed about 19,760 ETH. The likely logic: if that USDT is frozen later, the ETH is already gone, and the frozen collateral becomes the lending pool's problem.
3. **Consolidate into ETH.** The stolen funds were moved mainly into ether and through DeFi platforms and instant exchanges.

*In plain words:* the thief rushed to swap "money the bank can lock" for "cash nobody can lock", even at a bad exchange rate.

**What comes next.** As of 30 October, nothing had been converted to fiat; for funds this large that can take weeks to years and needs paid middlemen. Analysts expect the next hops to be cross-chain bridges, swaps and OTC brokers. Every hop is visible on-chain, and the FBI published the hack's wallet addresses, so exchanges can screen and block deposits traced to them. That tracing is where the graph models below come in.

**Who did it, and who paid.**

- **Attribution.** The FBI attributes the theft to North Korea's TraderTraitor group; TRM Labs, Chainalysis and Elliptic also point to North Korea.
- **Binance's response.** Binance said users would bear no losses. It covered them from its Secure Asset Fund for Users (SAFU), Futures Insurance Fund, Bitcoin reserve and corporate treasury. Withdrawals reopened in phases from 1 November, and by 3 November Binance said 98% of the stolen tokens had been replenished (replaced from its own funds, not recovered).

## Where neural networks fit

Neural networks played three different roles around this hack: guarding users inside the exchange, tracing the stolen money afterwards, and catching the inside attack, the one job they didn't do.

## 1. Fraud models inside the exchange

Binance runs more than 100 AI models across its anti-fraud and anti-scam controls. They cover abnormal trading, account takeover, scams and transaction fraud. In the first half of 2026, the company says, those models helped prevent about $4.6 billion in potential losses.

These models live on fresh data. Binance has described a streaming pipeline that computes features live, such as "withdrawals from this account in the last 10 minutes", so its models don't go stale. A model then scores each action as it happens.

**Example.** You log in from a new country, change your 2FA, and withdraw your whole balance to a brand-new address, all within 5 minutes. Each step alone is normal. Together, an account-takeover model scores them as high risk and holds the withdrawal.

**Why they didn't stop this attack.** These models judge *customers*. Here, Binance's own signer signed Binance's own hot-wallet transactions. No customer account did anything odd, so a user-fraud model saw nothing to score.

## 2. Graph neural networks: following stolen money

A blockchain is a giant graph. Transactions or wallets are nodes; money flows are edges. A graph neural network (GNN) learns from each node's own features *and* its neighbours'. In one layer, each node updates itself like this:

![](/blog/inside-the-binance-heist/14.webp)

In plain words: take my old features, add the average of my neighbours' features, multiply each by learned weights, and squash the result through σ. Stack two layers and every wallet "sees" two hops away.

**Worked example.** Wallet X looks normal on its own. But one hop back, X received funds from the hacker's address, and one hop forward, X splits them across 40 fresh wallets. After two layers, X's representation carries "one hop from a known theft address + a fan-out pattern", and the model flags it, though X itself was never labelled.

This is well-studied research. The Elliptic Data Set is a graph of over 200,000 Bitcoin transactions, 234,000 payment flows and 166 features per node, used to train GCNs for anti-money laundering. Its successor, Elliptic2, treats laundering as a *subgraph* problem: it learns the shape of a scheme (peel chains, fan-outs, mixers) rather than judging one wallet at a time. Firms like TRM Labs, Chainalysis and Elliptic traced this hack within hours, and that speed made the fast stablecoin freezes possible.

## The GCN layer, derived term by term

The mean-of-neighbours rule above is the intuition. The standard graph convolutional network (Kipf and Welling) layer is:

![](/blog/inside-the-binance-heist/15.webp)

- **A:** adjacency matrix; Aᵢⱼ = 1 if money flows between transactions i and j (treated as undirected here).
- **Ã = A + I:** adds self-loops, so a node keeps its own features.
- **D̃:** degree matrix of Ã, with D̃ᵢᵢ = Σⱼ Ãᵢⱼ.
- **D̃^(−½) Ã D̃^(−½):** entry (i, j) becomes Ãᵢⱼ / √(dᵢ dⱼ). A plain sum lets hubs explode; dividing by dᵢ alone ignores how busy the neighbour is. The symmetric form discounts edges into very high-degree nodes, such as exchange deposit addresses that touch millions of transactions.
- **W⁽ᵏ⁾:** learned weights. **σ:** a non-linearity such as ReLU.

*In plain words:* in each layer, every wallet takes a weighted average of itself and its neighbours. Busy hubs such as exchange deposit addresses get down-weighted, so they don't spread suspicion to everyone they ever touched.

**Dry run on three wallets.** The path is H — X — B, where H is the hacker's address. One feature: "labelled theft address" (H = 1, others 0). Set W = 1 and drop σ so only propagation is visible. With self-loops the degrees are H = 2, X = 3, B = 2, giving the normalized weights:

- H–H = 1/2 = 0.500, H–X = 1/√6 ≈ 0.408, H–B = 0
- X–X = 1/3 ≈ 0.333, X–B = 1/√6 ≈ 0.408
- B–B = 1/2 = 0.500

Propagating the feature layer by layer (H, X, B):

- **Layer 0:** 1, 0, 0
- **Layer 1:** 0.500, 0.408, 0
- **Layer 2:** 0.417, 0.340, 0.167

Two values derived by hand: X at layer 1 = 0.408·1 + 0.333·0 + 0.408·0 = 0.408. B at layer 2 = 0.408·0.408 + 0.500·0 = 0.167. After two layers, B carries a taint signal from an address two hops away. The receptive field equals the number of layers, which is also the main pitfall: stack too many and every node's vector converges to the same value (oversmoothing).

![](/blog/inside-the-binance-heist/16.webp)

## What the Elliptic benchmark actually shows

The Elliptic paper (Weber et al., 2019) is the honest reference point. Its graph has 203,769 transactions, 234,355 flows and 166 features per node (94 local, 72 aggregated over one-hop neighbours), across 49 time steps about two weeks apart. Only 4,545 nodes (2%) are labelled illicit and 42,019 (21%) licit; the rest are unlabelled. Models train on time steps 1–34 and test on 35–49.

![](/blog/inside-the-binance-heist/17.webp)

Three lessons for anyone who assumes "GNN = better":

1. **A plain GCN lost to a random forest.** A likely reason: the 72 aggregated features already encode the one-hop neighbourhood, so much of the graph signal was pre-computed.
2. **The best model was a hybrid.** GCN embeddings fed into a random forest beat either one alone.
3. **Every model broke on a regime change.** A dark market shut down suddenly at time step 43, and afterwards all methods performed poorly, even a random forest retrained after each step. New laundering routes, like a state group's fresh playbook, are exactly that kind of shift. In practice, tracers seed models with freshly published addresses (the FBI released the hack's wallets) and propagate from there.

*In plain words:* graph models are not magic. A simple model with well-chosen features beat a plain GCN, the best result combined both, and every model struggled once criminals changed their habits.

**Training code (PyTorch Geometric).** Assumes the tensors x, edge_index, y (0 licit, 1 illicit, −1 unlabelled) and t (time step) are already loaded from the Elliptic CSVs:

![](/blog/inside-the-binance-heist/18.webp)

Two pitfalls this code avoids: a random train/test split leaks future transactions into training and inflates scores, and accuracy is meaningless at 2% positives (always predicting "licit" scores about 90% on labelled nodes), so report illicit-class F1.

*In plain words:* train on the past and test on the future, never shuffled together, and grade the model on how many criminals it catches, not on overall accuracy.

## 3. What could have caught the inside attack

The attack left anomalies a model could have scored before the drain:

- **On employee devices:** a pyenv binary quietly swapped, and an AI tool suddenly reaching other engineers' machines. Behavioral endpoint models look for exactly this.
- **At the signer:** analysts recommend alerting on new EIP-7702 delegations and flagging batches of authorizations across nonces. Fifty authorizations for one hot wallet in one transaction is about as abnormal as signing traffic gets.
- **On deployment:** a container deployed from an engineer's laptop at an odd hour, reaching the signing service.

## Sketch: an anomaly model at the signer

No labelled "insider heist" dataset exists; there are a handful of such events ever. So a supervised classifier has nothing to learn from, and an unsupervised model trained on normal signing traffic is the realistic choice. An isolation forest fits well: it isolates points with random splits, and strange points get isolated in fewer splits.

Each signing request becomes a feature vector (feature: normal hot-wallet request vs the 29 October request):

- **Transaction type:** token or ETH transfer vs EIP-7702 authorization (0x05 digest).
- **Authorizations in the batch:** 0 vs 50.
- **Destination seen before:** yes vs no destination, unknown delegate contract.
- **Requester age:** long-running withdrawal service vs a container deployed minutes earlier.
- **Chains signed for, last 30 minutes:** 1–2 vs 10.

The anomaly score for a point x, from n training samples, is:

![](/blog/inside-the-binance-heist/19.webp)

Here h(x) is the number of splits needed to isolate x in one tree, E[h(x)] its average over the forest, and c(n) the average path length of an unsuccessful search in a binary search tree, which normalizes the score. With the default subsample n = 256, c(256) = 2(ln 255 + 0.5772) − 2·255/256 ≈ 10.245. A request isolated in 3 splits on average scores 2^(−3/10.245) ≈ 0.816 (anomalous). One isolated in 10.245 splits scores exactly 0.5 (ordinary), and one needing 14 scores ≈ 0.388 (very typical).

*In plain words:* the score measures how quickly random yes/no questions single a request out of the crowd. Close to 1 means "very unusual, hold it"; around 0.5 means "ordinary, sign it".

![](/blog/inside-the-binance-heist/20.webp)

![](/blog/inside-the-binance-heist/21.webp)

A plain rule ("reject 7702 authorizations") would have caught this specific request. The model earns its place on combinations nobody wrote a rule for, such as ten chains signing in twenty minutes from a requester that did not exist an hour earlier. It must run inside the signer's trust boundary, or the attacker who owns the requester also owns the model's verdict.

Binance now says it will invest more in AI-powered threat detection and fund research on AI security in crypto. The irony: AI sat on both sides. Fraud models protected Binance's users, while an internal AI tool with broad access became the attacker's bridge.

## Lessons for engineers

The vault held; the approval layer didn't. Swap "withdrawal service" for a payment system, a customer database or a deploy pipeline, and this is an ordinary enterprise breach.

![](/blog/inside-the-binance-heist/22.webp)

1. **No path from a laptop to anything that moves money.** Engineering workstations should not reach services that can request withdrawals or signatures.
2. **The signer decides, not the requester.** Value and velocity limits, destination allowlists, and rejecting unexpected EIP-7702 delegations belong in the signer itself.
3. **Decode before you sign.** Check each transaction on an independent system before signing it.
4. **Split signing by chain and wallet tier,** and keep hot-wallet balances close to near-term withdrawal needs.
5. **Short-lived, device-bound credentials.** A deployment token should never sit on a laptop for weeks.
6. **Treat AI tools as privileged users.** Audit what your coding assistants and internal agents can reach; their access is now part of your attack surface.
7. **Train for recruiter lures.** Fake interviews and "coding tests" are a known TraderTraitor pattern. Give engineers a simple way to report them.
8. **Rehearse the bad day.** Practise chain-level pauses and keep issuer contacts ready for fast freezes. Those freezes saved about $3 billion here.

## Sources

- [2026 Binance hack – Wikipedia](https://en.wikipedia.org/wiki/2026_Binance_hack)
- [Binance's post-mortem is out – HackerNoon](https://hackernoon.com/binances-post-mortem-is-out-the-$63-billion-hack-started-with-a-job-offer)
- [Teng says hackers used fake job interviews, AI tool – CNBC](https://www.cnbc.com/2026/11/03/binance-co-ceo-teng-says-hackers-used-fake-job-interviews-to-steal-6point3-billion-in-crypto.html)
- [Fake job interview led to $6.3B heist – Fox Business](https://www.foxbusiness.com/fox-news-tech/binance-details-how-fake-job-interview-led-6-3b-crypto-heist)
- [Binance hack: root causes and protection – Stingrai](https://www.stingrai.io/blog/binance-hack-october-2026)
- [Developer machines, AI tooling and wallet signing – StepSecurity](https://www.stepsecurity.io/blog/binance-hack-developer-machine-security)
- [50 EIP-7702 signatures and a laptop – noze](https://www.noze.it/en/insights/binance-attack-what-is-known/)
- [TRM on EIP-7702 and nonces – TechFlow](https://techflowpost.com/en-US/article/35002)
- [EIP-7702 doesn't explain the full theft – CCN](https://www.ccn.com/news/crypto/binance-hack-eip-7702-billions-signing-breach/)
- [One compromised laptop, billions lost – Dark Reading](https://www.darkreading.com/cyberattacks-data-breaches/binance-hack-test-attack-paths)
- [How the hack exploited internal AI agents – TheStreet](https://www.thestreet.com/crypto/artificial-intelligence/mace-ai-explains-how-6-34-billion-binance-hack-exploited-internal-ai-agents)
- [Binance AI risk systems – Gulf Business](https://gulfbusiness.com/en/1970/news/binance-ai-risk-systems-8-million-users-4-6-billion-losses/)
- [Real-time ML for fraud monitoring – Binance Engineering](https://www.binance.com/en/blog/tech%20/7972341655591522254)
- [EIP-7702: Set Code for EOAs – Ethereum EIPs](https://eips.ethereum.org/EIPS/eip-7702)
- [Anti-Money Laundering in Bitcoin with GCNs (Elliptic) – arXiv](https://arxiv.org/pdf/1908.02591)
- [The Shape of Money Laundering (Elliptic2) – arXiv](https://arxiv.org/abs/2404.19109)

Figures are as reported up to 6 November 2026; Binance calls its post-mortem an initial report, so some numbers may change.
