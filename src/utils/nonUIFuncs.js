const getNumber = (number) => {
  let newNumber = String(number).replaceAll(',', '');
  return Number(newNumber);
};

const getParagonFromExp = ({ highestParagon, exp, data }) => {
  let para;
  for (let i = highestParagon; i < data.length; i++) {
    let currentParagon = data.find((d) => getNumber(d.level) === i);
    let nextParagon = data.find((d) => getNumber(d.level) === i + 1);
    if (nextParagon !== undefined && getNumber(nextParagon.totalExp) > exp) {
      if (getNumber(currentParagon.totalExp) <= exp) {
        para = nextParagon;
        break;
      }
    }
  }
  return para;
};

export { getNumber, getParagonFromExp };
