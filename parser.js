const fs = require('fs');

const file = fs.readFileSync(__dirname + '/fruit-for-all-db.ssf', 'utf8', '-r');
const aFruitLine = file.split('\n');
let family = '';
const aFruitSeason = aFruitLine.map(item => {
  const fruit = {};
  fruit.name = item.split('\t', 1)[0];
  if (fruit.name === 'family') {
    fruit.name = item.split('\t', 2)[1];
    fruit.season = [];
    fruit.isClass = true;
    fruit.family = fruit.name;
    family = fruit.name;
    return fruit;
  }
  fruit.season = item.split('\t')
  fruit.isClass = false;
  fruit.season.shift();
  fruit.family = family;
  return fruit;
});
// console.log('const db = ', aFruitSeason);

