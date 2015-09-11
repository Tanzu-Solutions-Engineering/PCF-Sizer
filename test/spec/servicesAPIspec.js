/*global describe, it */
'use strict';
require('app.js');

(function () {
    describe('ServicesAPI', function () {

        var sandbox;
        var app = express();

        beforeEach(function(done) {
            sandbox = sinon.sandbox.create();

            done();
        });

        afterEach(function(done) {
            sandbox.restore();
            done();
        });

        it("Should return the versions", function () {
            fail("NYI");
        });

        it("Should return 404 for unknown service", function () {
            sandbox.stub(fs, 'readdir', function(path, callback) {
                callback(null, []);
            });

            request(app).get('/services/garbage/versions')
                .expect(404)
        });

    });
})();
