import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import {
  createPlayer,
  openReward,
} from "../skills/reward-reveal/examples/reveal.mjs"
import {
  compileLoot,
  pickOre,
} from "../skills/reward-reveal/examples/sampler.mjs"

const player = createPlayer()
const intent = { id: randomUUID(), revision: 0, action: { type: "roll" } }
const result = openReward(player, intent, 0, () => 9)
const replay = openReward(player, intent, 100)
assert.deepEqual(replay, result)
console.log("REVEAL: fixed test draw ->", result.body.snapshot.drop)
console.log("RETRY: same reply; rolls committed ->", player.rolls)

const table = compileLoot([
  { id: "stone", weight: 6, luckBias: 0 },
  { id: "coal", weight: 3, luckBias: 1 },
  { id: "quartz", weight: 1, luckBias: 2 },
])
console.log("SAMPLER: same test draw, luck 0 ->", pickOre(table, 0, 0.85))
console.log("SAMPLER: same test draw, luck 1 ->", pickOre(table, 1, 0.85))
console.log("Example weights are illustrative, not the live game's odds.")
