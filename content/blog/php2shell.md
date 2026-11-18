---
title: "PHP2Shell: how \"when memory runs out, jump away and don't look back\" became a remote shell on most of the web"
description: "A first-principles walkthrough of CVE-2026-109618 and CVE-2026-109619 — the two critical PHP RCE flaws disclosed on 21 October 2026. Written to actually explain the engineering failure, not repost…"
date: 2026-10-24
tags: [security, exploits]
original: https://www.linkedin.com/pulse/php2shell-how-when-memory-runs-out-jump-away-dont-look-nithin-j-parhf
---

*A first-principles walkthrough of CVE-2026-109618 and CVE-2026-109619 — the two critical PHP RCE flaws disclosed on 21 October 2026. Written to actually explain the engineering failure, not repost the headline.*

---

## The 20-second version

A single HTTP request. No login. No vulnerable plugin. And an attacker is running code on your server **before your application code even starts**.

That is PHP2Shell: two critical vulnerabilities (CVE-2026-109618 and CVE-2026-109619, both CVSS 4.0 9.2) in the PHP engine that powers roughly 70% of the web. They were disclosed and patched on 21 October 2026. I spent real time understanding the *engineering* failure rather than the headline, and the root cause turns out to be beautifully, uncomfortably simple — one design decision from around 2004.

This article builds it up from scratch: a plain analogy first, then the actual code, with a diagram at each step.

---

## The facts, up front

- **What:** Two unauthenticated remote-code-execution flaws in PHP core (the Zend engine, ext/session, ext/standard).
- **Severity:** CVSS 4.0 **9.2 Critical** each. The vector is AV:N/AC:H/AT:P/PR:N/UI:N — network-reachable, no privileges, no user interaction, but **high attack complexity** (it needs heap grooming; it is not a reliable one-shot).
- **Fixed in:** PHP **8.2.35, 8.3.36, 8.4.27, 8.5.12**. Source-only backports exist for 7.4 / 8.0 / 8.1; 8.1 and older get nothing official from PHP.
- **Found by:** Calif (researcher Ryan Austin) within OpenAI's "Patch the Planet," with the PHP Foundation; Wiz Research independently confirmed overlapping issues.
- **The fix:** one commit, 01a40e89fb, "Avoid state corruption via bailout."

**Confirmed vs. not, so I don't overstate:** Confirmed — unauthenticated RCE on Apache mod_php under *default* limits. Not fully public — a complete end-to-end FPM exploit for 109618 (source analysis says it's susceptible; no full demo was published). I flag these as I go.

---

## 1. The one idea behind both bugs

Forget PHP for a second. Picture a bank teller filling out a form: write the **name**, then the **account number**, then stamp **DONE**. Halfway through — name written, number not yet — a **fire alarm** goes off and the teller bolts, instantly, no time to finish or cross anything out.

Later, someone picks up that half-filled form, sees a name, assumes it's valid, and acts on it. That wrong action is the entire bug

![](/blog/php2shell/1.webp)

Mapping it to PHP:

- the **teller** = PHP setting up internal data in memory
- the **fire alarm** = PHP running out of memory
- the **half-filled form** = partly-initialized memory
- the **someone who trusts it** = PHP's own cleanup or startup code

When an attacker can choose *when* the alarm fires, they choose *what* gets left half-done — then PHP acts on it. "Acts on attacker-shaped garbage memory" is what eventually becomes "runs my code."

There are two CVEs because there are two answers to "who trusts the mess?":

- **CVE-2026-109618** — the mess is consumed in the *same request*, during shutdown.
- **CVE-2026-109619** — the memory is freed, but a worker-global pointer still points at it, and the *next request on the same worker* follows that pointer into reused memory.

---

## 2. Five terms you need

- **SAPI** — the glue between a web server and PHP. Same engine underneath; what differs is how a request arrives and *what happens when startup fails*. The two that matter: **Apache mod_php** (PHP runs inside the Apache worker) and **PHP-FPM** (a pool of standalone PHP workers).
- **Worker reuse** — one worker process handles thousands of requests in a row. So anything left in process-global memory after request N is still there for request N+1 unless something resets it. This is the precondition for bug two.
- **Zend / zval / HashTable** — Zend is PHP's core engine. A *zval* is the C struct for any value. A *HashTable* backs every PHP array, including $_POST and $_FILES; inside it are Buckets and counters, notably nNumUsed (slots in use). Remember nNumUsed.
- **ZendMM and** memory_limit — PHP's own per-request allocator. It enforces memory_limit (default 128 MB): an allocation that would cross it triggers a fatal out-of-memory error.
- zend_bailout() / longjmp() — the keystone. On a fatal error (including OOM), PHP doesn't return an error up the call stack. It runs a C longjmp — a non-local jump straight back to a saved point, **skipping every function in between and running none of their cleanup**. No destructors fire. Whatever a half-finished function was about to do next simply never happens.

**That last point is the vulnerability.** Everything below is just *where* the half-finished code was.

---

## 3. Where the bug lives: the request lifecycle

![](/blog/php2shell/2.webp)

The thing to see: **PHP parses the multipart request body during** php_request_startup() — before your script, before PHP even finishes activating its own modules. An attacker's POST body is turned into HashTables and zvals while the engine is still setting itself up. No framework, no auth check, nothing of yours has run.

That is why "your application security doesn't matter here" is literal. Your locks are on a door the attacker never has to walk through.

---

## 4. Pulling the fire alarm on command

To weaponize the bolt, the attacker must force an OOM *at a chosen moment*, within default limits. There's an obstacle: post_max_size (default 8 MB) is meant to stop a request ever delivering enough to exhaust the 128 MB memory_limit. Calif found ways around it:

- **Length-check bypass:** PHP checks post_max_size against the *declared* Content-Length, not the bytes it actually consumes. A chunked HTTP/1.1 or lengthless HTTP/2 multipart request sails past the check and keeps feeding data.
- **Unbounded headers per multipart part**, whose in-memory cost dwarfs their wire size.
- **The amplifier: empty uploads with nested names** — the elegant one, next section.

The real skill isn't "reach the limit." It's **aim the bolt**: pad the heap to just below 128 MB so the *next* allocation — the one inside the vulnerable engine operation — is the straw that breaks it. Think of allocations as dominoes: you want one *particular* domino (standing inside the HashTable insert, or the session handler) to be the last before the fall.

---

## 5. Why nested names explode (the part that confused me)

It is not a "loop" you trigger. A nested field name forces PHP to build a **tree of arrays** instead of storing one value — and for uploads it builds that tree six times.

Start simple. color=red stores one value. But color[a][b][c] tells PHP: "color is an array, make an array inside it for a, and inside that for b, and inside that put c." Each bracket is one more array PHP must allocate.

![](/blog/php2shell/3.webp)

Now the multiplier. For a *file upload*, PHP records six facts about every file — name, full_path, type, tmp_name, error, size — as six parallel arrays. So files[a][b][c] makes PHP build that same 3-layer tree **six separate times**.

![](/blog/php2shell/4.webp)

Fifteen bytes of field name becomes dozens of heap allocations; a body under 8 MB pushes the heap past 128 MB. So: **systematic nested empty-uploads let the attacker set the memory pressure precisely, so the OOM bolt fires at a chosen moment, leaving exploitable half-finished state behind.** Reach *and* aim.

---

## 6. Bug one — the half-filled form (CVE-2026-109618)

When PHP adds an entry to a HashTable, the order (from _zend_hash_str_add_or_update_i) is: bump the count **first**, then allocate the key, then fill in the value. If OOM bolts during the key allocation, the counter says "1 item present" but the slot is blank garbage. Then teardown (zend_array_destroy) loops over exactly nNumUsed slots and frees each as if real.

![](/blog/php2shell/5.webp)

On Apache mod_php this is reached during startup parsing, before any app code — the confirmed unauthenticated path.

**Confirmed:** end-to-end RCE on mod_php with default limits and normal multi-worker prefork. FrankenPHP is named as likely susceptible; FPM susceptible by source analysis, but no complete FPM exploit for this CVE was published.

---

## 7. Bug two — the note on the wall (CVE-2026-109619)

This one spans *two* requests. The producer is **session upload-progress**, a feature on by default that runs *while the body is still being parsed*, before your script, whenever a multipart POST carries a session ID and a PHP_SESSION_UPLOAD_PROGRESS field. It opens a session and stashes pointers to it in **worker-global** memory.

![](/blog/php2shell/6.webp)

The advisory names two confirmed consumers that run *before* normal request init: this session path, and on PHP 8.5 a **fatal-error-backtrace** path (fatal_error_backtraces) whose reset is always missed during shutdown — the basis of the confirmed mod_php RCE.

**Confirmed:** fatal-backtrace path → RCE on mod_php. Session-lifecycle path → RCE on *both* mod_php and FPM. (For FPM, the producer must fire *after* startup succeeds — see next section.)

---

## 8. Why mod_php is worse than PHP-FPM

The cleanest "aha" in the whole incident is what each SAPI does when request startup fails.

![](/blog/php2shell/7.webp)

mod_php runs cleanup even after a failed startup, so it consumes the broken state before any app code. FPM kills the whole worker on a startup failure, which blunts that path — so FPM's confirmed 109619 route needs the fatal to land *after* startup succeeds, during application code, which makes it application-dependent rather than pre-auth.

What request authentication can and cannot do: it **cannot** protect the startup-parse window (nothing of yours has run). It **can** narrow the post-startup FPM variant — but only if reachable routes never hit an attacker-influenced fatal. Your framework is not the source of the bug; at most it is one link in the FPM chain.

---

## 9. From crash to shell — the honest version

A memory-safety bug is not automatically a shell. Triggering a crash is easy; *reliable* code execution is the hard, build-dependent part. The conceptual ladder: a reachable request shapes the heap → an aimed OOM bolt creates a use-after-free → the freed slot is reclaimed with chosen bytes → a controlled pointer/type write becomes code execution. Reliability varies with PHP build, extensions, frontend, and allocator layout — that is the "high attack complexity" in the CVSS score.

Code runs as the **web-worker account** (e.g. www-data), not root. Still full site compromise and a network foothold. (No payloads here — this is conceptual by design.)

---

## 10. The fix

One commit, 01a40e89fb, attacks the root choice — **OOM no longer does** longjmp — in four places:

1. **Memory manager:** a fallible-allocation model returns NULL on exhaustion instead of bailing out; a graceful soft-OOM at the next VM safe point, with a hard _exit() only past a second threshold.
2. **Multipart parser** (main/rfc1867.c): uses those fallible allocations and checks for failure.
3. **Upload-progress handler:** stops forcing the session active regardless of result; runs the unserializer in an "incomplete classes only" mode in that pre-script window (no autoloaders, no __wakeup(), no destructors).
4. **Globals:** startup-accessed globals are reset properly so an early unwind can't leave half-initialized state.

**Updating is the only complete fix.** Every published mitigation is explicitly partial.

---

## 11. If you run PHP: what to actually do

- **Patch the runtime** to 8.2.35 / 8.3.36 / 8.4.27 / 8.5.12. Verify the *web* SAPI version via phpinfo(), not just CLI php -v — they can differ. Rebuild container images that bundle PHP.
- **Updating WordPress / Composer dependencies does nothing** — the flaw is in the engine beneath them.
- **Partial, buy-time mitigations** (all explicitly incomplete per PHP's advisory): enforce memory_limit=-1 via php_admin_value (helps 109618; do **not** use RLIMIT_AS/DATA, which reintroduce the path); session.upload_progress.enabled=0 + restart workers (confirmed 109619 session paths); fatal_error_backtraces=0 on 8.5; low post_max_size and proxy-level caps on parts/headers/nesting; WAF rules are pattern-based.
- **Watch for:** repeated "Allowed memory size … exhausted" fatals before scripts run, worker crashes, multipart POSTs with no usable Content-Length or extreme nesting, and the web-worker account spawning processes or making outbound connections. Absence of these is not proof of safety — the flaw runs below the application layer, and patching does not remove code an earlier compromise may have dropped.

---

## 12. Five misconceptions worth correcting

1. **"It's a WordPress/Laravel bug — my framework is patched."** No. It's in the PHP engine, triggered during startup before any framework code runs. Only upgrading the PHP runtime fixes it.
2. **"It needs a login, a plugin, or uploads enabled."** No. Pre-auth; parsing happens on any request; session upload-progress is on by default and needs no session_start(); empty "uploads" carry no real file.
3. **"Both CVEs are the same bug twice."** No. Shared root cause, but 109618 is consumed in the same request (uninitialized memory) and 109619 across two requests (stale freed-memory pointer). Each is independently exploitable.
4. **"A WAF or** memory_limit=-1 makes me safe." No. PHP's own advisory says every mitigation is partial. Updating is the only complete fix.
5. **"AI found an unfindable bug by itself."** Mostly no. The core OOM issue was reported in 2020 and re-noticed in 2024. A human set the research direction from PHP's 20-year history; models accelerated the variant analysis and chaining. "Know your target" still wins.

---

## The engineering lesson

Non-local control flow (longjmp) plus manual cleanup plus long-lived global state is a memory-safety trap — even in a runtime this mature and this fuzzed. "Out of memory" stopped being a harmless failure and became "choose the instruction that fails." And the reports from 2020 and 2024 stalled precisely because exploitation wasn't *proven* — a reminder that exploitability, not mere presence, is what drives fixes.

---

## Primary sources

- Calif disclosure — "php2shell: A tale of two PHP remote vulnerabilities" — [calif.io/php2shell](http://calif.io/php2shell)
- PHP advisory CVE-2026-109618 (OOM corruption) — GHSA-w8hw-w9fx-j79w
- PHP advisory CVE-2026-109619 (stale global state) — GHSA-6wmf-4rv5-p3rp
- [php.net](http://php.net) security release, 21 Oct 2026 — [php.net/archive/2026](http://php.net/archive/2026)
- oss-security announcement (Jakub Zelenka) — [openwall.com/lists/oss-security/2026/10/21/6](http://openwall.com/lists/oss-security/2026/10/21/6)
- Original 2020 report — PHP bug #78876
- Independent analysis — OX Security (commit 01a40e89fb breakdown); Wiz Research ([wiz.io/blog/php2shell-php-rce](http://wiz.io/blog/php2shell-php-rce))

*Code fragments are as quoted in Calif's writeup. The teller, bank-form, and domino framings are teaching analogies, not source behaviour. Educational security research only — no weaponized exploit or payloads are included.*
