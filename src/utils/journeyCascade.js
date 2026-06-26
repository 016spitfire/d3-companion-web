// Season Journey chains (rift difficulty, GR tier, gem rank, etc.) are AND
// relationships, not the Altar's OR/alternate-path eligibility — a task's
// requires are *all* implied true the moment the harder task is checked, and
// none of them are optional alternates. The chains are also plain trees (no
// cycles, unlike Altar's Malice/Omen), so straightforward BFS in either
// direction is enough; no need for Altar's grow-from-roots trick.

// Forward: checking a task complete also implies every task in its requires
// chain is complete, transitively (e.g. checking GR50 Solo also checks GR40,
// GR30, GR20). Returns the full set of keys to mark complete, including the
// task itself.
export const getAncestorsToComplete = (startKey, byKey) => {
  const toComplete = new Set([startKey]);
  const queue = [startKey];
  while (queue.length) {
    const cur = queue.shift();
    for (const reqKey of byKey[cur]?.requires || []) {
      if (!toComplete.has(reqKey)) {
        toComplete.add(reqKey);
        queue.push(reqKey);
      }
    }
  }
  return toComplete;
};

// Reverse: unchecking an earlier task invalidates anything already completed
// that depends on it, directly or further up the chain (e.g. unchecking GR20
// Solo must also unclick GR30/40/50/60/70 if any of those are checked).
// Stops descending through a task that isn't actually completed, since
// nothing above it can validly be completed either if the forward-complete
// invariant has been holding.
export const computeJourneyCascadeUncompletes = (startKey, tasks) => {
  const byKey = Object.fromEntries(tasks.map((t) => [t.key, t]));
  const dependents = {};
  for (const t of tasks) {
    for (const reqKey of t.requires) {
      (dependents[reqKey] ??= []).push(t.key);
    }
  }
  const seen = new Set([startKey]);
  const affected = [];
  const queue = [startKey];
  while (queue.length) {
    const cur = queue.shift();
    for (const depKey of dependents[cur] || []) {
      if (seen.has(depKey)) continue;
      seen.add(depKey);
      if (byKey[depKey]?.completed) {
        affected.push(depKey);
        queue.push(depKey);
      }
    }
  }
  return affected;
};
