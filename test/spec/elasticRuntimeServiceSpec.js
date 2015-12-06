'use strict';

(function() {
    describe('elasticRuntimeService', function() {
        var elasticRuntime;

        beforeEach(module('ShekelApp'));

        beforeEach(inject(function ($injector) {
            elasticRuntime = $injector.get('elasticRuntime');
        }));

        describe('defaults', function() {
            it('should default to 16 gig ram', function () {
                expect(elasticRuntime.config.runnerRAM).toBe(16);
            });

            it('should default to 64 gig of disk', function () {
                expect(elasticRuntime.config.runnerDisk).toBe(64);
            });

            it('should have 3 azs', function () {
                expect(elasticRuntime.config.azCount).toBe(3);
            });
        });

        describe('usable resource calculations', function() {
            beforeEach(function () {
                elasticRuntime.config.runnerRAM = 10;
                elasticRuntime.config.runnerDisk = 100;
            });

            describe('runnerUsableRAM', function() {

                it('should calculate total ram size - 3 gb', function () {
                    expect(elasticRuntime.runnerUsableRAM()).toBe(7);
                });
            });

            describe('runnerUsableStagers', function() {
                it('should calculate total stagers by disk size - ram size -4', function () {
                    expect(elasticRuntime.runnerUsableStager()).toBe(86);
                });
            });
        });
    });
})();