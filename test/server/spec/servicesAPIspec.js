var request = require('request');
var rewire = require('rewire')
var app = rewire ("../../../app.js");

describe("ServicesAPI", function () {
    describe("GET /services", function() {
        var serviceURL = 'http://localhost:3000/services';

        beforeEach(function() {
            var globMock = {
                sync: function(path) {
                    expect(path).toBe("js/data/services/*.json")
                    return ['js/data/services/mysql-1.5.json',
                        'js/data/services/gemfire-1.0.json',
                        'js/data/services/rabbit-5.1.json'];
                }
            };
            app.__set__("glob", globMock);
        });

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
            request.get(serviceURL, function(error, response, body) {
                var j = JSON.parse(body);
                expect(j).toContain("mysql");
                expect(j).toContain("rabbit");
                expect(j).toContain("gemfire");
                done();
            });

        });

    });

    describe("GET /service/:service/versions", function() {
        var versionsURL = 'http://localhost:3000/services/mysql/versions';

        beforeEach(function() {
            var globMock = {
                sync: function(path) {
                    expect(path).toBe("js/data/services/mysql-*.json");
                    return ['mysql-1.5.json', 'mysql-1.4.json'];
                }
            };
            app.__set__("glob", globMock);
        });

        it("returns a json array", function(done) {
            request.get(versionsURL, function(error, response, body) {
                expect(response.headers['content-type']).toMatch(/json/)
                expect(Array.isArray(JSON.parse(body))).toBeTruthy();
                done();
            });
        });

        it("returns two mysql versions", function(done) {
            request.get(versionsURL, function(error, response, body) {
                expect(response.headers['content-type']).toMatch(/json/)
                var mysqlVersions = JSON.parse(body);
                expect(mysqlVersions).toContain('1.5');
                expect(mysqlVersions).toContain('1.4');
                expect(mysqlVersions.length).toBe(2)
                done();
            });
        });
    });
});
