'use strict';

// module load
var qs = require('querystring'),
	_ = require('lodash');

console.log('loaded...');

// pre-values
var supportedHttpVerbs = [ 'get', 'post', 'put', 'delete', 'head', 'trace', 'options', 'connect', 'patch' ],
	aliases = {},
	sets = {};

var _build = function() {
	var args = Array.prototype.slice.call(arguments),
		alias, setName, params;

	if (args.length === 1) { // _build(alias)
		alias = args.shift();
	} else if (args.length === 2) { // _build(alias, setName) or _build(alias, params)
		alias = args.shift();

		var second = args.shift();

		if (typeof second === 'string') {
			setName = second;
		} else {
			params = second;
		}
	} else if (args.length === 3) { // _build(alias, setName, params)
		alias = args.shift();
		setName = args.shift();
		params = args.shift();
	} else {
		return;
	}

	if (setName) {
		// get pre-defined parameters
		params = _.assign(sets[alias] && sets[alias][setName] || {}, params);
	}

	var path = aliases[alias];

	if (path) {
		params = params || {};
		var query = {};

		for (var name in params) {
			var searchPattern = new RegExp('(:' + name + ')(\\(.*\\))?');

			var match = path.match(searchPattern);

			if (match) {
				path = path.replace(searchPattern, params[name]);
			} else {
				query[name] = params[name];
			}
		}

		if (Object.keys(query).length > 0) {
			path += '?' + qs.stringify(query);
		}
	}

	return path;
};

module.exports = function(app, factory) {
	// ehhance app.route(path) -> app._route(alias, path)
	app._route = function(alias, path) {
		// store alias
		if (alias) {
			aliases[alias] = path;
		}

		return app.route(path).all(function(req, res, next) {
			// add locals
			res.locals._alias = alias;
			next();
		});
	};

	// support pre-defined sets of parameters
	app._route.add = function(alias, paramSets) {
		sets[alias] = _.assign(sets[alias] || {}, paramSets);
	};

	app._route.remove = function(alias, setName) {
		sets[alias] = sets[alias] || {};
		sets[alias][setName] = undefined;
	};

	// enhance HTTP verbs: app.VERB(path, [callback...], callback) -> app._VERB(alias, path, [callback...], callback)
	supportedHttpVerbs.forEach(function(verb) {
		// convert object arguments -> array
		app['_' + verb] = function() {
			var args = Array.prototype.slice.call(arguments);

			// alias = arguments[0]
			var alias = args.shift();

			if (alias) {
				// path = arguments[1] = args[0]
				aliases[alias] = args[0];
			}

			return app[verb].apply(app, args);
		};
	});

	app.use(function(req, res, next) {
		var helper = factory ? factory(_build, req, res, next) : _build;

		// add _url() helper
		res.locals._url = req._url = helper;

		// add _redirect() helper
		res._redirect = function() {
			res.redirect(helper.apply(helper, arguments));
		};

		next();
	});

	return app;
};