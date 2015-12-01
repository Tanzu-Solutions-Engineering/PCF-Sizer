var request = require('request');
var rewire = require('rewire')
var app = rewire ("../../../app.js");

describe("ServicesAPI", function () {
    var serviceURL = 'http://localhost:3000/services';

    describe("GET /services", function() {
        it("returns status code 200", function(done) {
            request.get(serviceURL, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });

        it("returns a json array", function(done) {
            request.get(serviceURL, function(error, response, body) {
                expect(response.headers['content-type']).toMatch(/json/)
                expect(Array.isArray(JSON.parse(body))).toBeTruthy();
                done();
            });
        });

        it("returns mysql and rabbit", function(done) {

            var globMock = {
                sync: function(path) {
                    expect(path).toBe("js/data/services/*.json")
                    return "";
                }
            };

            app.__set__("glob", globMock);

            request.get(serviceURL, function(error, response, body) {
                var j = JSON.parse(body);
                expect(j).toContain("mysql");
                expect(j).toContain("rabbit");
                expect(j).toContain("gemfire");
                done();
            });

        });

    });
});
