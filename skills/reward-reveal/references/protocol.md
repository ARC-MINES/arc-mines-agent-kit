# Command and recovery contract

## Intent

```json
{
  "id": "48eeec98-f035-47fd-96d0-798a442d783d",
  "revision": 12,
  "action": { "type": "roll" }
}
```

Authenticate the player independently of this body. Accept exactly the allowed
keys, a UUID v4, and a non-negative safe integer revision. Reject client reward,
price, payout, seed, luck, and balance fields. Bound request bytes before parsing.
For cookie auth, enforce same-origin mutations and the host's session protection.

## Serialized server operation

1. Look up a receipt scoped to the authenticated player and command ID.
2. If its original intent matches, return the saved reply. If it differs, 409.
3. Check revision; on mismatch return 409 and a current snapshot.
4. Check cooldown and gameplay eligibility using server time and state.
5. Select with server randomness, apply result, and increment revision.
6. Save state and receipt in the same transaction, then return the snapshot.

This order allows a successful retry to return its original result even though
its revision is now old or the roll is cooling down. A bounded receipt cache
can forget exact replies; a monotonically increasing revision must still stop
old successful commands from executing again. Reset must not reset revision.

The included model remembers successful replies only. A deployed implementation
may remember rejected replies too, but must document whether a rejected command
ID can ever become executable. Prefer a fresh ID after a definite rejection.

Server cryptographic randomness does not prove fairness to the player. The
example uses illustrative integer weights; the live game has a different table.

## Reply

Include the committed reward, revision, server timestamp, and next allowed roll
time. Include a current snapshot for recoverable conflicts where possible.
Use `Cache-Control: private, no-store` for player state and errors.

The example uses `body.snapshot` with `drop`, `rolls`, `revision`, `serverTime`,
and `nextRollAt`. A real game adds inventory and economy state as needed.

## Browser recovery

- Serialize once. Retry a network failure or ambiguous 5xx at most once with
  identical bytes; do not generate a fresh ID inside the retry loop.
- If that also fails, disable new mutations and fetch a snapshot. Do not label
  the result as lost or issue compensation without evidence.
- On 409, reconcile from the current snapshot. On 429, respect the server gate.
  On 401, require a valid session before sending another intent.
- Accept snapshots in revision order, then timestamp order for equal revisions.
  An old successful receipt can confirm an operation without replacing a newer
  current snapshot or rewinding its clock.
- Anchor time to the received server timestamp plus monotonic elapsed time.
  Reanchor on sync and tab return; never trust the browser clock for eligibility.
- Closing the reveal does not cancel a committed result. Surface the current
  drop when the user returns. Preserve the operation until it resolves or enters
  explicit recovery, even if the layer is hidden.

## Reference limits

`examples/reveal.mjs` models one serialized player in memory. Its synchronous
function demonstrates ordering, not durable atomicity, authentication, or HTTP.
Keep it behind a server boundary when adapting it; implement transactional
storage and transport validation in the host application.
