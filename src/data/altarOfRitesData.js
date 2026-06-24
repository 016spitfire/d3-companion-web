// Altar of Rites data — permanent since Season 30.
// Structure: { id, label, name, description, effect, requires, type, unlocked, x, y, labelOffset }
// requires: ids of acceptable prerequisite nodes — unlocking needs ANY ONE of them
// already unlocked (OR logic, not all-of). Empty array = no prerequisite.
// type: 'seal' (26 main nodes) | 'potion' (3 nodes, paid in Primordial Ashes,
// independent of the main Blood Shard/material sequence) | 'final' (auto-unlocks
// for free once every seal and potion is unlocked).
// x/y: node position in the actual in-game tree layout, used to render the visual
// graph faithfully rather than as a flat list.
// labelOffset: which side of the node the short description label should sit on
// ('above' or 'below'), so labels don't collide in tightly-packed rows.
//
// IMPORTANT: Seal and Potion nodes have no per-node cost field. The cost for
// unlocking either is keyed by *how many of that type you've unlocked so far*,
// not by which specific node you pick — identical regardless of which eligible
// node you choose, following a preset sequence (altarSealCostSequence /
// altarPotionCostSequence below) no matter what order you unlock things in.
// The final bonus is free and auto-unlocks on full completion, so it keeps its
// own fixed `cost` field as a description rather than a real cost.
//
// Sourced from the node graph (NodeRequirements/NodeCenters/NodeLabels/NodeDescriptions/
// Offerings) used by the community Altar of Rites planner at
// https://caleko.github.io/d3/altar.html — verified directly against its source rather
// than text-extracted guide prose, since published guides disagree with each other on
// seal order/numbering.
const altarOfRitesData = [
  { id: 0,  label: 'A',  name: 'Gateway',     description: 'Double Kill Streak',        effect: "Your Kill Streak timer duration and reward bonus are doubled.",                                                                                          requires: [],            type: 'seal', unlocked: false, x: 1043, y: 335, labelOffset: 'above' },
  { id: 1,  label: 'B',  name: 'Mirror',      description: 'Perm XP Pools',              effect: "Pools of Reflection last for the entire Season and are not removed by death.",                                                                            requires: [0],           type: 'seal', unlocked: false, x: 926,  y: 451, labelOffset: 'above' },
  { id: 2,  label: 'C',  name: 'Anointed',    description: 'No Item Lvl Req',            effect: "Items have no level requirement.",                                                                                                                       requires: [0],           type: 'seal', unlocked: false, x: 1159, y: 451, labelOffset: 'above' },
  { id: 3,  label: 'D',  name: 'Force',       description: '+100 Dmg',                   effect: "+100 Damage",                                                                                                                                            requires: [1],           type: 'seal', unlocked: false, x: 868,  y: 510, labelOffset: 'above' },
  { id: 4,  label: 'E',  name: 'Shadow',      description: '-5% Missile Dmg',            effect: "+5% Missile Damage Reduction",                                                                                                                           requires: [1],           type: 'seal', unlocked: false, x: 984,  y: 510, labelOffset: 'above' },
  { id: 5,  label: 'F',  name: 'Exodus',      description: '+10% Movespeed',             effect: "+10% Movement Speed (Uncapped)",                                                                                                                         requires: [2],           type: 'seal', unlocked: false, x: 1101, y: 510, labelOffset: 'above' },
  { id: 6,  label: 'G',  name: 'Command',     description: '+5% Elite Dmg',              effect: "Increase damage against elites by 5%.",                                                                                                                  requires: [2],           type: 'seal', unlocked: false, x: 1217, y: 510, labelOffset: 'above' },
  { id: 7,  label: 'H',  name: 'Blood',       description: '5% Shield from HP Globe',    effect: "Picking up Health Globes grants a shield for 5% of your maximum health for 7 seconds. Max stacks 5.",                                                    requires: [3, 4, 5, 6],  type: 'seal', unlocked: false, x: 1044, y: 566, labelOffset: 'above' },
  { id: 8,  label: 'I',  name: 'Numb',        description: '-5% Melee Dmg',              effect: "+5% Melee Damage Reduction.",                                                                                                                            requires: [7],           type: 'seal', unlocked: false, x: 868,  y: 625, labelOffset: 'above' },
  { id: 9,  label: 'J',  name: 'Nature',      description: '+5% Ele Dmg',                effect: "Increases your highest elemental skill damage bonus by 5%.",                                                                                             requires: [7],           type: 'seal', unlocked: false, x: 1044, y: 625, labelOffset: 'above' },
  { id: 10, label: 'K',  name: 'Prowess',     description: '+5% Elite Dmg',              effect: "Increase damage against elites by 5%.",                                                                                                                  requires: [7],           type: 'seal', unlocked: false, x: 1217, y: 625, labelOffset: 'above' },
  { id: 11, label: 'L',  name: 'Tenacity',    description: '+5% Dmg',                     effect: "+5% Damage",                                                                                                                                             requires: [8],           type: 'seal', unlocked: false, x: 810,  y: 683, labelOffset: 'above' },
  { id: 12, label: 'M',  name: 'Stillness',   description: "DBs x2",                     effect: "Double the amount of Death's Breaths that drop.",                                                                                                        requires: [8],           type: 'seal', unlocked: false, x: 926,  y: 683, labelOffset: 'above' },
  { id: 13, label: 'N',  name: 'Vigor',       description: 'Resource on Crit',           effect: "Critical hits grant resource:\n - Mana: 15\n - Hatred: 5\n - Wrath: 5\n - Arcane Power: 3\n - Fury: 3\n - Spirit: 5\n - Essence: 5",                       requires: [9],           type: 'seal', unlocked: false, x: 984,  y: 683, labelOffset: 'below' },
  { id: 14, label: 'O',  name: 'Bountiful',   description: 'Bounties x2',                effect: "Double the amount of Bounty Caches that drop from completing bounties.",                                                                                requires: [9],           type: 'seal', unlocked: false, x: 1101, y: 683, labelOffset: 'below' },
  { id: 15, label: 'P',  name: 'Reach',       description: 'Auto Orbs',                  effect: "Progress orbs from Nephalem and Greater Rifts are automatically picked up within 60 yards.",                                                            requires: [10],          type: 'seal', unlocked: false, x: 1159, y: 683, labelOffset: 'above' },
  { id: 16, label: 'Q',  name: 'Reverence',   description: '-5% Elite Dmg',              effect: "Reduces the damage taken from elites by 5%.",                                                                                                            requires: [10],          type: 'seal', unlocked: false, x: 1275, y: 683, labelOffset: 'above' },
  { id: 17, label: 'R',  name: 'Malice',      description: '+5% Dmg',                     effect: "+5% Damage",                                                                                                                                             requires: [11, 12, 18],  type: 'seal', unlocked: false, x: 868,  y: 742, labelOffset: 'above' },
  { id: 18, label: 'S',  name: 'Omen',        description: 'CC Immunity',                effect: "Gain immunity to crowd-controlling effects.",                                                                                                            requires: [13, 14, 17, 19], type: 'seal', unlocked: false, x: 1043, y: 742, labelOffset: 'above' },
  { id: 19, label: 'T',  name: 'Revelation',  description: 'Passability',                effect: "Gain passability.",                                                                                                                                       requires: [15, 16, 18],  type: 'seal', unlocked: false, x: 1217, y: 742, labelOffset: 'above' },
  { id: 20, label: 'U',  name: 'Carrion',     description: 'Auto-DBs',                   effect: "Pets pick up Death's Breath.",                                                                                                                           requires: [17],          type: 'seal', unlocked: false, x: 810,  y: 800, labelOffset: 'above' },
  { id: 21, label: 'V',  name: 'Reaper',      description: '+1 Progress Orb',            effect: "Elite packs drop one additional progress orb.",                                                                                                          requires: [17],          type: 'seal', unlocked: false, x: 926,  y: 800, labelOffset: 'above' },
  { id: 22, label: 'W',  name: 'Roar',        description: '+5% Boss Dmg',               effect: "Increase damage done to Bosses by 5%.",                                                                                                                  requires: [18],          type: 'seal', unlocked: false, x: 984,  y: 800, labelOffset: 'below' },
  { id: 23, label: 'X',  name: 'Husk',        description: 'Auto-Pick/Salvage',          effect: "Pets pick up and salvage common, magic, and rare items.",                                                                                                requires: [18],          type: 'seal', unlocked: false, x: 1101, y: 800, labelOffset: 'below' },
  { id: 24, label: 'Y',  name: 'Elegance',    description: '+5% Dodge',                  effect: "Increase your chance to Dodge by 5%.",                                                                                                                   requires: [19],          type: 'seal', unlocked: false, x: 1159, y: 800, labelOffset: 'above' },
  { id: 25, label: 'Z',  name: 'Pattern',     description: 'Kadala Leggies x2',          effect: "Double the chance to find a legendary item purchased from Kadala.",                                                                                      requires: [19],          type: 'seal', unlocked: false, x: 1275, y: 800, labelOffset: 'above' },

  // Legendary Potion Powers — paid in Primordial Ashes, independent of the main sequence above.
  // Like Seals, cost is keyed by which Potion-unlock-number this is (1st/2nd/3rd),
  // not by which specific Potion you pick — see altarPotionCostSequence below.
  { id: 26, label: 'AA', name: 'Mother',      description: 'Triune Circles',             effect: "When you drink your health potion, you manifest one of three runic circles on the ground that grant increased damage, increased cooldown reduction, or increased resource cost reduction.", requires: [20, 21], type: 'potion', unlocked: false, x: 868,  y: 863, labelOffset: 'above' },
  { id: 27, label: 'AB', name: 'Mortal',      description: '-25% Dmg within 25yds',      effect: "When you drink your health potion, all enemies within 25 yards deal 25% less damage.",                                                                  requires: [22, 23], type: 'potion', unlocked: false, x: 1044, y: 863, labelOffset: 'below' },
  { id: 28, label: 'AC', name: 'Father',      description: 'Random Shrine',              effect: "When you drink your health potion, gain a random shrine effect.\n - Excludes Empowered (Resource Rate / Cool Down Reduction)",                          requires: [24, 25], type: 'potion', unlocked: false, x: 1222, y: 863, labelOffset: 'above' },

  // Final bonus — free, auto-unlocks once every seal and potion above is unlocked.
  { id: 29, label: 'AD', name: 'Warning',     description: 'Double Primals',             effect: "When a primal item drops, a second random primal item drops as well.",                                                                                  cost: ['Unlocked automatically on full completion'], requires: [], type: 'final', unlocked: false, x: 1045, y: 920, labelOffset: 'below' },
];

// The 26-step Seal unlock cost ladder. Index 0 is the cost of your 1st Seal unlock,
// index 1 the cost of your 2nd, and so on — completely independent of which Seal
// you actually choose at each step. Same cost regardless of node identity.
export const altarSealCostSequence = [
  ['10 Reusable Parts'],
  ['1 Flawless Diamond (or greater)', '15 Arcane Dust', '20 Reusable Parts'],
  ['1 Greater Rift Key', "10 Death's Breaths"],
  ['Any Class-Specific Set Helm'],
  ['20 Forgotten Souls', '10 of each Bounty Material'],
  ["1 Leoric's Regret", '1 Vial of Putridness', '1 Idol of Terror', '1 Heart of Fright'],
  ["Reaper's Wraps"],
  ['30 Forgotten Souls'],
  ['1,100 Blood Shards'],
  ['1 Flawless Royal Ruby', "20 Death's Breaths", 'Ring of Royal Grandeur'],
  ['1 Flawless Royal Emerald', '30 of each Bounty Material'],
  ['20 Greater Rift Keys', "1 Ramaladni's Gift"],
  ['1,300 Blood Shards'],
  ['1 Petrified Scream'],
  ['1 Challenge Rift Cache'],
  ['250 Forgotten Souls'],
  ['1,400 Blood Shards'],
  ['Ancient Hellfire Amulet'],
  ['4 Tome of Set Dungeon Pages (for your class)'],
  ['Ancient Puzzle Ring', '50 of each Bounty Material'],
  ["500 Death's Breaths", '300 Forgotten Souls'],
  ['1,500 Blood Shards'],
  ['Whisper of Atonement (Rank 125)'],
  ['Any Augmented Weapon'],
  ['Staff of Herding'],
  ['1,600 Blood Shards'],
];

// The 3-step Potion Power cost ladder, in its own separate Primordial Ashes pool —
// same mechanic as altarSealCostSequence: cost is keyed by which Potion-unlock-
// number this is, not by which specific Potion you choose.
export const altarPotionCostSequence = [
  '55 Primordial Ashes',
  '110 Primordial Ashes',
  '165 Primordial Ashes',
];

export default altarOfRitesData;
