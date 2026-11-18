---
title: "How the Cloud Stays Up, and How It Falls Down: System Design Lessons from Microsoft's Outages"
description: "Microsoft's two biggest recent outages didn't involve a single failed server. On October 29, 2025, a configuration change to Azure Front Door, Microsoft's global edge network, caused errors…"
date: 2026-11-14
tags: [system-design, cloud, reliability]
original: https://www.linkedin.com/pulse/how-cloud-stays-up-falls-down-system-design-lessons-from-nithin-j-jxaif
---

## Two outages, zero hardware failures

Microsoft's two biggest recent outages didn't involve a single failed server. On October 29, 2025, a configuration change to Azure Front Door, Microsoft's global edge network, caused errors worldwide for about 8 hours (15:45 UTC to 00:05 UTC the next day). On July 23, 2026, a maintenance request cut Azure's West US region off from the internet for 4 hours 57 minutes.

Both were changes. Both passed safety checks that existed specifically to stop them. Microsoft itself says change, not hardware, is the main cause of reliability problems in Azure, apart from small but frequent hardware faults.

That makes these outages a good way to learn how large-scale systems actually work. When something this big breaks, you can see the architecture underneath. This piece walks through ten core system design concepts, plus how Microsoft learns from its outages. For each one, I explain the idea, show how Microsoft applies it, and then show what these outages exposed.

Short on time? Here's the two-minute version first.

[https://x.com/NithinStud84537/status/2121524764082847772?a=PZwg8gnzGnFlVd24sSY&s=20](https://x.com/NithinStud84537/status/2121524764082847772?a=PZwg8gnzGnFlVd24sSY&s=20)

## Key terms in 60 second

![](/blog/how-the-cloud-stays-up/1.webp)

Skim these now and come back when one shows up. Each one is explained properly in its section.

- **Region:** a geographic area with one or more datacenters, such as West US
- **Availability zone:** a physically separate datacenter inside a region, with its own power, cooling and network
- **WAN backbone:** Microsoft's own network linking regions and edge sites
- **Edge (Azure Front Door):** the global entry point users reach first; it handles TLS, routing and caching
- **Route advertisement:** a router announcing "send traffic for these IP addresses to me"; withdrawing it makes them unreachable
- **Control plane:** the systems that change things: deployments, config pushes, maintenance
- **Data plane:** the systems that carry real user requests
- **SLO and error budget:** the availability target (say 99.9%), and the downtime it allows you to "spend"
- **Blast radius:** how much breaks when one thing fails
- **Failure domain / cell:** a boundary a failure shouldn't cross; a cell is an independent copy serving a slice of users
- **Canary and bake time:** release to a small slice first, then wait and watch before going wider
- **Last known good (LKG):** the saved config a system can roll back to
- **Fail-static:** keep serving on the last good config when the control plane breaks
- **Fate sharing:** when the fixer depends on the thing it's trying to fix
- **Network partition:** parts of a system still running but unable to reach each other
- **CAP theorem:** during a partition, choose consistency (correct data) or availability (always answer)
- **RTO and RPO:** how long you can afford to be down, and how much recent data you can afford to lose
- **Gray failure:** the system looks healthy to its own checks while users see it broken
- **Idempotency:** doing an operation twice has the same effect as doing it once
- **Thundering herd:** many clients retrying at the same moment and overloading a recovering service
- **Metastable failure:** a system stuck in overload even after the original trigger is gone
- **PIR (postmortem):** Microsoft's written Post Incident Review of what happened and what will change

## First, how a hyperscale cloud is built

![](/blog/how-the-cloud-stays-up/2.webp)

A request to Teams or to your app on Azure crosses four layers. The two outages broke different layers, which is why they looked so different from the outside.

1. **Edge.** You first reach a nearby edge site. Azure Front Door is Microsoft's global layer-7 entry point: it terminates TLS, applies routing rules and caches content close to users. It's one shared fleet serving many customers.
2. **WAN backbone.** Microsoft's wide-area network carries traffic between edge sites and regions.
3. **Region.** A region (West US, for example) is a geographic area with one or more datacenters. Inside it, **availability zones** are physically separate datacenters with their own power, cooling and networking, so losing one doesn't take down the region. Regions are also grouped into **region pairs** for geo-redundancy.
4. **Services.** Compute, storage, databases and identity, which run on top of everything above.

Two more ideas hold this structure together:

- **Route advertisement.** Networks find each other by announcing routes. A router says, in effect, "send traffic for these IP addresses to me." If that route is withdrawn, traffic has nowhere to go, even when every server behind the router is perfectly healthy.
- **Control plane vs data plane.** The *data plane* carries the actual requests: packets, HTTP calls, database reads. The *control plane* decides how the data plane is configured: deployments, config pushes, maintenance and routing changes. Think of trains and the signalling system. Set the signals wrong and the trains stop, even though nothing is wrong with the trains.

The October 2025 outage broke the edge layer, for everyone. The July 2026 outage broke the link between one region and the WAN. In both cases the control plane made a change that broke the data plane.

## Case study: the July 2026 West US outage

![](/blog/how-the-cloud-stays-up/3.webp)

Four separate defenses failed in a row, and each one failed for a structural reason, not by bad luck. Here's the sequence from Microsoft's preliminary Post Incident Review (tracking ID ZJV6-SGG):

1. Engineers started a routine break-fix repair on an optical network device in West US.
2. An automated system converts maintenance requests into device instructions. A bug in that step widened the scope from the intended device to every optical device carrying traffic out of one datacenter.
3. A safety check confirmed that at least one of two redundant paths would stay up. It passed, because it checked each device on its own rather than the effect of isolating all of them together.
4. At 14:44 UTC, routes were withdrawn from all of those devices at once, and the datacenter dropped off Microsoft's wide-area network.
5. The automated rollback system noticed and retried several times. Every retry failed.
6. Engineers saw large-scale route churn across the WAN and took until 17:45 UTC to tie it to the West US maintenance work. The rollback finished at 18:26, and every service was declared recovered at 19:41.

Routes were withdrawn at 14:44. Most of the outage went to finding the cause, not to fixing it.

The bug isn't the interesting part, because bugs are guaranteed. The interesting part is that the scoping step, the safety check, the automated rollback and the change log all existed, and none of them stopped it.

## Concept 1: Availability is a budget you spend

![](/blog/how-the-cloud-stays-up/4.webp)

Before anyone designs anything, a large system decides how much downtime it can afford. That target is the **SLO** (service level objective), usually written in "nines." Each extra nine cuts the allowed downtime by a factor of ten:

- **99.9% ("three nines"):** 8 h 46 min of downtime a year
- **99.95%:** 4 h 23 min a year
- **99.99% ("four nines"):** 53 min a year
- **99.999% ("five nines"):** 5 min 15 s a year

The working: a year has 365 × 24 × 60 = 525,600 minutes, and 99.9% availability leaves 0.1% of that, or 525.6 minutes.

Now put the outages against it. For a service in West US with a 99.9% target, July's 297 minutes used about 57% of the whole year's budget in one afternoon. October's 500 minutes used about 95%. For a 99.99% target, July alone burned more than five years' worth of downtime.

Two ideas come out of this maths:

- **Error budgets.** The gap between 100% and your SLO is a budget. Teams spend it on launches and risky changes, and when it runs out, they freeze risky changes until reliability recovers. Microsoft did exactly this after October: it froze Azure Front Door configuration changes from October 29 to November 5 while it hardened the system.
- **Redundancy only multiplies if failures are independent.** Chain three components that each hit 99.9% and you get roughly 99.7% (0.999³). Put two 99% paths side by side and you get 99.99% (1 − 0.01²), but only if they fail independently. July is the counterexample: one change took out both "redundant" paths at once. Correlated failures are what break the nines on paper.

## Concept 2: Control plane vs data plane

![](/blog/how-the-cloud-stays-up/5.webp)

Large systems live by one rule: **the data plane must keep working when the control plane fails.** Changes come from the control plane, so it's the riskier of the two. A good design lets the data plane keep serving on its last known good state, whatever the control plane does.

Microsoft's outages show two ways this goes wrong.

**The fixer depended on what it was fixing (July 2026).** Azure's automated rollback system spotted the failed devices and retried several times. Every retry failed, because reaching those devices needed the datacenter connectivity that had just been cut. This is called **fate sharing**. You've probably seen other versions of it: a monitoring stack hosted in the region it monitors, a config-push system that needs DNS to fix DNS, or a deploy tool that logs in through the auth service it just broke. The fix is an independent path, such as out-of-band management networks and rollbacks that run with no network at all. Network engineers already have a tool for this. Junos's "commit confirmed" reverts a config on its own unless someone confirms it within N minutes. If the change cuts you off, you can't confirm it, so the device undoes it by itself.

**The safety net got overwritten (October 2025).** Azure Front Door keeps a "last known good" (LKG) configuration snapshot to roll back to. The bad configuration metadata also updated that snapshot, so the clean rollback point was gone. A rollback point should only be promoted after a change has stayed healthy for a while, never automatically by the change itself.

**What Microsoft changed: fail-static.** After October, Microsoft changed AFD so that if its master process crashes, the worker processes keep serving traffic on the LKG config. It also added a one-click revert to any previous LKG. That's the core of this concept: when the control plane is confused, the data plane keeps doing what it was last told.

*Question for design reviews: if this change breaks the network, how does the undo reach the device, and is the rollback point still clean?*

## Concept 3: Redundancy is a property of the whole set

![](/blog/how-the-cloud-stays-up/6.webp)

Large systems survive failures through redundancy. N+1 means one more component than you need, and 2N means a full duplicate. Each West US datacenter had two redundant paths to the WAN, and the maintenance system checked that at least one would stay up before it did anything.

That check passed because it judged each device on its own, not what would happen if all of them were isolated together. Here's the smallest version of the problem, for a datacenter with two exit paths, A and B:

- **Drain A alone:** path B is left. Safe.
- **Drain B alone:** path A is left. Safe.
- **Drain A and B together:** no paths left. Outage.

The checker evaluated the first two cases, and both answers were correct. The third case, which it never evaluated, is the one that ran.

An invariant like "keep at least N of M alive" doesn't compose. If each change leaves the system right at its minimum, applying them together pushes it below. Well-designed systems check the aggregate:

- **Kubernetes PodDisruptionBudgets** check each eviction against the live count of healthy pods, so ten parallel drains draw from one shared budget.
- **Raft** changes cluster membership one server at a time, or uses joint consensus, because changing several at once can create two disjoint majorities.

There's a quieter lesson too. The check validated the system's *compiled plan*, not the operator's *intent*. The engineer asked for one device, the plan covered a whole datacenter's exit links, and nothing compared the two. A one-line guard would have caught it: if the compiled scope is bigger than the requested scope, stop and page a human.

## Concept 4: Network partitions and the CAP trade-off

![](/blog/how-the-cloud-stays-up/7.webp)

Textbooks treat network partitions as rare and abstract. July 23 was a real one. Machines inside West US could still talk to each other, but traffic into and out of the region was cut. Two halves of the same system were running, each unable to reach the other.

The **CAP theorem** says that during a partition, a replicated system has to choose. It can stay **consistent**, so every read sees the latest write, or **available**, so every request gets an answer. It can't promise both while the network is split.

Take an app whose database is replicated between West US and East US, and suppose a user's write lands in West US seconds before the cut:

- **Choose consistency:** East US refuses operations it can't confirm with West US. Users see errors or read-only mode. The cost is lost availability.
- **Choose availability:** East US keeps accepting reads and writes, so the app keeps working. The cost is that the copies diverge and must be reconciled later.

Three related ideas complete the picture:

- **PACELC.** Even without a partition, you trade latency against consistency. Synchronous replication to another region adds a cross-country round trip to every write.
- **RPO vs RTO.** Asynchronous replication, the usual choice between distant regions, means a failover can lose the most recent writes. The recovery point objective (RPO) is how much data you can afford to lose. RTO is how long you can afford to be down.
- **Split brain.** If a failover fires during a partition, both sides may decide they're the primary and accept conflicting writes. That's why failover decisions need a quorum or a tie-breaker in a third location, never just "I can't see the other side."

Azure makes this choice explicit. Azure Cosmos DB, one of the services hit in July, lets each account pick one of five consistency levels, from strong to eventual. Regions are also paired for geo-redundant storage. The design lesson is to choose per kind of data, ahead of time. A shopping cart can favour availability, while a payments ledger must favour consistency. The worst choice is the one you didn't know you were making.

## Concept 5: Safe deployment treats every change as an experiment

![](/blog/how-the-cloud-stays-up/8.webp)

If change is the main cause of outages, then how you ship change is your most important reliability decision. Microsoft's framework for it, **Safe Deployment Practices (SDP)**, is a good template:

1. **Integration.** Synthetic and stress tests run until results are stable.
2. **Canary regions.** These are full Azure regions, publicly called "Early Updates Access Program" regions. One has availability zones and one doesn't, and the two form a region pair so geo-replication gets tested too. Fault injection and disaster-recovery drills run here.
3. **Pilot.** A small rollout across more hardware variety (GPUs, large-memory machines, different processor generations), with extended bake times.
4. **Broad rollout.** One availability zone per region at a time, and a region before its pair. It only moves forward while no negative signals appear.

Mandatory health signals and bake times sit between stages. The idea is simple: expose the change to a little real traffic, wait, watch, then widen.

The outages show where this model has blind spots.

**Config moved faster than the gates could see (October 2025).** AFD customer configuration was designed to reach every edge location in about 5 to 10 minutes. The bad metadata didn't crash anything right away. It caused a delayed, asynchronous failure, so every health gate passed and the change reached all locations. **A health gate only catches failures that show up within its bake time.** Microsoft made config processing synchronous, so failures are detected within 10 seconds per stage. It also added stages and longer bake times, which slowed global propagation to about 45 minutes. That's the real trade-off: 5 minutes is a great feature for customers, and 45 minutes is the price of safety.

**The break-glass path skipped the guards (October 9, 2025).** In an earlier AFD incident, the protection system initially blocked the bad metadata. Then a manual cleanup operation bypassed it. Emergency paths are used under the most stress, so they need the same guards as normal ones.

**Operations aren't deployments, but they should be staged like them (July 2026).** Routes were withdrawn from every in-scope device at once. Maintenance, config changes and data migrations all need the same pattern as code: one device first, observe, then more.

## Concept 6: Blast radius, failure domains and cells

![](/blog/how-the-cloud-stays-up/9.webp)

Failures are guaranteed, so the real design question is how much breaks when one happens. That's the **blast radius**. You shrink it by drawing **failure domains**, boundaries a failure shouldn't cross, at every level: server, rack, availability zone, region. **Cell-based architecture** goes further. You split a service into many independent copies, or cells, each serving a slice of customers, so a bad change or a poison request takes down one cell instead of everything.

The two outages make a clean contrast:

- **July 2026 (4 h 57 min):** one region's link to the WAN broke. The region boundary held, because traffic inside West US kept working. It spread because the automation's scope wasn't tied to a failure domain.
- **October 2025 (8 h 20 min):** the global edge, Azure Front Door, broke. No boundary held. It spread because config propagated everywhere, and all tenants shared one edge fleet with no per-tenant isolation.

Two lessons follow:

- **Global services need cells, because they have no regions to hide behind.** A region boundary works as a wall when the failure starts inside it, and AFD had no such wall. Microsoft is redesigning AFD as micro-cells with layered ingress shards, so a config or traffic regression in one cell can't affect other tenants. It's also adding a per-server "Food Taster" process that loads new configs in isolation before the real serving processes do. Both had target dates in the first half of 2026.
- **Make automation aware of failure domains.** No single request should be able to touch more than one cell, one datacenter's exit links, or a fixed share of capacity, no matter what its safety checks say. A hard cap doesn't depend on the scoping logic being correct, and that's exactly why it works.

## Concept 7: Traffic management and failover

![](/blog/how-the-cloud-stays-up/10.webp)

At scale, a routing layer decides which healthy copy of a service handles each request. There are three main layers of it, from coarse to fine:

1. **DNS-based routing.** A service like Azure Traffic Manager answers DNS lookups with the address of a healthy region. It's simple and global, but slow to change, because resolvers and clients cache answers for the record's TTL (time to live), and some keep them even longer.
2. **Anycast and global layer-7 load balancing.** Many edge sites announce the same IP address, and internet routing delivers each user to a nearby one. Edge services like Azure Front Door then choose a healthy backend for each request.
3. **Regional load balancers.** These spread traffic across zones and instances, and use health probes to drop unhealthy ones.

Both outages tested this layer.

**July: rerouting only went so far.** Microsoft's first move was to reroute traffic through alternate network paths. That helped, but many services stayed affected until the rollback. My reading of why: you can route users away from a region only if a healthy copy of the service, and its data, exists somewhere else. A service whose data lives only in West US has nowhere to send the traffic. **Failover is a property of your data, not just your network**, which ties straight back to the CAP choices above.

**October: the router itself failed.** When AFD crashed, it took down connectivity and DNS resolution for every application using it. If the layer that routes around failures is the thing that failed, nothing is left to route around it. Critical services need a path that skips the shared edge, such as a DNS-level fallback straight to the origin.

There are two broad multi-region designs:

- **Active-passive.** One region serves and the other waits. Failover needs someone, or something, to decide the primary is dead, and during a partition that decision is exactly where split brain comes from.
- **Active-active.** Every region already serves traffic, so "failover" just means removing one. It's faster and more honest, but every region needs the data, which brings back the consistency trade-off.

Whichever you pick, test it. Microsoft runs fault injection and disaster-recovery drills in its canary regions for this reason. A failover path nobody has tested is just a hope.

## Concept 8: Observability and gray failure

![](/blog/how-the-cloud-stays-up/11.webp)

You can't fix what you can't see, and at scale the hard part isn't collecting metrics. It's knowing which ones describe what users actually experience.

In July, engineers spent about three hours (14:44 to 17:45 UTC) debugging a system that looked healthy. Physical links were up and routing adjacencies looked normal. The symptoms looked like a WAN routing problem between Azure and third-party networks, not like "a datacenter fell off the network." The repair also never showed up in the event log, because its preparation steps hadn't finished. So the first question in any incident, "what changed in the last hour?", had no answer.

Researchers at Microsoft named this pattern **gray failure**: the system looks fine to its own failure detectors while users experience it as broken (Huang et al., HotOS 2017). Three design ideas follow from it:

- **Measure from where users are.** Link state describes the parts. A synthetic probe from another region ("can a client in East US reach a VM in West US?") describes what users see, and it would have shown the datacenter as unreachable even with every link up.
- **Log intent before you act.** A database writes to its write-ahead log *before* it changes any data, so a crash always leaves a record of what was in flight. A change system should do the same: record "about to touch these devices" before the first command, not after the last one succeeds. The change that fails halfway is the one you most need to find.
- **Wait long enough to see slow failures.** As October showed, a check that passes in the first minute says nothing about a crash that comes later. Health signals need a window that matches how failures actually unfold.

## Concept 9: Dependencies and cascading failure

![](/blog/how-the-cloud-stays-up/12.webp)

At scale, nothing runs alone. Products sit on shared platforms, and every dependency's outage becomes yours.

- **July 2026:** Microsoft 365 apps such as SharePoint, Teams, OneDrive and Copilot Chat failed for users whose traffic ran through West US, because they run on Azure. Outside Microsoft, IncidentHub tracked 19 services that publicly acknowledged impact, including MongoDB Cloud clusters in West US, delayed Azure metrics at Datadog and degraded portals at Wiz.
- **October 2025:** AFD sat in front of Microsoft's own services and thousands of customer applications, so one edge failure hit all of them together. Afterwards, Microsoft moved its internal services onto a separate, isolated AFD fleet that runs active/active with automatic failover.

Three ideas limit the cascade:

- **Find the shared layers.** Identity, DNS, the edge and config systems sit underneath almost everything. Know which ones are single points of failure for your product.
- **Design for static stability.** When a dependency fails, keep serving from what you already have, such as cached routes, cached credentials and the last config, rather than calling into the broken system.
- **Check what your failover depends on.** Multi-region only helps if failing over doesn't need the failed region. If your DNS records, secrets or deploy pipeline live in West US, your "failover" is one more thing that's down.

## Concept 10: Recovery is its own engineering problem

![](/blog/how-the-cloud-stays-up/13.webp)

Teams measure recovery with **RTO** (recovery time objective), the longest a service is allowed to stay down. Both outages show that undoing a bad change and getting back to normal are two different things.

- **October 2025:** When the AFD master process crashed, recovery meant reloading hundreds of thousands of configurations, which took about 4.5 hours. Microsoft's target is now under 10 minutes, by recovering from a local cache instead of rebuilding from scratch.
- **July 2026:** The network rollback finished at 18:26 UTC, but Azure didn't declare all services recovered until 19:41, another 75 minutes. Of the 19 downstream services IncidentHub tracked, 16 still had open incidents after Azure's all-clear.

Why does recovery lag behind the fix? When connectivity comes back after hours, everything happens at once. Clients retrying on fixed timers hit the service together (a **thundering herd**), caches are cold, connection pools all reconnect, and queues start draining a backlog of several hours.

In the worst case, a system stays stuck after its trigger is gone: retries add load, load causes timeouts, and timeouts cause more retries. Bronson et al. call this a **metastable failure** (HotOS 2021). IncidentHub didn't see clear reports of this in July, though it notes some may have happened.

The defences are well known but often skipped:

- Exponential backoff **with jitter**, so retries spread out instead of arriving in sync.
- Retry budgets, for example capping retries at 10% of normal request volume.
- Circuit breakers and load shedding, so a recovering service can say no instead of falling over again.
- A gradual traffic ramp after mitigation instead of switching everything back on at once.
- Practising recovery itself. A fast cold start is a feature you build and test, not something you get for free.

**Idempotency is what makes retries safe.** Every recovery mechanism above repeats something. Clients retry requests, and Azure's rollback system retried its rollback several times. A retry is only safe if doing an operation twice has the same effect as doing it once. "Set this route to state Y" is idempotent. "Add a route" or "charge ₹500" is not. There are two standard fixes:

- **Declare the desired state, not the steps.** Declarative systems like Kubernetes compare what *is* with what *should be* and close the gap, so running them twice changes nothing.
- **Attach an idempotency key.** The client sends a unique ID with each request. The server remembers it and returns the first result for any repeat, which is how payment APIs avoid double charges.

Without idempotency, the retries that rescue you during an outage leave duplicates behind after it.

## How Microsoft learns: the postmortem loop

![](/blog/how-the-cloud-stays-up/14.webp)

Every concept in this article came from a public incident report. Large systems don't get reliable by being right the first time. They get reliable through a feedback loop, and Azure's is unusually open:

1. **Preliminary review.** July's preliminary Post Incident Review (PIR) was public the next day, July 24, with the timeline and what was known so far.
2. **Final review.** A final PIR usually follows within about 14 days, after an internal retrospective.
3. **Live retrospective.** Azure ran an "Azure Incident Retrospective" livestream for the July incident on August 27 and 28, 2026, led by Azure Networking leadership. It covered what happened, how Microsoft responded, what it learned and the fixes, with live Q&A.
4. **Dated repair items.** For October, Microsoft published a list of repairs with target dates (fail-static serving, synchronous config processing, cells, faster recovery) and marked which ones were done.

Notice how the reports are written. They blame a bug in a request-conversion system, a defect in a deployment pipeline and a check that judged the wrong unit, not the engineer who filed the request. That's the idea behind **blameless postmortems**: assume people acted reasonably with the information and tools they had, then fix the system that let a reasonable action cause an outage. When nobody gets punished for the truth, people report near-misses honestly, and near-misses are the cheapest outages you'll ever learn from.

## Cheat sheet for your next design review

Each concept, the lesson Microsoft's outages teach about it, and what to build:

1. **Availability and SLOs.** What the outages showed: July used about 57% of a 99.9% yearly budget, and two "redundant" paths failed together. What to build: SLOs with error budgets, change freezes when the budget runs out, and planning for correlated failures.
2. **Control vs data plane.** What the outages showed: rollback needed the network it was fixing, and the bad config overwrote the LKG snapshot. What to build: out-of-band management, device-local auto-revert, fail-static serving, and an LKG promoted only after a healthy bake.
3. **Redundancy.** What the outages showed: a per-device check approved a change that removed both paths. What to build: invariants checked over the whole batch, and the compiled plan diffed against the request.
4. **Partitions and CAP.** What the outages showed: the region could talk to itself but not to the world. What to build: a consistency-or-availability choice per kind of data, and a quorum tie-breaker in a third location.
5. **Safe deployment.** What the outages showed: global config in 5–10 minutes outran the health gates, and a manual override skipped the guards. What to build: config staged like code, bake times longer than the slowest failure, and the same guards on break-glass paths.
6. **Blast radius.** What the outages showed: a shared global edge had no wall, and automation scope ignored failure domains. What to build: cells per tenant slice, and hard caps per failure domain.
7. **Traffic and failover.** What the outages showed: rerouting only partly helped, and in October the routing layer itself failed. What to build: data available in the failover region, a path around the shared edge, and regular failover drills.
8. **Observability.** What the outages showed: green link metrics, no change record, and three hours to find the cause. What to build: external synthetic probes, and intent logged before acting.
9. **Dependencies.** What the outages showed: Microsoft 365 and 19+ outside services went down with Azure. What to build: a map of shared layers, static stability, and failover that doesn't need the failed region.
10. **Recovery.** What the outages showed: a 4.5-hour config reload, and a 75-minute recovery tail after the fix. What to build: local-cache cold starts, backoff with jitter, retry budgets, idempotency keys, and a gradual ramp.
11. **Postmortems.** What the outages showed: a preliminary review the next day, a final review, a public retrospective and dated repairs. What to build: blameless reviews with owned, dated repair items.

## The takeaway

![](/blog/how-the-cloud-stays-up/15.webp)

Microsoft runs one of the most carefully engineered systems in the world. It has staged rollouts, canary regions, redundancy checks, automated rollback and last-known-good snapshots. Both outages got through anyway, because each safeguard quietly assumed something about another: that requests stay the size they were filed at, that the network to the devices stays up, that failures show up quickly, that the rollback point stays clean.

That's the real lesson of large-scale system design. Systems rarely go down because someone forgot a safeguard. They go down where safeguards make assumptions about each other. The skill is learning to spot those assumptions before production does.

Which of these assumptions is your system making right now?

## Sources

- [Microsoft blames massive Microsoft 365 outage on maintenance bug](https://www.bleepingcomputer.com/news/microsoft/microsoft-blames-massive-microsoft-365-outage-on-maintenance-bug/), BleepingComputer: July 2026 timeline, affected services, traffic rerouting, summary of the preliminary PIR
- [Quick thoughts on Azure Regional Outage from July 23, '26](https://surfingcomplexity.blog/2026/08/16/quick-thoughts-on-azure-regional-outage-from-july-23-26/), Lorin Hochstein: the per-device safety check, rollback fate sharing, why diagnosis was hard (quotes the PIR)
- [The July 23 2026 Azure West US Outage](https://blog.incidenthub.cloud/azure-west-us-outage-jul-23-2026), IncidentHub: UTC timeline, impacted services, the 19 tracked downstream services
- [Azure Front Door: Implementing lessons learned following October outages](https://techcommunity.microsoft.com/blog/azurenetworkingblog/-/4479416), Azure Networking blog: October 2025 root cause, global propagation, change freeze, fail-static, cells, recovery targets
- [Advancing safe deployment practices](https://azure.microsoft.com/en-us/blog/advancing-safe-deployment-practices/), Microsoft Azure blog: SDP stages, canary regions, DR drills, bake times, change as the main cause of incidents
- [Azure Incident Retrospective, tracking ID ZJV6-SGG](https://techcommunity.microsoft.com/event/azureevents/azure-incident-retrospective---please-register-session-1---tracking-id-zjv6-sgg-/4548678), Microsoft Tech Community: the July 2026 retrospective livestream
- Microsoft Azure preliminary Post Incident Review, tracking ID ZJV6-SGG (Azure status history)
- Huang et al., "Gray Failure: The Achilles' Heel of Cloud-Scale Systems," HotOS 2017
- Bronson et al., "Metastable Failures in Distributed Systems," HotOS 2021
