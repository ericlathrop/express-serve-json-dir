"use strict";

var assert = require("assert");
var FS = require("fs-mock");
var rewire = require("rewire");

var serveJsonDir = rewire("./serve_json_dir");

function mockFs(structure) {
	var fs = new FS(structure);
	serveJsonDir.__set__("fs", fs);
	return fs;
}

describe("serveJsonDir", function() {
	describe("with no root", function() {
		it("should explode", function() {
			assert.throws(serveJsonDir, TypeError);
		});
	});
	describe("with root", function() {
		describe("that doesn't exist", function() {
			it("should return a middleware", function() {
				assert.throws(serveJsonDir.bind(undefined, "/dir"), TypeError);
			});
		});
		describe("that does exist", function() {
			it("should return a middleware", function() {
				mockFs({
					"dir": {}
				});
				assert(typeof serveJsonDir("/dir") === "function");
			});
		});
	});
	describe("middleware", function() {
		var fs, middleware;

		beforeEach(function() {
			fs = mockFs({
				"dir": {}
			});
			middleware = serveJsonDir("/dir");
		});

		describe("with PUT request", function() {
			it("should call next", function(done) {
				var req = { method: "PUT" };
				var res = {};
				middleware(req, res, done);
			});
		});
	});
});
