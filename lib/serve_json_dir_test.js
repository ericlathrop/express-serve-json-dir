"use strict";

var assert = require("assert");
var FS = require("fs-mock");
var rewire = require("rewire");
var stream = require("stream");

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
				"dir": {
					"folder": {
						"file.txt": "yolo"
					},
					"the answer.txt": "42"
				}
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

		describe("with GET request", function() {
			it("should return 200", function(done) {
				var req = mockRequest("GET", "/", null);
				var res = mockResponse();
				res.on("finish", function() {
					assert.equal(200, res.statusCode);
					done();
				});
				middleware(req, res);
			});
		});
	});
});

function mockRequest(method, url, data) {
	var req = stream.Readable();
	req._read = function() {
		req.push(data);
		req.push(null);
	};
	req.method = method;
	req.url = url;
	return req;
}

function mockResponse() {
	var res = stream.Writable();
	res._write = function(chunk, encoding, callback) { // jshint ignore:line
		callback();
	};
	return res;
}
