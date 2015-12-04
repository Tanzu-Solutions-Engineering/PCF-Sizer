'use strict';

(function() {
    describe('planservice', function() {
        var tileService;
        beforeEach(module('ShekelApp'));

        beforeEach(inject(function($injector) {
            tileService = $injector.get('tileService');

        }));

        describe('Adding tiles', function() {
            it('should add one to the list of tiles', function() {
                expect(tileService.tiles.length).toBe(0);
                tileService.addTile('foo', '1.0', [{},{}]);
                expect(tileService.tiles.length).toBe(1);
            });
        });

        describe('Removing tiles', function() {
            beforeEach(function() {
                tileService.addTile('foo', '1.0', [{},{}]);
                expect(tileService.tiles.length).toBe(1);
            });

            it('should remove one from the list of tiles', function() {
                tileService.removeTile('foo');
                expect(tileService.tiles.length).toBe(0);
            });
        })
    })
})();