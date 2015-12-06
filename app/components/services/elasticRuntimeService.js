var elasticRuntime = shekelApp.factory('elasticRuntime',
    function (aiService, iaasService, tileService) {

    var ers = {
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
        runnerUsableStager: function () {
            return this.config.runnerDisk - this.config.runnerRAM - 4;
        },
        numRunnersToRunAIs: function () {
            var aiCount = aiService.getAiCount();
            var totalRam = (aiCount * this.config.avgAIRAM);
            var totalStg = (aiCount * this.config.avgAIDisk);
            var runnerRAM = (totalRam / this.runnerUsableRAM());
            var runnerStager = (totalStg / this.runnerUsableStager());

            return roundUp(Math.max(runnerRAM, runnerStager));
        },
        numRunnersPerAz: function () {
            var azRunners = this.numRunnersToRunAIs() / this.config.azCount;
            return roundUp(azRunners) + this.config.extraRunnersPerAZ;
        },
        totalRunners: function () {
            return this.numRunnersPerAz() * this.config.azCount;
        },
        //This is the main calculator. We do all the per vm stuff and add the
        //constants at the bottom.  <--iaasAskSummary-->
        //TODO Move this to tileService...
        applyTemplate: function () {
            iaasService.resetIaaSAsk();
            var t = this;
            tileService.tiles.forEach(function (tile) {
                if (!tile.enabled) {
                    return;
                }
                var vmLayout = new Array();
                tile.currentConfig = vmLayout;
                for (var i = 0; i < tile.template.length; i++) {
                    var vm = {};
                    angular.extend(vm, tile.template[i]);
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
            });
            iaasService.addRunnerDisk(this.config.avgAIDisk, aiService.aiPacks());
        }
    };

    return ers;
});