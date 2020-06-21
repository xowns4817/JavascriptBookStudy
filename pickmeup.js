const data = {
  김아라: 90,
  김태준: 100,
  조성동: 100,
  하현관: 90,
  김강수: 70,
  안민원: 100,
};

function weighted_random(weights) {
  const sum = weights.reduce((acc, cur) => acc + cur, 0);
  let randomValue = Math.random() * sum;
  for (let i = 0; i < weights.length; i++) {
    randomValue -= weights[i];
    if (randomValue < 1) return i;
  }
}

function pickmeup() {
  const index = weighted_random(Object.values(data));
  const name = Object.keys(data)[index];
  console.log(name);
}

pickmeup();
