reverse-route
=============

ReverseRoute module for Express

How to use it
---
####Basic<br/>
```
var app = require('express')();

require('reserve-route')(app);

app._route('home', '/').get(function(req, res, next) {
	res._redirect('user', {
		id: 'me'
	});
});

app._get('user', /user/:id', function(req, res, next) {
	res.json({
		message: 'You got me'
	});
});

```

####Customize<br/>
```
var app = require('express')();

require('reserve-route')(app, function(build, req, res, next) {
	return function(alias, parameters) {
		// add some parameters here
		parameters.locale = i18n.getLocale(req);

		return build(alias, parameters);
	};
});

```

####In HTML Template<br/>

Ex: Swig
```
<a href="{{ _url('home') }}">To home</a>
<a href="{{ _url('user', { id: 'me' }) }}"Profile</a>
```