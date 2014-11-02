'use strict';

// module load
var qs = require('querystring');

// pre-values
var supportedHttpVerbs = [ 'get', 'post', 'put', 'delete' ],
	aliases = {};

var _build = function(alias, parameters) {
		var path = aliases[alias];

		if (path) {
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
		}

		return path;
	},
	_helper = function(alias, parameters) {
		return _build(alias, parameters);
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
		var helper = factory ? factory(_build, req, res, next) : _helper;

		// add _url() helper
		res.locals._url = req._url = helper;

		// add _redirect() helper
		res._redirect = function(alias, parameters) {
			res.redirect(helper(alias, parameters));
		};

		next();
	});
};