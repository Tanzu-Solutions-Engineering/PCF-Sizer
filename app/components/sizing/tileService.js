var tileService = shekelApp.factory('tileService', function ($rootScope) {
    var tileService = {
        tiles: new Array(),
        addTile: function(name, version, vms) {
            this.tiles.push({ name: name, version: version, vms: vms})
        },
        removeTile: function(name) {
            for(var idx=0; idx < this.tiles.length; idx++) {
                if ( this.tiles[idx].name == name) {
                    this.tiles.splice(idx, 1);
                    return;
                }
            }
        }
    };

    return tileService;
});
