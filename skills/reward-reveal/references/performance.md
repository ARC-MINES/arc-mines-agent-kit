# Server load and performance engineering

The architecture separates authoritative mutation from presentation scheduling.
The server resolves an intent; the client renders the intermediate frames.
This keeps presentation richness independent of request count.

## 1. Bound request amplification

One successful opening requires one mutation request in the normal path.
Sixteen preview frames require zero additional outcome requests. Multiple
pedestals can be resolved in one player command and one transaction, provided
the server bounds pedestal count and validates the entire action.

Let `U` be active players and `r` be openings per player per second. Normal
opening traffic is approximately `U * r`. A naive request-per-preview-frame
design would create `U * r * F` requests for `F` frames. Moving presentation
local removes that factor; it does not establish a system capacity limit.

For illustration, 1,000 players opening once every five seconds create 200
opening requests/s, versus 3,200 in a hypothetical 16-request preview design.
This is arithmetic, not a load-test result. Session requests, synchronization,
placement, retries, and malicious traffic must be added separately.

A 1.5 s server cooldown bounds accepted rolls per player to about 0.667/s over
time. It does not bound rejected HTTP traffic, multi-account traffic, or other
commands. Enforce request-size limits and admission/rate controls independently.

## 2. Amortize weighted selection

For a loot table whose weights are linear in luck:

```text
w_i(luck) = base_i * (1 + luck * bias_i)
B_j      = sum(base_i)                 for i <= j
L_j      = sum(base_i * bias_i)        for i <= j
C_j(luck)= B_j + luck * L_j
ticket   = unit_random * C_last(luck)
result   = first j where ticket < C_j(luck)
```

Compile the base and bias prefixes once per process/isolate. Select by binary
search over the monotonically increasing cumulative weights. Validate the loot
configuration at compilation, and validate server-owned luck and random inputs
at their relevant boundary. Use cryptographic entropy for actual server rolls.

| Operation                 | Rebuild and linear scan | Compiled prefixes               |
| ------------------------- | ----------------------- | ------------------------------- |
| Table preparation         | O(n) per draw           | O(n) once per table version     |
| Selection                 | O(n)                    | O(log n)                        |
| Weight-array allocation   | O(n) per draw           | None per draw                   |
| Persistent table memory   | O(n)                    | O(n)                            |
| Luck-dependent adjustment | Rebuild every weight    | Two scalars at each search step |

The reference [sampler](../examples/sampler.mjs) implements this pattern.
It assumes positive base weights and non-negative linear bias. Nonlinear luck,
conditional exclusions, finite inventory, and pity counters need their own
correct distribution model. Do not reuse cached prefixes after a loot-table
change; compile a new version at the configuration boundary.

Do not equate low algorithmic complexity with low end-to-end latency. For small
tables, serialization and storage can dominate the request. Measure before
adding alias tables, caches keyed by every luck value, or extra services.

## 3. Isolate player contention

Serialize mutations for one player, not every player globally. State and receipt
must share a durable transaction. Different players should not wait behind one
shared application mutex. Never hold a transaction open for the reveal animation.

Bound receipt history. With `R` retained replies and serialized reply size `S`,
receipt storage is approximately O(R * S) per player. A sixteen-receipt history
does not become constant-size in bytes if snapshots grow without bounds. Track
snapshot bytes, cap mutable collections, and retain monotonic revisions after
receipt eviction to prevent old successful commands from executing twice.

The game-inspired model keeps sixteen successful receipts. Its synchronous
execution models ordering only. A deployed system needs actual storage atomicity,
authentication, and per-player serialization in the chosen platform.

## 4. Keep the presentation pipeline off the hot path

- Start request and anticipation together. Perceived completion is approximately
  `max(server round trip, anticipation) + landing`, rather than their sum.
- Cache versioned art as public static content; keep player snapshots private
  and uncached. Never put session-specific results in a shared response cache.
- Reserve image dimensions, preload only critical reveal art, and use the
  existing framework's rendering primitives. Texture decode and layout can cost
  more than a simple transform.
- Use transform/opacity effects, bounded particles, and local state updates.
  Do not rerender the entire mine for each cosmetic preview frame.
- Suspend hidden-tab decoration and terminate stale operation callbacks. A
  returning tab reconciles current state instead of replaying queued effects.
- Skip decorative cycling under reduced motion; accessibility and reduced CPU
  work agree here without changing the result.

## 5. Reproduce the benchmark

From the kit root, run `npm run bench`. The benchmark compares per-draw weight
rebuilding plus a linear scan against compiled prefixes plus binary search.
It uses synthetic 51-entry and 512-entry tables, varying luck, deterministic
draws, three warmup rounds, seven measured rounds, alternating execution order,
and consumed output checksums. It also checks agreement on sampled inputs.

The baseline is deliberately the rebuilding strategy. This does not compare
every alternative, such as a precompiled linear scan or an alias table. Both
tables are synthetic and must not be described as live game distributions.

The benchmark prints its timing samples and medians locally. Host metadata is
not collected, and personal-machine result files are not included in the kit.
CPU time excludes cryptographic RNG, cold start, HTTP, authentication, snapshot
serialization, durable I/O, and browser rendering. Running on a different V8,
CPU, or host may produce different ratios. Do not use this as a TPS/RPS claim.

## 6. Production measurement plan

Instrument command admission, receipt lookup, selection, storage commit,
serialization, and response delivery separately. On the client, record press,
response receipt, preview completion, and landing. Correlate by command ID while
avoiding session secrets in logs.

| Metric                                     | What it reveals                                |
| ------------------------------------------ | ---------------------------------------------- |
| Command p50 / p95 / p99                    | Tail latency and queueing                      |
| Storage duration and transaction conflicts | Contention or persistence bottleneck           |
| Replay, 409, 429, and recovery rates       | Duplicate traffic and synchronization behavior |
| Serialized snapshot bytes                  | Transfer and receipt-storage growth            |
| Request-to-land and press-to-feedback      | Actual player-visible responsiveness           |
| Long tasks and dropped animation frames    | Browser-side rendering cost                    |

Load-test only an authorized isolated deployment. Exercise distinct players,
same-player bursts, duplicate IDs, fresh sessions, slow storage, and dropped
responses. Report duration, arrival model, player count, percentiles, errors,
and saturation behavior. A count of successful requests without tail latency
and failure rates is insufficient evidence of capacity.
