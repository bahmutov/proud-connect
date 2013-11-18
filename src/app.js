var connect = require('connect');
var http = require('http');
var proud = require('proud');
var badge = require('proud-badge');
var report = require('./report');
var fs = require('fs');
var check = require('check-types');
var Q = require('q');
var moment = require('moment');

// username -> {image, date}
var badges = {};

function ensureSpace() {
  var maxN = 1000;
  if (Object.keys(badges).length > maxN) {
    console.log('freeing space');
    // todo: sort by date, remove oldest
  }
}

function keepGeneratedBadge(username, filename) {
  check.verify.unemptyString(username, 'expected username');
  check.verify.unemptyString(filename, 'expected generated badge filename');

  var image = fs.readFileSync(filename);
  badges[username] = {
    image: image,
    date: new moment()
  };

  fs.unlinkSync(filename);

  return image;
}

function generateBadge(username) {
  check.verify.unemptyString(username, 'expected username');

  if (badge[username] && badge[username].generating) {
    return badge[username].generating;
  }

  ensureSpace();

  if (!badge[username]) {
    badge[username] = {};
  }

  badge[username].generating = badge(username)
    .then(keepGeneratedBadge.bind(null, username));

  return badge[username].generating;
}

function getBadge(username) {
  check.verify.unemptyString(username, 'expected username');

  var oldDate = moment().subtract('days', 1);
  if (badges[username] && badges[username].image) {
    if (badges[username].date.isBefore(oldDate)) {
      console.log('badge for', username, 'is out of date');
      return generateBadge(username);
    }

    if (badges[username].image) {
      return badges[username].image;
    }
  }

  return generateBadge(username);
}

function sendBadge(username, res) {
  console.log('returning badge image for', username);
  check.verify.unemptyString(username, 'expected username');

  Q.when(getBadge(username))
  .then(function (image) {
    if (!image) {
      throw new Error('Undefined image for user ' + username);
    }

    res.writeHead(200, {
      'Content-Length': image.length,
      'Content-Type': 'image/png'
    });
    res.write(image);
    res.end();
  })
  .catch(function (err) {
    console.error('Error generating badge for', username);
    console.error(err);
    console.error(err.stack);
    res.writeHead(500, err);
    res.end();
  });
}

function sendTextReport(username, res) {
  console.log('returning text for', username);

  proud(username)
  .then(report.bind(null, username))
  .then(function (report) {
    res.writeHead(200, {
      'Content-Type': 'text/plain'
    });

    if (!report) {
      res.end(username + ' has no modules\n');
    } else {
      res.end(report);
    }
  })
  .catch(console.error);
}

function sendJsonReport(username, res) {
  console.log('returning json for', username);

  proud(username)
  .then(report.bind(null, username))
  .then(function (report) {
    var result = {
      username: username,
      report: report
    };
    console.log('report', result);

    res.writeHead(200, {
      'Content-Type': 'application/json'
    });

    res.end(JSON.stringify(result));
  })
  .catch(console.error);
}

var app = connect()
  .use(connect.favicon())
  .use(connect.logger('dev'))
  .use(connect.static('public'))
  .use(connect.query())
  .use(function (req, res) {
    if (!req.url || req.url === '/') {
      res.writeHead(401, 'missing NPM username');
      res.end();
      return;
    }

    var username = req.url.split('/')[1];
    if (!username) {
      res.writeHead(401, 'missing NPM username');
      res.end();
      return;
    }

    console.log('accepts', req.headers.accept);

    if (/image/.test(req.headers.accept)) {
      sendBadge(username, res);
    } else if (req.headers.accept === 'application/json') {
      sendJsonReport(username, res);
    } else {
      sendTextReport(username, res);
    }
  });

module.exports = function listen(port) {
  port = port || process.env.PORT || 3000;
  http.createServer(app).listen(port);
  console.log('listening to port', port);
};
