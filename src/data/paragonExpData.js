// Paragon XP table — level and cumulative totalExp per level.
// Approximated from known D3 paragon scaling (scales up to ~1.36B XP/level at high paragons).
// getNumber() in nonUIFuncs strips commas, so both fields are formatted with commas.
function generate() {
  const data = [];
  let total = 0;
  const HIGH_LEVEL_XP = 1360000000;
  const START_XP = 17000000;
  const RAMP_LEVELS = 800;

  for (let i = 1; i <= 5000; i++) {
    let xpThisLevel;
    if (i <= RAMP_LEVELS) {
      xpThisLevel = Math.round(
        START_XP + ((HIGH_LEVEL_XP - START_XP) * (i - 1)) / (RAMP_LEVELS - 1)
      );
    } else {
      xpThisLevel = HIGH_LEVEL_XP;
    }
    total += xpThisLevel;
    data.push({
      level: i.toLocaleString('en-US'),
      totalExp: total.toLocaleString('en-US'),
    });
  }
  return data;
}

const paragonExpData = generate();
export default paragonExpData;
