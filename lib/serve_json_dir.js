"use strict";

var async = require("async");
var fs = require("fs");
var path = require("path");

module.exports = function(root) {
	if (!root) {
		throw new TypeError("root is required");
	}

	if (!fs.existsSync(root)) {
		throw new TypeError("root does not exist");
	}

	return function(req, res, next) {
		if (req.method !== "GET") {
			next();
			return;
		}

		var p = trimTrailingSlash(path.join(root, req.url));
		fs.readdir(p, function(err, files) {
			if (err) {
				next();
				return;
			}
			var fullPaths = files.map(function(file) {
				return path.join(p, file);
			});

			async.map(fullPaths, fs.stat, function(err, stats) {
				if (err) {
					console.log("MAPERR:", err);
					throw err;
				}
				var out = files.map(function(file, i) {
					return {
						name: file,
						type: stats[i].isDirectory() ? "directory" : "file"
					};
				});
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.write(JSON.stringify(out));
				res.end();
			});
		});
	};
};

function trimTrailingSlash(s) {
	if (s[s.length - 1] === "/") {
		return s.substring(0, s.length - 1);
	}
	return s;
}
