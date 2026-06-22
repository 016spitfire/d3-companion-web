// Each season: set the current gift to active: true, previous to active: false.
// One active per class at a time.
const haedrigsGiftData = [
  {
    class: 'Barbarian',
    sets: [
      { name: "Immortal King's Call",          active: false },
      { name: 'Wrath of the Wastes',           active: false },
      { name: 'Might of the Earth',            active: false },
      { name: 'The Legacy of Raekor',          active: true  },
      { name: 'Horde of the Ninety Savages',   active: false },
    ],
  },
  {
    class: 'Crusader',
    sets: [
      { name: "Roland's Legacy",        active: false },
      { name: 'Thorns of the Invoker',  active: false },
      { name: 'Seeker of the Light',    active: false },
      { name: 'Armor of Akkhan',        active: true  },
      { name: 'Aegis of Valor',         active: false },
    ],
  },
  {
    class: 'Demon Hunter',
    sets: [
      { name: "Natalya's Vengeance",          active: false },
      { name: 'Unhallowed Essence',           active: false },
      { name: 'Embodiment of the Marauder',   active: true  },
      { name: 'Gears of Dreadlands',          active: false },
      { name: "Shadow's Mantle",              active: false },
    ],
  },
  {
    class: 'Monk',
    sets: [
      { name: "Inna's Reach",                     active: true  },
      { name: "Monkey King's Garb",               active: false },
      { name: 'Raiment of a Thousand Storms',     active: false },
      { name: 'Patterns of Justice',              active: false },
      { name: "Uliana's Stratagem",               active: false },
    ],
  },
  {
    class: 'Necromancer',
    sets: [
      { name: 'Grace of Inarius',                    active: false },
      { name: "Pestilence Master's Shroud",          active: true  },
      { name: 'Bones of Rathma',                     active: false },
      { name: "Trag'Oul's Avatar",                   active: false },
      { name: 'Masquerade of the Burning Carnival',  active: false },
    ],
  },
  {
    class: 'Witch Doctor',
    sets: [
      { name: "Jade Harvester",         active: false },
      { name: 'Helltooth Harness',      active: false },
      { name: "Zunimassa's Haunt",      active: true  },
      { name: "Mundunugu's Regalia",    active: false },
      { name: 'Spirit of Arachyr',      active: false },
    ],
  },
  {
    class: 'Wizard',
    sets: [
      { name: "Firebird's Finery",       active: false },
      { name: "Tal Rasha's Elements",    active: false },
      { name: "Vyr's Amazing Arcana",    active: false },
      { name: "Delsere's Magnum Opus",   active: true  },
      { name: "Typhon's Veil",           active: false },
    ],
  },
];

export default haedrigsGiftData;
