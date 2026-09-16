import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import test from "node:test"
import { createPlayer, openReward } from "./reveal.mjs"

const command = (revision) => ({
  id: randomUUID(),
  revision,
  action: { type: "roll" },
})

test("lost-response replay returns one reward before checking cooldown or revision", () => {
  const player = createPlayer()
  const intent = command(0)
  const first = openReward(player, intent, 1000, () => 9)
  const retry = openReward(player, structuredClone(intent), 1010, () => {
    assert.fail("A retry must not draw again")
  })
  assert.deepEqual(retry, first)
  assert.equal(retry.body.snapshot.drop, "quartz")
  assert.equal(player.rolls, 1)
  retry.body.snapshot.drop = "forged"
  assert.equal(openReward(player, intent, 1020).body.snapshot.drop, "quartz")
})

test("changed ID intent, competing revisions, and cooldown cannot mutate state", () => {
  const player = createPlayer()
  const first = command(0)
  assert.equal(openReward(player, first, 0, () => 0).status, 200)
  const saved = structuredClone(player)
  assert.equal(openReward(player, { ...first, revision: 1 }, 1500).status, 409)
  assert.equal(openReward(player, command(0), 1500).status, 409)
  const blocked = openReward(player, command(1), 1499)
  assert.equal(blocked.status, 429)
  assert.equal(blocked.body.retryAfterMs, 1)
  assert.deepEqual(player, saved)
  assert.equal(openReward(player, command(1), 1500, () => 6).status, 200)
  assert.equal(player.drop, "coal")
})

test("strict boundary rejects forged results and malformed commands", () => {
  const valid = command(0)
  const player = createPlayer()
  for (const invalid of [
    null,
    [],
    {},
    { ...valid, id: 7 },
    { ...valid, id: "not-a-uuid" },
    { ...valid, revision: -1 },
    { ...valid, revision: 0.5 },
    { ...valid, revision: Number.MAX_SAFE_INTEGER + 1 },
    { ...valid, balance: 9999 },
    { ...valid, action: { type: "roll", drop: "quartz" } },
    { ...valid, action: { type: "roll", luck: 99 } },
    { ...valid, action: { type: "payout", amount: 9999 } },
  ]) {
    assert.equal(openReward(player, invalid, 0).status, 400)
  }
  assert.deepEqual(player, createPlayer())
})

test("all weighted intervals have exact boundaries and invalid draws do not commit", () => {
  for (let ticket = 0; ticket < 10; ticket++) {
    const reply = openReward(createPlayer(), command(0), 0, (total) => {
      assert.equal(total, 10)
      return ticket
    })
    assert.equal(
      reply.body.snapshot.drop,
      ticket < 6 ? "stone" : ticket < 9 ? "coal" : "quartz"
    )
  }
  for (const ticket of [-1, 10, NaN, 0.5]) {
    const player = createPlayer()
    assert.throws(() => openReward(player, command(0), 0, () => ticket))
    assert.deepEqual(player, createPlayer())
  }
})

test("evicting an old receipt still cannot replay a successful command", () => {
  const player = createPlayer()
  const first = command(0)
  openReward(player, first, 0, () => 0)
  for (let revision = 1; revision <= 16; revision++) {
    openReward(player, command(revision), revision * 1500, () => 0)
  }
  assert.equal(player.receipts.size, 16)
  assert.equal(player.receipts.has(first.id), false)
  assert.equal(openReward(player, first, 30_000).status, 409)
  assert.equal(player.rolls, 17)
})
