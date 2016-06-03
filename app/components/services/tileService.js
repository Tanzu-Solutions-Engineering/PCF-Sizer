var tileService = shekelApp.factory('tileService', function () {
    var tileService = {
        //Lots of things look for the ERS, and we display the string (which is probly wrong to do)... make it east
        ersName: 'Elastic Runtime',
        config: {
            runnerRAM: 16,
            runnerDisk: 64,
            azCount: 3,
            extraRunnersPerAZ: 1,
            avgAIRAM: 1,
            avgAIDisk: .5,
            compilationJobs: 4
        },
        runnerUsableRAM: function () {
            return this.config.runnerRAM - 3;
        },
        runnerUsableStorage: function () {
            // the 4 accounts for overhead. ram is the size of swap
            return this.config.runnerDisk - this.config.runnerRAM - 4;
        },
        numRunnersToRunAIs: function () {
            var aiCount = iaasService.getAiCount();
            var totalRam = (aiCount * this.config.avgAIRAM);
            var totalStg = (aiCount * this.config.avgAIDisk);
            var runnerRAM = (totalRam / this.runnerUsableRAM());
            var runnerStorage = (totalStg / this.runnerUsableStorage());

            return roundUp(Math.max(runnerRAM, runnerStorage));
        },
        numRunnersPerAz: function () {
            var azRunners = this.numRunnersToRunAIs() / this.config.azCount;
            // console.log("NumRunners Per AZ: " + (roundUp(azRunners) + this.config.extraRunnersPerAZ));
            return roundUp(azRunners) + this.config.extraRunnersPerAZ;
        },
        totalRunners: function () {
            return this.numRunnersPerAz() * this.config.azCount;
        },

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
            } else {
                //this.tiles.splice(idx, initial );
                this.tiles.splice(idx,1,initial);
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
        },

        // For all Tiles, applyTemplate
        applyTemplate: function (fixedSize) {
            var t = this;
            tileService.tiles.forEach(function (tile) {
                applyTileTemplate(tile.name,fixedSize)
            });
        },

// Apply Template for a specific Tile
        applyTileTemplate: function (name,fixedSize,iaaS) {
            var t = this;
            var tile = t.getTile(name);
            if (!tile.enabled) {
                return;
            }
            var vmLayout = [];
            tile.currentConfig = vmLayout;
            for (var i = 0; i < tile.template.length; i++) {
                var vm = {};
                angular.extend(vm, tile.template[i]);
                if (vm.tshirt == "all" || vm.tshirt == fixedSize) { // if the VM is for all sizes or for selected Size
                  if (!vm.singleton) {
                      if (tileService.isRunnerVM(vm)) {
                          vm.instances = t.totalRunners();
                          vm.ram = t.config.runnerRAM;
                          vm.ephemeral_disk = t.config.runnerDisk;
                      } else {
                          vm.instances = vm.instances * t.config.azCount;
                      }
                  }
                  if (tileService.isCompilationVM(vm)) {
                      vm.instances = t.config.compilationJobs;
                  }
                  iaasService.doIaasAskForVM(vm);
                  vmLayout.push(vm);
                }
            }
        }
    };

    return tileService;
});
