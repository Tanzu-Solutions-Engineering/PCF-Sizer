var tileService = shekelApp.factory('tileService', function () {

    var tileService = {
        //Lots of things look for the ERS, and we display the string (which is probly wrong to do)... make it east
        ersName: 'Elastic Runtime',
        tiles: new Array(),

        addTile: function(name, version, template) {
            var idx = this.getIndexOfTile(name);
            var initial = {
                name: name,
                version: version,
                template: template,
                enabled: false
            };
            if ( -1 == idx ) {
                this.tiles.push(initial);
            }
        },
        disableTile: function(name) {
            var tile = this.getTile(name);
            tile.enabled = false;
            tile.currentConfig = undefined;
        },
        enableTile: function(name) {
            this.getTile(name).enabled = true;
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
        },
        isRunnerVM: function(vm) {
            return vm.vm == "Diego Cell";
        },
        isCompilationVM: function(vm) {
            return vm.vm == "Compilation";
        }
    };

    return tileService;
});
