'use strict';
require('./blanket');
var express = require('express');
var request = require('supertest');
var should = require('should');
var reverseRoute = require('../lib/reverse-route/index');

describe('ReverseRoute monkey-patch', function() {
	var app = express();

	var patchedApp = reverseRoute(app);

	it('should return same app object', function(done) {
		should.equal(app, patchedApp);
		done();
	});

	it('should create ._route', function(done) {
		should.equal(typeof app._route, 'function');
		should.equal(typeof app._route.add, 'function');
		should.equal(typeof app._route.remove, 'function');

		done();
	});

	it('should create ._{{HTTP_VERB}}()', function(done) {
		should.equal(typeof app._get, 'function');
		should.equal(typeof app._post, 'function');
		should.equal(typeof app._put, 'function');
		should.equal(typeof app._delete, 'function');
		should.equal(typeof app._head, 'function');
		should.equal(typeof app._trace, 'function');
		should.equal(typeof app._options, 'function');
		should.equal(typeof app._connect, 'function');
		should.equal(typeof app._patch, 'function');
		done();
	});
});

describe('ReverseRoute middleware', function() {
	it('should inject ._url', function(done) {
		var app = express();
		reverseRoute(app);

		app.use(function(req, res, next) {
			should.equal(typeof req._url, 'function');
			should.equal(typeof res.locals._url, 'function');
			should.equal(req._url, res.locals._url);
			done();
		});

		request(app).get('/').end();
	});

	it('should inject ._redirect', function(done) {
		var app = express();
		reverseRoute(app);

		app.use(function(req, res, next) {
			// mock res.redirect()
			res.redirect = function(url) {
				done();
			};

			should.equal(typeof res._redirect, 'function');
			res._redirect();
		});

		request(app).get('/').end();
	});

	it('should redirect to correct URL', function(done) {
		var app = express();
		reverseRoute(app);

		app.get('/', function(req, res, next) {
			// mock res.redirect()
			res.redirect = function(url) {
				should.equal(url, '/test');

				done();
			};

			res._redirect('test');
		});

		app._get('test', '/test', function(req, res, next) {});

		request(app).get('/').end();
	});

	it('should redirect to correct URL with parameter', function(done) {
		var app = express();
		reverseRoute(app);

		app.get('/', function(req, res, next) {
			// mock res.redirect()
			res.redirect = function(url) {
				should.equal(url, '/test/1');

				done();
			};

			res._redirect('test', {
				id: 1
			});
		});

		app._get('test', '/test/:id', function(req, res, next) {
		});

		request(app).get('/').end();
	});

	it('should redirect to correct URL with querystring', function(done) {
		var app = express();
		reverseRoute(app);

		app.get('/', function(req, res, next) {
			// mock res.redirect()
			res.redirect = function(url) {
				should.equal(url, '/test?id=1');

				done();
			};

			res._redirect('test', {
				id: 1
			});
		});

		app._get('test', '/test', function(req, res, next) {
		});

		request(app).get('/').end();
	});

	it('should redirect to correct URL with pre-defined parameter set', function(done) {
		var app = express();
		reverseRoute(app);

		app.get('/', function(req, res, next) {
			// mock res.redirect()
			res.redirect = function(url) {
				should.equal(url, '/page/about');

				done();
			};

			res._redirect('static', 'about');
		});

		app._route.add('static', {
			about: {
				id: 'about'
			}
		});

		app._route('static', '/page/:id').get(function(req, res, next) {
			// render static page
		});

		request(app).get('/').end();
	});

	it('should redirect to correct URL with pre-defined parameter set and normal parameter', function(done) {
		var app = express();
		reverseRoute(app);

		app.get('/', function(req, res, next) {
			// mock res.redirect()
			res.redirect = function(url) {
				should.equal(url, '/vi/page/about');

				done();
			};

			res._redirect('static', 'about', {
				lang: 'vi'
			});
		});

		app._route.add('static', {
			about: {
				id: 'about'
			}
		});

		app._route('static', '/:lang/page/:id').get(function(req, res, next) {
			// render static page
		});

		request(app).get('/').end();
	});

	it('should allow remove pre-defined parameter set', function(done) {
		var app = express();
		reverseRoute(app);

		app.get('/', function(req, res, next) {
			// mock res.redirect()
			res.redirect = function(url) {
				should.equal(url, '/page/:id');

				done();
			};

			res._redirect('static', 'about');
		});

		app._route.add('static', {
			about: {
				id: 'about'
			}
		});

		app._route.remove('static', 'about');

		app._route('static', '/page/:id').get(function(req, res, next) {
			// render static page
		});

		request(app).get('/').end();
	});

	it('should have res.locals._alias (_verb)', function(done) {
		var app = express();
		reverseRoute(app);

		app._get('test', '/test', function(req, res, next) {
			should.equal(res.locals._alias, 'test');
			done();
		});

		request(app).get('/test').end();
	});

	it('should have res.locals._alias (_route)', function(done) {
		var app = express();
		reverseRoute(app);

		app._route('test', '/test').get(function(req, res, next) {
			should.equal(res.locals._alias, 'test');
			done();
		});

		request(app).get('/test').end();
	});
});
