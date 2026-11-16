---
title: "Keeping a 1v1 duel fair when the network isn't"
description: "How MathDuel gives two players identical questions, never sends an answer to the browser, and stops ping from deciding who wins."
date: 2026-11-10
tags: [realtime, websockets, redis]
---

[MathDuel](https://mathduel.me) is a two-minute game: two players are matched by rating, race through the same twenty arithmetic questions, and the result moves a Glicko-2 ladder. The game logic is small. Making it *fair* took most of the work, and that is what this post is about.

## Same questions, no answers on the wire

Both players need identical questions in an identical order, or the match means nothing. The obvious approach is to generate a list and send it to both clients. That list contains the answers, or enough to compute them before the question appears.

Instead, each duel gets one random seed. Questions are generated from that seed on the server, so both players provably get the same set. A client only ever receives the prompt it is currently on, and the server does the comparing.

```ts
// Simplified: the browser sends a value, never learns the answer.
socket.send(JSON.stringify({ t: "answer", value: 102 }));
```

A side effect I like: the load-test bots have to parse each prompt and do the arithmetic themselves. There is no shortcut for them to take, because there is nothing to leak.

## Ping should not pick the winner

If you time a solve from "server sent the question" to "server received the answer", the player on the worse connection pays for their latency twice. On a ladder, that is a rating tax on bad Wi-Fi.

So the server stamps `served_at` when a question is handed out, and when the answer arrives it subtracts half the measured round-trip time from the solve duration. Ties break on that adjusted thinking time, not on who has the better internet connection.

> First to the end wins. Ties break on genuine thinking time.

## Two gateways, one duel

Each player talks to a stateless WebSocket gateway, and the two players in a duel are often on different gateways. Both gateways therefore try to do the shared steps: start the countdown, tick, finalize.

Rather than electing a leader, every one of those steps is guarded on the API side. The first caller wins and the second gets a `409` and carries on. It is boring, and it removed a whole class of "the duel started twice" bugs.

Matchmaking has the same shape of problem. Two players polling at once must never both be paired with the same third player, so pairing is a single Lua script in Redis: find a candidate inside the rating window with `ZRANGEBYSCORE`, then `ZREM` both players in the same atomic operation.

## Does it hold up?

I load tested it against a staging box sized the same as production (2 vCPU, 4 GiB), over real HTTPS and WSS, with each virtual user playing full duels and getting 15% of answers wrong on purpose.

| | 10 players | 400 players |
|---|---|---|
| Answer round trip p95 | 5 ms | 13 ms |
| Duels completed | 16 | 1,387 |
| Duels failed | 0% | 0.07% |
| Answers submitted | 359 | 28,622 |

That is roughly 200 simultaneous duels through a single Python process. The honest caveat: I did not find the ceiling. Latency had barely moved at 400 players, and the run meant to find the limit was invalidated by a bug in my load script, not by the server. Real capacity is somewhere above 400 and still unmeasured.

The full architecture and the list of known limitations are in the [README](https://github.com/nithinj25/math_dual).
