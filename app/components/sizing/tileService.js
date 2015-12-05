var tileService = shekelApp.factory('tileService', function () {
    var tileService = {
        //Lots of things look for the ERS, and we display the string (which is probly wrong to do)... make it east
        ersName: 'Elastic Runtime',
        tiles: new Array(),

        addTile: function(name, version, template) {
            var idx = this.getIndexOfTile(name);
            if ( -1 == idx ) {
                this.tiles.push({ name: name, version: version, template: template})
            } else {
                this.tiles.splice(idx, { name: name, version: version, template: template} )
            }
        },
        removeTile: function(name) {
            var idx = this.getIndexOfTile(name);
            if ( -1 != idx ) {
                this.tiles.splice(idx, 1);
            }
        },
        getIndexOfTile: function(name) {
            for(var idx=0; idx < this.tiles.length; idx++) {
                if ( this.tiles[idx].name == name) {
                    return idx
                }
            }
            return -1;
        },
        getTile: function (name) {
            return this.tiles[this.getIndexOfTile(name)];
        }

    };

    return tileService;
});
