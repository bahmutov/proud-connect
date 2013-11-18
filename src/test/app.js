var listen = require('../app');
var request = require('request');

var port = 4444;
var urlBase = 'http://localhost:' + port + '/';

gt.module('server', {
  setupOnce: function () {
    console.log('starting listening');
    listen(port);
  }
});

gt.async('no username', function () {
  var url = urlBase;
  request(url, function (err, response, body) {
    if (err) throw err;
    gt.equal(response.statusCode, 401, '401 without username');
    gt.start();
  });
});

gt.async('plain text', function () {
  var url = urlBase + 'jashkenas';
  request(url, function (err, response, body) {
    if (err) throw err;
    gt.equal(response.statusCode, 200, 'got response');
    gt.equal(response.headers['content-type'], 'text/plain', 'returns text');

    gt.ok(/jashkenas/.test(body), 'contains username');
    gt.ok(/Total/i.test(body), 'contains total');
    gt.start();
  });
});

gt.async('json', function () {
  var username = 'jashkenas';
  var opts = {
    url: urlBase + username,
    json: true
  };
  request(opts, function (err, response, body) {
    if (err) throw err;
    gt.equal(response.statusCode, 200, 'got response');
    gt.equal(response.headers['content-type'], 'application/json', 'returns json');

    gt.equal(body.username, username, 'correct username');
    gt.start();
  });
});
