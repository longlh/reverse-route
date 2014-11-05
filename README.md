reverse-route
=============

ReverseRoute module for Express

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

### Installation
```bash
$ npm install reverse-route
```

#### Basic
```js
var express = require('express'),
	reverseRoute = require('reverse-route'),
	app = express();

// use reverse-route - basic
reverseRoute(app);

app._route('user', '/user/:id').get(function(req, res, next) {
	// ... get user
});
```
```html
<a href="{{ _url('user', { id: 'me' }) }}">My profile</a>
```
#### Customize
```js
reverseRoute(app, function(_url, req, res, next) {
	return function(alias, parameters) {
		// add some parameters here
		parameters.locale = i18n.getLocale(req);
		return _url(alias, parameters);
	};
});
```
### Methods
#### app._route(alias, path)
```js
app._route('signin', '/signin').get(function(req, res, next) {
	// render signin page
}).post(function(req, res, next) {
	// handle signin request
});
```

#### .app._VERB(alias, path, [callback...], callback)
Support GET, POST, PUT, DELETE, HEAD, TRACE, OPTIONS, CONNECT, and PATCH.
```js
app._get('home', '/', function(req, res, next) {
	// ...
});
```

#### app._route.add(alias, sets)
Support alias with defined parameter sets
```js
app._route.add('static', {
   about: {
	  id: 'about'
   },
   term: {
	  id: 'term'
   }
});

app._route('static', '/page/:id').get(function(req, res, next) {
	// render static page
});
```

```html
<a href="{{ _url('static', 'about') }}">About us</a><br>
<a href="{{ _url('static', 'term') }}">Terms & Conditions</a>
```

#### app._route.remove(alias, setname)
Remove a defined parameter sets
### Redirect
#### res._redirect(alias, [setname, params])
```js
function redirectToHomePage(req, res, next) {
	res._redirect('home');
}

function redirectToProfilePage(req, res, next) {
	res._redirect('user', {
		id: 'me'
	});
}

function redirectToAboutPage(req, res, next) {
	res._redirect('static', 'about');
}

function redirectToAboutPageInAnotherLanguage(req, res, next) {
	res._redirect('static', 'about', {
		lang: 'vi'
	});
}
```
### Helper
#### _url(alias, [setname, params])
Accept same arguments as `res._redirect()`. Use to generate URL in HTML template
```html
<a href="{{ _url('home') }}">Home page</a> <!-- URL: / -->
<a href="{{ _url('user', { id: 'me' }) }}">My profile</a> <!-- URL: /user/me -->
<a href="{{ _url('static', 'about') }}">About us</a> <!-- URL: /page/about  -->
<a href="{{ _url('static', 'about', { lang: 'vi' }) }}">About us in Vietnamese</a> <!-- URL: /page/about?lang=vi -->
```
[npm-image]: https://img.shields.io/npm/v/reverse-route.svg?style=flat
[npm-url]: https://www.npmjs.org/package/reverse-route
[downloads-image]: https://img.shields.io/npm/dm/reverse-route.svg?style=flat
[downloads-url]: https://npmjs.org/package/reverse-route
