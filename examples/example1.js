var OLX = require('../crawler');

var opts = {
  'category': 'imoveis/venda',
  'search': 'casa'
};

var olx = new OLX(opts);

olx.on('hit', function(hit) {
  console.log(hit);
});

olx.on('page', function(data) {
  console.log(data);
});

olx.start();
