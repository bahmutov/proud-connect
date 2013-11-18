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

(function cachedPng() {
  var image;
  var took = 0;

  gt.async('/png', function () {
    var username = 'jashkenas';
    var opts = {
      url: urlBase + username + '/png'
    };
    var started = new Date();
    request(opts, function (err, response, body) {
      if (err) throw err;
      var finished = new Date();

      gt.equal(response.statusCode, 200, 'got response');
      gt.equal(response.headers['content-type'], 'image/png', 'returns png');
      image = body;
      gt.ok(image.length > 0, 'positive image length');
      took = finished - started;

      gt.ok(took > 0, 'took a few ms');
      gt.start();
    });
  });

  gt.async('/png 2 - cached', function () {
    var username = 'jashkenas';
    var opts = {
      url: urlBase + username + '/png'
    };
    var started = new Date();

    request(opts, function (err, response, body) {
      if (err) throw err;
      var finished = new Date();
      var took2 = finished - started;
      gt.ok(took2 < took, 'second request completed faster than first');

      gt.equal(response.statusCode, 200, 'got response');
      gt.equal(response.headers['content-type'], 'image/png', 'returns png');
      gt.start();
    });
  });
}());

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

gt.async('/json', function () {
  var username = 'jashkenas';
  var opts = {
    url: urlBase + username + '/json'
  };
  request(opts, function (err, response, body) {
    if (err) throw err;
    gt.equal(response.statusCode, 200, 'got response');
    gt.equal(response.headers['content-type'], 'application/json', 'returns json');

    var result = JSON.parse(body);
    gt.equal(result.username, username, 'correct username');
    gt.start();
  });
});

// todo: make sure second request uses cached data
gt.async('/json 2', function () {
  var username = 'jashkenas';
  var opts = {
    url: urlBase + username + '/json'
  };
  request(opts, function (err, response, body) {
    if (err) throw err;
    gt.equal(response.statusCode, 200, 'got response');
    gt.equal(response.headers['content-type'], 'application/json', 'returns json');

    var result = JSON.parse(body);
    gt.equal(result.username, username, 'correct username');
    gt.start();
  });
});
