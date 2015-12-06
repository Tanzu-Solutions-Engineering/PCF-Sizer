'use strict';

(function() {
    describe('aiService', function() {

        var aiService;

        beforeEach(module('ShekelApp'));

        beforeEach(inject(function($injector) {
            aiService = $injector.get('aiService');
        }));

        it('returns the right number of for one pack', function () {
            aiService.setAiPack(1);
            expect(aiService.getAiCount()).toBe(50);
        });

        it('reutnrs the right number of ais for 10 packs', function() {
            aiService.setAiPack(10);
            expect(aiService.getAiCount()).toBe(500);
        });


    });
})();