'use strict';

(function() {
    describe('iaasService', function() {

        var iaasService;

        beforeEach(module('ShekelApp'));

        beforeEach(inject(function($injector) {
            iaasService = $injector.get('iaasService');
        }));

        it('returns the right number of for one pack', function () {
            iaasService.setAiPacks(1);
            expect(iaasService.getAiCount()).toBe(50);
        });

        it('reutnrs the right number of ais for 10 packs', function() {
            iaasService.setAiPacks(10);
            expect(iaasService.getAiCount()).toBe(500);
        });


    });
})();
