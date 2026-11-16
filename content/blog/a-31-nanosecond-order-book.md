---
title: "What I learned building a 31-nanosecond order book"
description: "A lock-free matching engine in C++17, and the three ideas that mattered more than any clever trick."
date: 2026-11-03
tags: [cpp, performance, lock-free]
---

I built [orderbook_cpp](https://github.com/nithinj25/orderbook_cpp) to understand what actually makes a matching engine fast. Not to compete with a real exchange, but to be able to explain every nanosecond. The matching core now handles a message in about 31 ns at the median and 95 ns at p99, roughly 16 million messages a second on a laptop.

Three ideas did most of the work.

## 1. One thread that never waits

Orders arrive on a single-producer, single-consumer ring buffer. A dedicated thread matches them and writes execution reports to a second ring. That matching thread never allocates and never does I/O.

Because each ring has exactly one writer and one reader, neither needs a lock. The read and write indices each sit on their own cache line, so the two threads are not fighting over the same 64 bytes.

A detail that surprised me: the `Order` struct is 28 bytes and deliberately *not* padded to a cache line. Padding prevents false sharing between threads. Orders are only ever touched by the matching thread, so padding them would just mean fewer orders per cache line.

## 2. The price is the index

The book is an array indexed directly by price. Each price level holds a FIFO queue, so the first order to arrive at a price is the first to trade.

```text
asks[60005] -> [id 2: 5 lots] -> [id 7: 3 lots]
asks[60000] -> [id 1: 10 lots]            <- best ask
- - - - - - - - - - - - - - - - - - - -      the spread
bids[59995] -> [id 4: 8 lots]             <- best bid
```

No tree, no hashing, no comparisons to find a level. The cost moves somewhere else: after the best level empties, you have to find the *next* best one.

## 3. A bitmap to find the best price

Walking price levels one at a time is fine when the book is dense and terrible when it is sparse. A hierarchical bitmap, where each bit says "something lives below here", turns the search into a couple of bit scans.

| Book density | Linear walk (p50) | Bitmap (p50) |
|---|---|---|
| 1 level in 50 occupied | 35 ns | 12 ns |
| 1 level in 1,000 occupied | 398 ns | 13 ns |
| 1 in 1,000, at p99 | 2,106 ns | 22 ns |

The bitmap's cost does not change as the book empties out. That flat line is the result I am happiest with.

## Proving it

Two habits made these numbers trustworthy to me:

- **Differential testing.** The fast book runs against a simple reference book on the same stream of orders, and any disagreement is a failure.
- **Timing with the cycle counter.** A normal clock call costs about as much as the operation being measured.

The caveat is the environment. These are numbers from a laptop under WSL2, not an isolated server. Percentiles up to p99 are stable between runs; the tail beyond p99.9 moves around.
