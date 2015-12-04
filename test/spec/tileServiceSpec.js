'use strict';

(function() {
    describe('planservice', function() {
        var tileService;
        beforeEach(module('ShekelApp'));

        beforeEach(inject(function($injector) {
            tileService = $injector.get('tileService');
            expect(tileService.tiles.length).toBe(0);
        }));

        describe('Adding tiles', function() {
            it('should add one to the list of tiles', function() {
                tileService.addTile('foo', '1.0', [{},{}]);
                expect(tileService.tiles.length).toBe(1);
            });

            it('should not add duplicates', function() {
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
        });

        describe('Getting tiles', function() {
            it('should get a tile by name', function() {
                tileService.addTile('foo', '1.0', [{},{}]);
                tileService.addTile('bar', '1.0', [{},{}]);
                expect(tileService.getTile('bar').name).toBe("bar");
            });

            it('should return undefined when we ask for a name it does not have', function() {
                tileService.addTile('foo', '1.0', [{},{}]);
                expect(tileService.getTile("nada")).toBeUndefined();
            })
        })


    })
})();