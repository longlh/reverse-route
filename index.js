'use strict';

// module load
var qs = require('querystring');

// pre-values
var supportedHttpVerbs = [ 'get', 'post', 'put', 'delete' ],
	routeTable = {},
	_path = function(routeName) {
		return routeTable[routeName];
	},
	_build = function(path, parameters) {
		parameters = parameters || {};
		var query = {};

		for (var name in parameters) {
			var searchPattern = new RegExp('(:' + name + ')(\\(.*\\))?');

			var match = path.match(searchPattern);

			if (match) {
				path = path.replace(searchPattern, parameters[name]);
			} else {
				query[name] = parameters[name];
			}
		}

		if (Object.keys(query).length > 0) {
			path += '?' + qs.stringify(query);
		}

		return path;
	},
	_helper = function(routeName, parameters) {
		var path = _path(routeName);

		if (path) {
			return _build(path, parameters);
		} else {
			return '';
		}
	};

module.exports = function(app, factory) {
	// inject enhanced method _route
	app._route = function(routeName, path) {
		// store routeName
		if (routeName) {
			routeTable[routeName] = path;
		}

		return app.route(path).all(function(req, res, next) {
			// add locals
			res.locals._routeName = routeName;
			next();
		});
	};

	// enhanced HTTP verbs: app.VERB(path, [callback...], callback) -> app._VERB(routeName, path, [callback...], callback)
	supportedHttpVerbs.forEach(function(verb) {
		// convert object arguments -> array
		app['_' + verb] = function() {
			var args = Array.prototype.slice.call(arguments);

			// routeName = arguments[0]
			var routeName = args.shift();

			if (routeName) {
				// path = arguments[1] = args[0]
				routeTable[routeName] = args[0];
			}

			return app[verb].apply(app, args);
		};
	});

	app.use(function(req, res, next) {
		var helper = factory ? factory(_path, _build, req, res, next) : _helper;

		// add _url() helper
		res.locals._url = req._url = helper;

		// add _redirect() helper
		res._redirect = function(routeName, parameters) {
			res.redirect(helper(routeName, parameters));
		};

		next();
	});
};