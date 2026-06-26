// Season conquests — 5 of these are active each season.
// Update active flags each season: set 5 to active: true, remaining to active: false.
const conquestData = [
  {
    key: 1,
    title: "Speed Demon",
    hardcore: "Need for Speed",
    short: "Complete a Nephalem Rift at T10+ in under 2 minutes.",
    conquest:
      "Complete a Nephalem Rift at Torment X or higher in under 2 minutes.",
    active: false,
    completed: false,
    completedHardcore: false,
  },
  {
    key: 2,
    title: "Avarice",
    hardcore: "Avaritia",
    short: "Loot a 50,000,000 gold streak outside The Vault and Inner Sanctum.",
    conquest:
      "Complete a 50,000,000 gold streak while outside of The Vault and The Inner Sanctum.",
    active: true,
    completed: false,
    completedHardcore: false,
  },
  {
    key: 3,
    title: "Curses!",
    hardcore: "Stars Align",
    short: "Kill 350 monsters in a Cursed Chest event on T10+.",
    conquest:
      "Kill 350 or more monsters during a single Cursed Chest event on Torment X difficulty or higher.",
    active: false,
    completed: false,
    completedHardcore: false,
  },
  {
    key: 4,
    title: "Years of War",
    hardcore: "Dynasty",
    short: "Reach GR55 solo with 6 pieces of 6 different sets.",
    conquest: "Complete a Greater Rift 55 solo with 6 different class sets.",
    active: false,
    completed: false,
    completedHardcore: false,
  },
  {
    key: 5,
    title: "Boss Mode",
    hardcore: "Worlds Apart",
    short: "Defeat 16 specific Act bosses on T10+ within 20 minutes.",
    conquest:
      "Defeat 16 specific Act bosses on Torment X difficulty or higher within 20 minutes of starting the game.",
    active: true,
    completed: false,
    completedHardcore: false,
  },
  {
    key: 6,
    title: "The Thrill",
    hardcore: "Super Human",
    short: "Reach GR45 solo without any green set items.",
    conquest:
      "Reach Greater Rift level 45 solo without equipping any green set items.",
    active: true,
    completed: false,
    completedHardcore: false,
  },
  {
    key: 7,
    title: "Sprinter",
    hardcore: "Speed Racer",
    short: "Complete Campaign Mode (Acts I–V) in under one hour.",
    conquest:
      "Complete the entire Campaign Mode (Acts I through V) from start to finish in under one hour.",
    active: true,
    completed: false,
    completedHardcore: false,
  },
  {
    key: 8,
    title: "Masters of the Universe",
    hardcore: "Masters of Sets",
    short: "Master 8 different Set Dungeons.",
    conquest: "Completely master 8 different Set Dungeons.",
    active: true,
    completed: false,
    completedHardcore: false,
  },
  {
    key: 9,
    title: "On a Good Day",
    hardcore: "I Can't Stop",
    short: "Level three Legendary Gems to level 65.",
    conquest: "Level three Legendary Gems to level 65.",
    active: false,
    completed: false,
    completedHardcore: false,
  },
  {
    key: 10,
    title: "Divinity",
    hardcore: "Lionhearted",
    short: "Finish a Greater Rift at Tier 75 solo.",
    conquest: "Finish a Greater Rift at Tier 75 solo.",
    active: false,
    completed: false,
    completedHardcore: false,
  },
];

export default conquestData;
