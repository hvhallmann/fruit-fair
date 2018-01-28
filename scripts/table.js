// original code. proceed ?

// '.tbl-content' consumed little space for vertical scrollbar, scrollbar width depend on browser/os/platfrom. Here calculate the scollbar width .
// $(window).on("load resize ", function() {
//   var scrollWidth = $('.tbl-content').width() - $('.tbl-content table').width();
//   $('.tbl-header').css({'padding-right':scrollWidth});
// }).resize();

'use strict';

var app = {
  isLoading: true,
  visibleFruits: {},
  selectedFruits: [],
  spinner: document.querySelector('.loader'),
  lineTemplate: document.querySelector('.cardTemplate'),
  container: document.querySelector('.main'),
  tableBody: document.querySelector('.tbl-body')
};

db.reverse().forEach(function(element) {
  var row = app.tableBody.insertRow(0);

  var itemsToIterate = element.season.reverse();
  for (var i = 0, len = itemsToIterate.length; i < len; i++) {
      var item = itemsToIterate[i];
      var cell = row.insertCell(item);
      cell.innerHTML = item;
      if (item === 'Bom') cell.style.backgroundColor = "green";
      if (item === 'Fraco') cell.style.backgroundColor = "red";
      if (item === '') cell.style.backgroundColor = "black";
  }

  var cellName = row.insertCell(0);
  cellName.innerHTML = element.name;
}, this);
