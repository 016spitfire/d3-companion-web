const getNumber = (number) => {
  return Number(String(number).replaceAll(',', ''));
};

const getBigInt = (number) => {
  return BigInt(String(number).replaceAll(',', ''));
};

// getParagonFromExp uses BigInt for exp comparisons to stay precise at high paragon levels
const getParagonFromExp = ({ highestParagon, exp, data }) => {
  const expBig = BigInt(exp);
  let para;
  for (let i = highestParagon; i < data.length; i++) {
    let currentParagon = data.find((d) => getNumber(d.level) === i);
    let nextParagon = data.find((d) => getNumber(d.level) === i + 1);
    if (nextParagon !== undefined && getBigInt(nextParagon.totalExp) > expBig) {
      if (getBigInt(currentParagon.totalExp) <= expBig) {
        para = nextParagon;
        break;
      }
    }
  }
  return para;
};

export { getNumber, getBigInt, getParagonFromExp };
