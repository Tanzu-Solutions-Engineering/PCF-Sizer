'use strict';

(function() {
    describe('elasticRuntimeService', function() {
        var elasticRuntime, aiService;

        beforeEach(module('ShekelApp'));

        beforeEach(inject(function ($injector) {
            elasticRuntime = $injector.get('elasticRuntime');
            aiService = $injector.get('aiService');
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

            it('should set extraRunnersPerAZ to one', function () {
                expect(elasticRuntime.config.extraRunnersPerAZ).toBe(1);
            });

            it('should default to 1 gb average ai ram', function () {
                expect(elasticRuntime.config.avgAIRAM).toBe(1);
            });

            it('should default to 1 gb avg ai disk', function () {
                expect(elasticRuntime.config.avgAIDisk).toBe(.5);
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

        describe('numRunnersToRunAIs', function() {
            it('should need 5 to run one ai pack at one gig', function () {
                aiService.setAiPack(1);
                expect(elasticRuntime.numRunnersToRunAIs()).toBe(4);
            });
        });

        describe('numRunnersPerAz', function() {
            it('spits the runners evenly across az', function () {
                elasticRuntime.config.azCount = 2;
                elasticRuntime.numRunnersToRunAIs = function() {
                    return 2;
                };
                expect(elasticRuntime.numRunnersPerAz()).toBe(2);
            });
        });

        describe('total runners', function() {
            it('should be the number of runners in each az times the number of azs', function () {
                elasticRuntime.config.azCount = 2;
                elasticRuntime.numRunnersPerAz = function() {
                    return 10;
                };

                expect(elasticRuntime.totalRunners()).toBe(20);
            });
        });

    });
})();