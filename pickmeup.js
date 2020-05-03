const data = {
  김아라: 100,
  김태준: 100,
  조성동: 100,
  하현관: 100,
  김강수: 100,
  안민원: 100,
};

function weighted_random(weights) {
  const sum = weights.reduce((acc, cur) => acc + cur, 0);
  let randomValue = Math.random() * (sum - 0);
  for (let i = 0; i < weights.length; i++) {
    randomValue -= weights[i];
    if (randomValue < 1) return i;
  }
  return false;
}

function pickmeup() {
  const index = weighted_random(Object.values(data));
  const name = Object.keys(data)[index];
  console.log(name);
}

pickmeup();
