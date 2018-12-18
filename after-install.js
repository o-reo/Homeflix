const fs = require('fs');

var path = 'node_modules/webpack-dev-server/client/index.js';

fs.readFile(path, function read(err, data) {
  if (err) {
    throw err;
  }

  var str = data.toString().replace('log.error(\'[WDS] Disconnected!\');', '');
  fs.writeFile(path, str, function () {
    console.log('Install finish !');
  });

});
