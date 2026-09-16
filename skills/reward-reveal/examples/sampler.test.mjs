import assert from "node:assert/strict"
import test from "node:test"
import { compileLoot, pickOre } from "./sampler.mjs"

const entries = [
  { id: "stone", weight: 6, luckBias: 0 },
  { id: "coal", weight: 3, luckBias: 1 },
  { id: "quartz", weight: 1, luckBias: 2 },
]

test("cached prefixes preserve exact intervals as luck changes", () => {
  const table = compileLoot(entries)
  for (const luck of [0, 1, 5, 100]) {
    const weights = entries.map((row) => row.weight * (1 + luck * row.luckBias))
    const total = weights.reduce((sum, weight) => sum + weight, 0)
    let start = 0
    for (let index = 0; index < entries.length; index++) {
      assert.equal(
        pickOre(table, luck, (start + weights[index] / 2) / total),
        entries[index].id
      )
      start += weights[index]
    }
    assert.equal(pickOre(table, luck, 0), "stone")
    assert.equal(pickOre(table, luck, 1 - Number.EPSILON), "quartz")
  }
  assert.equal(pickOre(table, 0, 0.6), "coal")
  assert.equal(pickOre(table, 0, 0.9), "quartz")
  assert.equal(pickOre(table, 1, 0.4), "coal")
  assert.equal(pickOre(table, 1, 0.8), "quartz")
})

test("compiled lookup agrees with a linear oracle over a synthetic catalog", () => {
  const rows = Array.from({ length: 51 }, (_, i) => ({
    id: `ore-${i}`,
    weight: i + 1,
    luckBias: i % 4,
  }))
  const table = compileLoot(rows)
  for (const luck of [0, 1, 7]) {
    const weights = rows.map((row) => row.weight * (1 + luck * row.luckBias))
    const total = weights.reduce((sum, weight) => sum + weight, 0)
    for (let i = 0; i < 1000; i++) {
      const unit = (i + 0.5) / 1000
      let boundary = 0
      const index = weights.findIndex(
        (weight) => (boundary += weight) > unit * total
      )
      assert.equal(pickOre(table, luck, unit), rows[index].id)
    }
  }
})

test("invalid tables, invalid draws, and overflowing weights fail explicitly", () => {
  for (const rows of [
    [],
    [{ id: "x", weight: 0 }],
    [{ id: "x", weight: NaN }],
    [{ id: "x", weight: 1, luckBias: -1 }],
    [
      { id: "x", weight: 1 },
      { id: "x", weight: 2 },
    ],
    [{ id: "x", weight: Number.MAX_VALUE, luckBias: 2 }],
  ]) {
    assert.throws(() => compileLoot(rows))
  }
  const table = compileLoot(entries)
  for (const unit of [-1, 1, NaN, Infinity]) {
    assert.throws(() => pickOre(table, 0, unit), RangeError)
  }
  for (const luck of [-1, NaN, Infinity, Number.MAX_VALUE]) {
    assert.throws(() => pickOre(table, luck, 0.5), RangeError)
  }
  assert.equal(
    pickOre(compileLoot([{ id: "only", weight: 1 }]), 0, 0.9),
    "only"
  )
})
