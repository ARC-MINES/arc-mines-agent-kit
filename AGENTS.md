# Working in this repository

- This is a standalone companion to Arc Mines. Work inside this checkout.
- Keep skills self-contained: put their references and runnable examples inside
  the relevant skill directory. Use relative Markdown links.
- Distinguish observed game behavior, proposed UX, and example simplifications.
  Do not claim a recommendation is already implemented in the game.
- Server state owns rewards, balances, revisions, and time gates. Browser
  animation owns presentation. Preserve that boundary in examples and prose.
- Use Node built-ins for runnable examples. Keep doubles and fixtures local to
  tests. Run `npm test` and `npm run demo` after changing examples.
- Match `.prettierrc.json`. Use Conventional Commits.
- Use the repository-local ARC-MINES Git identity. Do not publish personal
  attribution, host hardware, OS/architecture, exact runtime versions, local
  paths, or deployment addresses associated with personal accounts. Benchmark
  output must omit identifying host metadata; never invent replacement values.
  Keep local benchmark result files out of commits. Before pushing, verify every
  reachable commit uses the ARC-MINES name and its GitHub noreply email. Preserve
  private repository visibility unless the user explicitly requests publication.
- Keep the supplied banner as the sole branding asset unless more are requested.
  Do not add credentials, private infrastructure configuration, token
  marketing claims, or fabricated usage/security/performance claims.
