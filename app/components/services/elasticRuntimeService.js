var elasticRuntime = shekelApp.factory('elasticRuntime', function () {

    var ers = {
        config: {
            runnerRAM: 16,
            runnerDisk: 64,
            azCount: 3
        },
        runnerUsableRAM: function () {
            return this.config.runnerRAM - 3;
        },
        runnerUsableStager: function() {
            return this.config.runnerDisk - this.config.runnerRAM - 4;
        }
    };

    return ers;
});