// Shared between AlterOfRites.jsx (the planner UI) and Welcome.jsx (the Home
// screen's undo-last-unlock button) — kept out of either component file so
// neither one's Fast Refresh boundary breaks from exporting a plain function
// alongside a component.

// If `startId` gets locked, find every other currently-unlocked node that's only
// standing because of it (directly or transitively) and would become invalid too.
//
// This is a reachability problem, not a "shrink the support graph" problem — it
// has to be computed by growing a confirmed-still-valid set outward from real
// roots, not by removing nodes once their support looks gone. The shrink-based
// version is vulnerable to mutual references: two nodes that each list the other
// as an alternate prerequisite (this graph actually has one — Malice and Omen
// each appear in the other's requires list) can "rescue" each other forever,
// since neither is ever marked invalid before the other checks it. Growing from
// confirmed roots sidesteps this entirely: a cycle with no connection back to a
// real root just never gets reached, regardless of how the nodes reference each
// other. The final bonus is handled separately since it requires EVERY other
// node rather than any one of a list.
export const computeCascadeLocks = (startId, progress) => {
  const byId = Object.fromEntries(progress.map((n) => [n.id, n]));
  const stillValid = new Set();
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of progress) {
      if (node.id === startId || !node.unlocked || stillValid.has(node.id) || node.type === 'final') continue;
      const supported = node.requires.length === 0
        || node.requires.some((rid) => rid !== startId && byId[rid]?.unlocked && stillValid.has(rid));
      if (supported) {
        stillValid.add(node.id);
        changed = true;
      }
    }
    const finalNode = progress.find((n) => n.type === 'final');
    if (finalNode && finalNode.id !== startId && finalNode.unlocked && !stillValid.has(finalNode.id)) {
      const allOthersValid = progress
        .filter((n) => n.type !== 'final' && n.id !== startId)
        .every((n) => stillValid.has(n.id));
      if (allOthersValid) {
        stillValid.add(finalNode.id);
        changed = true;
      }
    }
  }
  return progress.filter((n) => n.unlocked && n.id !== startId && !stillValid.has(n.id)).map((n) => n.id);
};
