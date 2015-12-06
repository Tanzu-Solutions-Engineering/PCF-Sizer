var elasticRuntime = shekelApp.factory('elasticRuntime', function (aiService) {

    var ers = {
        config: {
            runnerRAM: 16,
            runnerDisk: 64,
            azCount: 3,
            extraRunnersPerAZ: 1,
            avgAIRAM: 1,
            avgAIDisk:.5
        },
        runnerUsableRAM: function () {
            return this.config.runnerRAM - 3;
        },
        runnerUsableStager: function() {
            return this.config.runnerDisk - this.config.runnerRAM - 4;
        },
        numRunnersToRunAIs: function() {
            var aiCount = aiService.getAiCount();
            var totalRam = (aiCount * this.config.avgAIRAM);
            var totalStg = (aiCount * this.config.avgAIDisk);
            var runnerRAM = (totalRam / this.runnerUsableRAM());
            var runnerStager = (totalStg / this.runnerUsableStager());

            return roundUp(Math.max(runnerRAM, runnerStager));
        },
        numRunnersPerAz: function() {
            var azRunners = this.numRunnersToRunAIs() / this.config.azCount;
            return roundUp(azRunners) + this.config.extraRunnersPerAZ;
        },
        totalRunners: function() {
            return this.numRunnersPerAz() * this.config.azCount;
        }
};

    return ers;
});