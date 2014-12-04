"use strict";

var assert = require("assert");
var mockFs = require("mock-fs");
var serveJsonDir = require("./serve_json_dir");
var stream = require("stream");

describe("serveJsonDir", function() {

	beforeEach(function() {
		mockFs({
			"dir": {
				"folder": {
					"file.txt": "yolo"
				},
				"the answer.txt": "42"
			}
		});
	});

	afterEach(function() {
		mockFs.restore();
	});

	describe("with no root", function() {
		it("should explode", function() {
			assert.throws(serveJsonDir, TypeError);
		});
	});
	describe("with root", function() {
		describe("that doesn't exist", function() {
			it("should return a middleware", function() {
				assert.throws(serveJsonDir.bind(undefined, "/doesntexist"), TypeError);
			});
		});
		describe("that does exist", function() {
			it("should return a middleware", function() {
				assert(typeof serveJsonDir("dir") === "function");
			});
		});
	});
	describe("middleware", function() {
		var middleware;

		beforeEach(function() {
			middleware = serveJsonDir("dir");
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
			it("should return JSON describing the folder", function(done) {
				var req = mockRequest("GET", "/", null);
				var res = mockResponse();
				res.on("finish", function() {
					assert.equal("[{\"name\":\"folder\",\"type\":\"directory\"},{\"name\":\"the answer.txt\",\"type\":\"file\"}]", res.output);
					done();
				});
				middleware(req, res);
			});
			describe("with file request", function() {
				it("should call next", function(done) {
					var req = { method: "GET", url: "the answer.txt" };
					var res = {};
					middleware(req, res, done);
				});
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
	res.output = "";
	res._write = function(chunk, encoding, callback) { // jshint ignore:line
		res.output += chunk;
		callback();
	};
	return res;
}
