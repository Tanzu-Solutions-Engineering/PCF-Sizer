var request = require('request');
var app = require ("../../../app.js");

describe("ServicesAPI", function () {
    describe("GET /services", function() {
        it("returns status code 200", function(done) {
            request.get("http://localhost:3000/services",
                function(error, response, body) {
                    expect(response.statusCode).toBe(200);
                    done();
                });
        });

        it("returns a json array", function(done) {
            request.get("http://localhost:3000/services",
                function(error, response, body) {
                    expect(response.headers['content-type']).toMatch(/json/)
                    expect(Array.isArray(JSON.parse(body))).toBeTruthy();
                    done();
                });
        });

    });
});
