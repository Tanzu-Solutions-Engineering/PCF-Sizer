'use strict';

(function() {
    describe('iaasService', function() {
        var iaasService

        beforeEach(module('ShekelApp'));

        beforeEach(inject(function($injector) {
            iaasService = $injector.get('iaasService');
        }));

        describe('resetIaaSAsk', function() {
            it('sets them all to one', function () {
                iaasService.iaasAskSummary.disk = 10;
                iaasService.iaasAskSummary.ram = 10;
                iaasService.iaasAskSummary.vcpu = 10;
                iaasService.resetIaaSAsk();

                expect(iaasService.iaasAskSummary.disk).toEqual(1);
                expect(iaasService.iaasAskSummary.ram).toEqual(1);
                expect(iaasService.iaasAskSummary.ram).toEqual(1);
            });
        });

    });
})();