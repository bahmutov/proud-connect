var connect = require('connect');
var utils = connect.utils;
var http = require('http');
var proud = require('proud');
var badge = require('proud-badge');
var report = require('./report');
var fs = require('fs');
var check = require('check-types');
var verify = check.verify;
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

  var now = new moment();
  var secondsInDay = 24 * 3600;

  var info = {
    image: image,
    date: now,
    expires: moment(now).add('days', 1),
    maxAge: secondsInDay
  };

  badges[username] = info;

  fs.unlinkSync(filename);

  return info;
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
      return badges[username];
    }
  }

  return generateBadge(username);
}

function sendBadge(username, res) {
  console.log('returning badge image for', username);
  check.verify.unemptyString(username, 'expected username');

  Q.when(getBadge(username))
  .then(function (info) {
    if (!info || !info.image) {
      throw new Error('Undefined image for user ' + username);
    }

    check.verify.positiveNumber(info.maxAge, 'missing max age for username ' + username);
    check.verify.object(info.expires, 'missing expires for username ' + username);
    res.writeHead(200, {
      'Content-Length': info.image.length,
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=' + info.maxAge,
      'Expires': info.expires.utc().format()
    });
    res.write(info.image);
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

function isImage(format) {
  return (/image/).test(format) ||
    format === 'png' ||
    format === 'image';
}

var raven = require('raven');
var SENTRY_DSN = 'https://fc9f5a7e88204f069de9dc8680ac6216:5a11fd1a7f1b4f0d982ab24997dedc20@app.getsentry.com/17313';

function respondWithBadge(req, res, next) {
  if (!req.url || req.url === '/') {
    console.log('missing NPM username', req);
    return next(utils.error(401));
  }

  verify.unemptyString(req.url, 'missing req url string');
  var parts = req.url.split('/');
  var username = parts[1];
  if (!username) {
    return next(utils.error(401));
  }

  var acceptsFormat = req.headers.accept;
  if (parts.length > 2) {
    acceptsFormat = parts[2];
    check.verify.unemptyString(acceptsFormat, 'wrong format ' + acceptsFormat);
    console.log('requesting format', acceptsFormat);
  }
  console.log('accepts', acceptsFormat);

  if (isImage(acceptsFormat)) {
    return sendBadge(username, res);
  }

  if (acceptsFormat === 'application/json' || acceptsFormat === 'json') {
    return sendJsonReport(username, res);
  }

  return sendTextReport(username, res);
}

var app = connect()
  .use(connect.favicon())
  .use(connect.logger('dev'))
  .use(function checkJsonNoUsername(req, res, next) {
    if (!req.url || req.url === '/') {
      if (req.headers.accept === 'application/json') {
        console.log('empty username and json output');
        return next(utils.error(401));
      }
    }
    return next();
  })
  .use(connect.static('public'))
  .use(connect.bodyParser())
  .use(connect.cookieParser())
  .use(connect.query())
  .use(respondWithBadge)
  .use(raven.middleware.connect(SENTRY_DSN));

module.exports = function listen(port) {
  port = port || process.env.PORT || 3000;
  http.createServer(app).listen(port);
  console.log('listening to port', port);
};
