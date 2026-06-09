// Season Journey data — update each season with current tasks.
// Structure: { key, chapter, title, goal, long, completed }
// title: short task name; goal: short description; long: extended description (optional)
const seasonJourneyData = [
  // Chapter I
  { key: 1,  chapter: 'Chapter I',  title: 'On the Hunt',       goal: 'Reach Level 70.',                              long: 'Reach Level 70 with your Seasonal hero.',                                                                                              completed: false },
  { key: 2,  chapter: 'Chapter I',  title: 'Cull the Weak',     goal: 'Kill 500 monsters.',                           long: 'Kill 500 monsters with your Seasonal hero.',                                                                                           completed: false },
  { key: 3,  chapter: 'Chapter I',  title: 'Blood is Power',    goal: 'Kill the Skeleton King.',                       long: 'Kill the Skeleton King in the Leoric\'s Manor on any difficulty.',                                                                      completed: false },
  { key: 4,  chapter: 'Chapter I',  title: 'Into the Breach',   goal: 'Complete a Nephalem Rift.',                     long: 'Complete a Nephalem Rift at max level.',                                                                                                completed: false },
  { key: 5,  chapter: 'Chapter I',  title: 'The Cube',          goal: 'Unlock Kanai\'s Cube.',                         long: 'Find and unlock Kanai\'s Cube in the Ruins of Sescheron in Act III.',                                                                   completed: false },
  { key: 6,  chapter: 'Chapter I',  title: 'Lore Keeper',       goal: 'Complete Act I story.',                         long: 'Complete Act I of the Story Mode on any difficulty.',                                                                                   completed: false },

  // Chapter II
  { key: 7,  chapter: 'Chapter II', title: 'Rising Power',      goal: 'Reach Paragon 50.',                             long: 'Reach Paragon level 50 with your Seasonal hero.',                                                                                       completed: false },
  { key: 8,  chapter: 'Chapter II', title: 'Trial by Blood',    goal: 'Complete a Greater Rift Tier 20.',              long: 'Complete a Greater Rift Tier 20 or higher solo.',                                                                                       completed: false },
  { key: 9,  chapter: 'Chapter II', title: 'Blood Shards',      goal: 'Spend 1,500 Blood Shards at Kadala.',           long: 'Spend a total of 1,500 Blood Shards gambling with Kadala.',                                                                             completed: false },
  { key: 10, chapter: 'Chapter II', title: 'Gem of the Sky',    goal: 'Level a Legendary Gem to 25.',                  long: 'Upgrade a Legendary Gem to level 25 using a Greater Rift Keystone.',                                                                    completed: false },
  { key: 11, chapter: 'Chapter II', title: 'Death\'s Breath',   goal: 'Craft an item in Kanai\'s Cube.',               long: 'Use any Kanai\'s Cube recipe to craft or convert an item.',                                                                             completed: false },
  { key: 12, chapter: 'Chapter II', title: 'Act II Clear',      goal: 'Kill Belial on Master or higher.',              long: 'Kill Belial, Lord of Lies, in the Imperial Palace on Master difficulty or higher.',                                                    completed: false },

  // Chapter III
  { key: 13, chapter: 'Chapter III', title: 'Century Mark',      goal: 'Reach Paragon 100.',                           long: 'Reach Paragon level 100 with your Seasonal hero.',                                                                                     completed: false },
  { key: 14, chapter: 'Chapter III', title: 'Deeper Darkness',   goal: 'Complete a Greater Rift Tier 45.',             long: 'Complete a Greater Rift Tier 45 or higher solo.',                                                                                      completed: false },
  { key: 15, chapter: 'Chapter III', title: 'Gem Mastery',       goal: 'Level a Legendary Gem to 50.',                 long: 'Upgrade a Legendary Gem to level 50 using a Greater Rift Keystone.',                                                                   completed: false },
  { key: 16, chapter: 'Chapter III', title: 'Set Collector',     goal: 'Equip a full 2-piece Class Set bonus.',        long: 'Equip two pieces of the same Class Set to activate the 2-piece set bonus.',                                                             completed: false },
  { key: 17, chapter: 'Chapter III', title: 'Urzael\'s End',     goal: 'Kill Urzael on Torment IV+.',                  long: 'Kill Urzael in the Passage to Corvus on Torment IV difficulty or higher.',                                                             completed: false },
  { key: 18, chapter: 'Chapter III', title: 'Challenge Rift',    goal: 'Complete the Challenge Rift.',                 long: 'Complete the weekly Challenge Rift.',                                                                                                   completed: false },

  // Chapter IV
  { key: 19, chapter: 'Chapter IV', title: 'Paragon 150',       goal: 'Reach Paragon 150.',                            long: 'Reach Paragon level 150 with your Seasonal hero.',                                                                                     completed: false },
  { key: 20, chapter: 'Chapter IV', title: 'Into the Deep',     goal: 'Complete a Greater Rift Tier 60.',              long: 'Complete a Greater Rift Tier 60 or higher solo.',                                                                                      completed: false },
  { key: 21, chapter: 'Chapter IV', title: 'Full Set',          goal: 'Equip a full 6-piece Class Set bonus.',         long: 'Equip six pieces of the same Class Set to activate the 6-piece set bonus. Completing Chapters II, III and IV rewards Haedrig\'s Gift.',  completed: false },
  { key: 22, chapter: 'Chapter IV', title: 'Malthael Falls',    goal: 'Kill Malthael on Torment VI+.',                 long: 'Kill Malthael, Angel of Death, in Pandemonium Fortress Level 2 on Torment VI or higher.',                                              completed: false },
  { key: 23, chapter: 'Chapter IV', title: 'Bountiful',         goal: 'Complete all Acts\' Bounties in one game.',     long: 'Complete all Bounties in all five Acts in a single Nephalem Rift game.',                                                                completed: false },
  { key: 24, chapter: 'Chapter IV', title: 'Gem Level 75',      goal: 'Level a Legendary Gem to 75.',                  long: 'Upgrade a Legendary Gem to level 75 using a Greater Rift Keystone.',                                                                   completed: false },

  // Slayer
  { key: 25, chapter: 'Slayer', title: 'Greater Push',    goal: 'Complete a Greater Rift Tier 70.',        long: 'Complete a Greater Rift Tier 70 or higher solo.',                                                      completed: false },
  { key: 26, chapter: 'Slayer', title: 'Paragon 200',     goal: 'Reach Paragon 200.',                      long: 'Reach Paragon level 200 with your Seasonal hero.',                                                     completed: false },
  { key: 27, chapter: 'Slayer', title: 'Ancient Power',   goal: 'Equip an Ancient Legendary item.',        long: 'Equip an Ancient Legendary item.',                                                                     completed: false },
  { key: 28, chapter: 'Slayer', title: 'Cube Power',      goal: 'Extract 10 Legendary Powers via Cube.',   long: 'Use Kanai\'s Cube to extract 10 different Legendary powers.',                                          completed: false },
  { key: 29, chapter: 'Slayer', title: 'High Roller',     goal: 'Spend 10,000 Blood Shards at Kadala.',    long: 'Spend a cumulative total of 10,000 Blood Shards gambling with Kadala.',                                 completed: false },
  { key: 30, chapter: 'Slayer', title: 'Augment',         goal: 'Augment an Ancient item in the Cube.',    long: 'Use Kanai\'s Cube to augment an Ancient Legendary item with a Legendary Gem.',                         completed: false },
  { key: 31, chapter: 'Slayer', title: 'Conquest I',      goal: 'Complete one Season Conquest.',           long: 'Complete any one Season Conquest objective.',                                                          completed: false },

  // Champion
  { key: 32, chapter: 'Champion', title: 'Greater Depth',     goal: 'Complete a Greater Rift Tier 75.',      long: 'Complete a Greater Rift Tier 75 or higher solo.',                                                completed: false },
  { key: 33, chapter: 'Champion', title: 'Paragon 300',       goal: 'Reach Paragon 300.',                    long: 'Reach Paragon level 300 with your Seasonal hero.',                                               completed: false },
  { key: 34, chapter: 'Champion', title: 'Primal Hunt',       goal: 'Find a Primal Ancient item.',           long: 'Find a Primal Ancient Legendary or Set item.',                                                   completed: false },
  { key: 35, chapter: 'Champion', title: 'Gem Pinnacle',      goal: 'Level a Legendary Gem to 65.',          long: 'Upgrade a Legendary Gem to level 65.',                                                           completed: false },
  { key: 36, chapter: 'Champion', title: 'Cube Full Power',   goal: 'Extract 20 Legendary Powers via Cube.', long: 'Use Kanai\'s Cube to extract 20 different Legendary powers.',                                    completed: false },
  { key: 37, chapter: 'Champion', title: 'Conquest II',       goal: 'Complete two Season Conquests.',        long: 'Complete any two Season Conquest objectives.',                                                   completed: false },

  // Destroyer
  { key: 38, chapter: 'Destroyer', title: 'Pushing Limits',    goal: 'Complete a Greater Rift Tier 80.',       long: 'Complete a Greater Rift Tier 80 or higher solo.',                                            completed: false },
  { key: 39, chapter: 'Destroyer', title: 'Paragon 400',       goal: 'Reach Paragon 400.',                     long: 'Reach Paragon level 400 with your Seasonal hero.',                                           completed: false },
  { key: 40, chapter: 'Destroyer', title: 'Augment Power',     goal: 'Augment 3 Ancient items in the Cube.',   long: 'Use Kanai\'s Cube to augment 3 different Ancient Legendary items with Legendary Gems.',       completed: false },
  { key: 41, chapter: 'Destroyer', title: 'Gem Level 70',      goal: 'Level a Legendary Gem to 70.',           long: 'Upgrade a Legendary Gem to level 70.',                                                       completed: false },
  { key: 42, chapter: 'Destroyer', title: 'Conquest III',      goal: 'Complete three Season Conquests.',       long: 'Complete any three Season Conquest objectives.',                                             completed: false },

  // Conqueror
  { key: 43, chapter: 'Conqueror', title: 'Deep Rift',         goal: 'Complete a Greater Rift Tier 85.',       long: 'Complete a Greater Rift Tier 85 or higher solo.',                                            completed: false },
  { key: 44, chapter: 'Conqueror', title: 'Paragon 500',       goal: 'Reach Paragon 500.',                     long: 'Reach Paragon level 500. Completing Conqueror unlocks an additional Stash tab.',             completed: false },
  { key: 45, chapter: 'Conqueror', title: 'Augment Army',      goal: 'Augment 8 Ancient items in the Cube.',   long: 'Use Kanai\'s Cube to augment 8 different Ancient Legendary items with Legendary Gems.',       completed: false },
  { key: 46, chapter: 'Conqueror', title: 'Gem Elite',         goal: 'Level a Legendary Gem to 55.',           long: 'Upgrade a Legendary Gem to level 55.',                                                       completed: false },
  { key: 47, chapter: 'Conqueror', title: 'Conquest IV',       goal: 'Complete four Season Conquests.',        long: 'Complete any four Season Conquest objectives.',                                              completed: false },
  { key: 48, chapter: 'Conqueror', title: 'Conquest V',        goal: 'Complete five Season Conquests.',        long: 'Complete any five Season Conquest objectives.',                                              completed: false },

  // Guardian
  { key: 49, chapter: 'Guardian', title: 'Elite Rift',         goal: 'Complete a Greater Rift Tier 90.',       long: 'Complete a Greater Rift Tier 90 or higher solo.',                                            completed: false },
  { key: 50, chapter: 'Guardian', title: 'Paragon 600',        goal: 'Reach Paragon 600.',                     long: 'Reach Paragon level 600 with your Seasonal hero.',                                           completed: false },
  { key: 51, chapter: 'Guardian', title: 'Full Augment',       goal: 'Augment 12 Ancient items in the Cube.',  long: 'Use Kanai\'s Cube to augment 12 different Ancient Legendary items with Legendary Gems.',      completed: false },
  { key: 52, chapter: 'Guardian', title: 'Gem Master',         goal: 'Level three Legendary Gems to 65+.',     long: 'Upgrade three different Legendary Gems to level 65 or higher.',                              completed: false },
  { key: 53, chapter: 'Guardian', title: 'Full Cube',          goal: 'Extract 30 Legendary Powers via Cube.',  long: 'Use Kanai\'s Cube to extract 30 different Legendary powers.',                                completed: false },
  { key: 54, chapter: 'Guardian', title: 'Guardian Seal',      goal: 'Complete all Guardian objectives.',      long: 'Complete all Guardian category objectives to earn the Guardian season portrait frame.',      completed: false },
];

export default seasonJourneyData;
