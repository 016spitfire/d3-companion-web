# TODO

## Altar of Rites — next session

- **Recolor Potion Powers + final/Primal node.** Currently gold (Potions) and magenta (final bonus). Move both toward a Reaper of Souls–style steel blue instead — away from gold/pink.
- **Collapse already-claimed entries in the Seal cost ladder.** Right now all 26 rungs always render; once you're well into the season the claimed ones (struck-through) just push the unclaimed ones further down, forcing a scroll to find the next target. Explore hiding/collapsing spent rungs so the list stays short.
- **Fix Potion Power costs.** They're currently fixed per-node (Mother=55, Mortal=110, Father=165 Primordial Ashes), but should work like the Seal ladder: cost is keyed by *which Potion-unlock-number this is* (1st/2nd/3rd), not by which specific Potion you pick — same mechanic as `altarSealCostSequence`, just its own separate 3-step Ashes pool. Visual treatment should differ from the Seal ladder though: 3 icons, grayed out initially, filling in / changing color as each is claimed, rather than a list.

## Altar of Rites — planner feature (after the above)

A real planner for this screen: let the player map out a target path of nodes ahead of time (which Seals/Potions they want, in what order), validated against the actual prerequisite graph so the path is achievable in-game, surfacing what to claim next. This is meant to feed into a broader app-wide planner concept eventually, not just this screen.
