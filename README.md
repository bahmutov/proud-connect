# proud-connect v0.0.1

> Connect server generating NPM downloads badges by author

[![NPM][proud-icon]][proud-url]

[![Build status][proud-ci-image]][proud-ci-url]
[![dependencies][proud-dependencies-image]][proud-dependencies-url]
[![devdependencies][proud-devdependencies-image]][proud-devdependencies-url]

[![endorse][endorse-image]][endorse-url]

[proud-icon]: https://nodei.co/npm/proud.png?downloads=true
[proud-url]: https://npmjs.org/package/proud
[proud-ci-image]: https://travis-ci.org/bahmutov/proud.png?branch=master
[proud-ci-url]: https://travis-ci.org/bahmutov/proud
[proud-dependencies-image]: https://david-dm.org/bahmutov/proud.png
[proud-dependencies-url]: https://david-dm.org/bahmutov/proud
[proud-devdependencies-image]: https://david-dm.org/bahmutov/proud/dev-status.png
[proud-devdependencies-url]: https://david-dm.org/bahmutov/proud#info=devDependencies
[endorse-image]: https://api.coderwall.com/bahmutov/endorsecount.png
[endorse-url]: https://coderwall.com/bahmutov



## Use

```
npm install
node index.js
```

Badge / json information can be fetched `http://localhost:3000/username

#### Using the deployed Heroku app

![bahmutov badge](http://proud.herokuapp.com/bahmutov)

Use Markdown:

    ![bahmutov badge](http://proud.herokuapp.com/bahmutov)

Or HTML:

    <img src="http://proud.herokuapp.com/bahmutov"></img>

to generate number of total NPM downloads in the last month.



### Related

* [proud](https://github.com/bahmutov/proud) is a stand alone CLI tool
* [proud-badge](https://github.com/bahmutov/proud-badge) generates badges
* [proud-heroku-app](https://github.com/bahmutov/proud-heroku-app) is
a *proud-connect* service [running on Heroku](http://proud.herokuapp.com/)

## Why?

Because one should be **proud** of his work.

### Small print

Author: Gleb Bahmutov &copy; 2013

* [@bahmutov](https://twitter.com/bahmutov)
* [glebbahmutov.com](http://glebbahmutov.com)
* [blog](http://bahmutov.calepin.co/)

License: MIT - do anything with the code, but don't blame me if it does not work.

Spread the word: tweet, star on github, click *endorse*, etc.

Support: if you find any problems with this module, email / tweet / open issue on Github



## History


0.0.0 / 2013-11-13
==================

  * added Procfile
  * images older than day will be regenerated
  * old images are regenerated correctly, even if multiple requests arrive
  * returning badge and keeping it in memory
  * working badge return or text, depending on request


