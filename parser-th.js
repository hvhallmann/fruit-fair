const fs = require('fs');

// fs.access(__filename, (error) => error ? console.log('This file does not exist.') : console.log('This file exists.'));

const file = fs.readFileSync(__dirname + '/frutas-db.1.ssf', 'utf8', '-r');
const aFruitLine = file.split('\n');
const aFruitSeason = aFruitLine.map(item => {
  const fruit = {};
  fruit.name = item.split('\t', 1);
  fruit.season = item.split('\t')
  fruit.season.shift();
  return fruit;
});
// console.log('my file', aFruitSeason);
aFruitSeason.forEach((el) => {
  console.log('<tr>');
  console.log(`<td>${el.name[0]}</td>`);
  el.season.forEach((it) => {
    console.log(`<td>${it}</td>`);
  });
  console.log('</tr>');
});

