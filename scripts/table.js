'use strict';

var app = {
  isLoading: true,
  visibleFruits: {},
  selectedFruits: [],
  spinner: document.querySelector('.loader'),
  lineTemplate: document.querySelector('.cardTemplate'),
  container: document.querySelector('.main'),
  tableBody: document.querySelector('.tbl-body'),
  cards: document.querySelector('.cards')
};
console.log('ím here');

function addCard() {
  var li = document.createElement('li');
  li.class = "cards__item";

}

// iterate over each element
db.reverse().forEach(function(element) {
  var row = app.tableBody.insertRow(0);

  var itemsToIterate = element.season.reverse();
  //iterate over each season
  for (var i = 0, len = itemsToIterate.length; i < len; i++) {
      var item = itemsToIterate[i];

      if (item === 'Forte' && (new Date()).getMonth() === i ) {
        console.log('hj esta bom para', element.name);
      }

      var cell = row.insertCell(item);
      cell.innerHTML = item;
      if (item === 'Forte') cell.style.backgroundColor = 'green';
      if (item === 'Medio') cell.style.backgroundColor = '#F7B733';
      if (item === 'Fraco') cell.style.backgroundColor = 'indianred'; // verde fraco
      // red '#FC4A1A'
      // if (item === '') cell.style.backgroundColor = "black";
  }

  if (element.isClass) {
    var th = document.createElement('th');
    th.innerHTML = element.name;
    th.colSpan = 13;
    th.style.backgroundColor = '#4ABDAC';
    row.appendChild(th);
  } else {
    var cellName = row.insertCell(0);
    cellName.innerHTML = element.name;
  }
}, this);
