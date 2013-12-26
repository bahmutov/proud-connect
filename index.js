var raven = require('raven');
var SENTRY_DSN = 'https://fc9f5a7e88204f069de9dc8680ac6216:5a11fd1a7f1b4f0d982ab24997dedc20@app.getsentry.com/17313';
var client = new raven.Client(SENTRY_DSN);
client.patchGlobal();


var listen = require('./src/app');

var port = process.env.PORT || 3000;
listen(port);
