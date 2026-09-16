import assert from "node:assert/strict"
import { performance } from "node:perf_hooks"
import {
  compileLoot,
  pickOre,
} from "../skills/reward-reveal/examples/sampler.mjs"

const draws = 100_000
const rounds = 7
const samples = Float64Array.from(
  { length: draws },
  (_, i) => ((Math.imul(i + 1, 2654435761) >>> 0) + 0.5) / 4294967296
)
const median = (values) =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]
const results = []
let consumed = 0

for (const size of [51, 512]) {
  const entries = Array.from({ length: size }, (_, i) => ({
    id: `ore-${i}`,
    weight: i + 1,
    luckBias: (i % 4) / 4,
  }))
  const table = compileLoot(entries)
  function rebuilt(luck, unit) {
    const weights = entries.map((row) => row.weight * (1 + luck * row.luckBias))
    const ticket = unit * weights.reduce((sum, weight) => sum + weight, 0)
    let boundary = 0
    for (let i = 0; i < weights.length; i++) {
      boundary += weights[i]
      if (ticket < boundary) return entries[i].id
    }
    return entries[entries.length - 1].id
  }
  const cached = (luck, unit) => pickOre(table, luck, unit)
  for (let i = 0; i < 1000; i++) {
    assert.equal(cached(i % 8, samples[i]), rebuilt(i % 8, samples[i]))
  }
  function measure(fn) {
    let checksum = 0
    const started = performance.now()
    for (let i = 0; i < draws; i++) checksum += fn(i % 8, samples[i]).length
    const elapsed = performance.now() - started
    consumed += checksum
    return elapsed
  }
  for (let i = 0; i < 3; i++) {
    measure(rebuilt)
    measure(cached)
  }
  const baseline = []
  const optimized = []
  for (let i = 0; i < rounds; i++) {
    if (i % 2 === 0) {
      baseline.push(measure(rebuilt))
      optimized.push(measure(cached))
    } else {
      optimized.push(measure(cached))
      baseline.push(measure(rebuilt))
    }
  }
  const baselineMs = median(baseline)
  const cachedMs = median(optimized)
  results.push({
    entries: size,
    draws,
    rounds,
    rebuildMedianMs: Number(baselineMs.toFixed(3)),
    cachedMedianMs: Number(cachedMs.toFixed(3)),
    speedup: Number((baselineMs / cachedMs).toFixed(2)),
    rebuildSamplesMs: baseline.map((ms) => Number(ms.toFixed(3))),
    cachedSamplesMs: optimized.map((ms) => Number(ms.toFixed(3))),
  })
}

console.log(
  JSON.stringify(
    {
      scope:
        "CPU lookup only; excludes RNG, HTTP, auth, persistence, cold start, and UI",
      methodology:
        "Synthetic catalogs; 3 warmups; 7 alternating-order samples; median; deterministic inputs",
      results,
      checksum: consumed,
    },
    null,
    2
  )
)
