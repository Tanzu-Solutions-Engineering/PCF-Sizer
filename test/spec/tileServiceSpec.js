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

        describe('disable tiles', function() {
            beforeEach(function() {
                tileService.addTile('foo', '1.0', [{},{}]);
                tileService.getTile('foo').enabled = true;
                tileService.addTile('bar', '1.0', [{},{}]);
                tileService.getTile('bar').enabled = true;
                expect(tileService.tiles.length).toBe(2);
            });

            it('should disable the tile', function() {
                tileService.disableTile('foo');
                expect(tileService.tiles.length).toBe(2);
                expect(tileService.getTile('foo').enabled).toBeFalsy();
                expect(tileService.getTile('bar').enabled).toBeTruthy();
            });
        });

        describe('Getting tiles', function() {
            it('should get a tile by name', function() {
                tileService.addTile('bar', '1.0', [{},{}]);
                expect(tileService.getTile('bar').name).toBe("bar");
            });

            it('should return undefined when we ask for a name it does not have', function() {
                expect(tileService.getTile("nada")).toBeUndefined();
            });

            it('should not have a current confg when its added', function () {
                tileService.addTile('foo', '1.0', [{},{}]);
                expect(tileService.getTile('foo').currentConfig).toBeUndefined();
            });
        });


        describe('vm type detection', function() {
            var dea = { vm: "DEA" };
            var cell = { vm: "Diego Cell" };
            var router = {vm: "Router"};
            var compilation = {vm: "Compilation"};

            it('should detect a cell', function () {
                expect(tileService.isRunnerVM(cell, '1.6' )).toBeTruthy();
            });

            it('should not detect a dea in 1.6', function() {
                expect(tileService.isRunnerVM(dea, '1.6' )).toBeFalsy();
            });

            it('should not detect a router', function () {
                expect(tileService.isRunnerVM(router)).toBeFalsy();
            });

            it('should detect a compilation vm', function () {
                expect(tileService.isCompilationVM(compilation)).toBeTruthy();
            });

            it('should not detect a router as a compilation vm', function () {
                expect(tileService.isCompilationVM(router)).toBeFalsy();
            });
        });
        
        describe('defaults', function() {
            it('should disable tiles by default', function () {
                tileService.addTile('foo', '1.0', [{},{}]);
                expect(tileService.getTile('foo').enabled).toBeFalsy();
            });
        });
        
        describe('enabling tiles', function() {
            it('enables a tile when I ask it too', function () {
                tileService.addTile('foo', '1.0', [{}]);
                tileService.enableTile('foo');
                expect(tileService.getTile('foo').enabled).toBeTruthy();
            });
        });
    })
})();