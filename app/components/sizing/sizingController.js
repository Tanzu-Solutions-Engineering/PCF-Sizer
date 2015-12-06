"use strict";

shekelApp.controller('ShekelSizingController', function($scope, $http, tileService, aiService,
                                                        iaasService, elasticRuntime)
{

    $scope.aiPackOptions = new Array();
    
    $scope.setAIPackOptions = function() {
    	for ( var i = 1; i <= 300; ++i) {
    		$scope.aiPackOptions.push({ label: i + " ("+i*50+")", value: i});
    	}
    };
    
    $scope.setAIPackOptions();
               
    $scope.aiPacks = function(pack) { 
    	if (angular.isDefined(pack)) {
    		aiService.setAiPack(pack);
    	}
		return aiService.aiPacks();	
    };
    
    aiService.setAiPack($scope.aiPackOptions[0]);

	/**
	 * When adding a new ERS version, ADD IT TO THE TOP OF THE LIST as the
	 * code defaults to index 0, which should always return the latest
	 * version
	 */
	$scope.ersVersionOptions = [
        {value: 1.6}
	];

    $scope.avgRamOptions = [ 
	    { value: .5 },
	    { value: 1  },
	    { value: 1.5},
	    { value: 2  },
	    { value: 2.5},
	    { value: 3  },
	    { value: 4  },
	    { value: 6  },
	    { value: 10 },
	    { value: 20 }
	]; 

    $scope.runnerSizeOptions = [
	     {"text": "Small (16GB RAM)",     "size":16},
	     {"text": "Medium (32GB RAM)",    "size":32},
	     {"text": "Large (64GB RAM)",     "size":64},
	     {"text": "Bad idea (128GB RAM)", "size":128}
	 ];
    
    $scope.runnerSizeOptionsDisk =  [
         {"text": "Small (32GB)",    "size":32}, 
         {"text": "Medium (64GB)",   "size":64},
         {"text": "Large (128GB)",   "size":128},
         {"text": "Crazy (256GB)",   "size":256}
    ];
    
    $scope.avgAIDiskOptions = [ 
        { value: .5  },
	    { value: 1  },
	    { value: 2  },
	    { value: 4  },
	    { value: 8  }
    ];
    
    $scope.pcfCompilationJobsOptions = [ 
        { value: 0  },                           	
        { value: 1  },
        { value: 2  },
        { value: 3  },
        { value: 4  },
        { value: 5  },
        { value: 6  },
        { value: 7  },
        { value: 8  },
        { value: 9  },
        { value: 10  }
    ];


    $scope.iaasCPUtoCoreRatioOptions = [
        {"text": "2:1", "ratio":2},
        {"text": "4:1", "ratio":4},
        {"text": "8:1", "ratio":8}
    ];
    
    $scope.platformConfigMapping = {
		ersVersion: $scope.ersVersionOptions[0],
    	avgRam: $scope.avgRamOptions[1],
    	avgAIDisk:  $scope.avgAIDiskOptions[0],
    	runnerSize: $scope.runnerSizeOptions[0],
    	runnerSizeDisk: $scope.runnerSizeOptionsDisk[1],
    	nPlusX: 1,
    	pcfCompilationJobs: $scope.pcfCompilationJobsOptions[4],
    	iaasCPUtoCoreRatio: $scope.iaasCPUtoCoreRatioOptions[1]
    };

    $scope.aZRecoveryCapacity = [25, 50, 100];

    $scope.chooser = { aiHelpMeChoose: false };

    $scope.aiChooser = { 
    	apps: 1,
    	devs: 1,
    	steps: 1
    };

    $scope.elasticRuntime = elasticRuntime;
    $scope.elasticRuntimeConfig = elasticRuntime.config;
       
	// This is the app instances formula. for "help me choose"
    $scope.ais = function() {  
    	var totalAis = $scope.aiChooser.apps 
    			* $scope.aiChooser.devs 
    			* $scope.aiChooser.steps;
    	var packs = (totalAis /  50) + 1;
    	return parseInt(packs);
    };
        
    $scope.setAis = function() { 
    	$scope.aiPacks($scope.aiPackOptions[$scope.ais() - 1]);
    };

    // TODO DRY w/ costing directives
    $scope.roundUp = function(x) {  
    	var totalX;
	    if (x == Math.round(x)) { 
			totalX = x;
		} else  { 
			totalX = parseInt(x) +1;
		}
	    return totalX;
    };
    
    /**
     * Diego Cell Calculator
     */
    $scope.numRunnersToRunAIs = function() {
    	var aipacks = 50;
    	if (null != $scope.aiPacks()) { 
    		aipacks = $scope.aiPacks().value * 50;
    	}

    	var totalRam = (aipacks * $scope.platformConfigMapping.avgRam.value);
    	var totalStg = (aipacks * $scope.platformConfigMapping.avgAIDisk.value);
    	    	
    	var runnerRAM = (totalRam / elasticRuntime.runnerUsableRAM());
    	var runnerStager = (totalStg / elasticRuntime.runnerUsableStager());

    	return $scope.roundUp(Math.max(runnerRAM, runnerStager));
    };
    
    $scope.runnersPerAz = function() {
    	var azRunners = $scope.numRunnersToRunAIs() / elasticRuntime.config.azCount;
    	return $scope.roundUp(azRunners) + $scope.platformConfigMapping.nPlusX;
    };
    
    $scope.totalRunners = function() {
    	return $scope.runnersPerAz() * elasticRuntime.config.azCount;
    };
    
	$scope.getVms = function() { return tileService.tiles; };
    
    
    $scope.getPhysicalCores = function() { 
    	return $scope.roundUp(
            iaasService.iaasAskSummary.vcpu / $scope.platformConfigMapping.iaasCPUtoCoreRatio.ratio);
    };

    $scope.iaasAskSummary = function() {
        return iaasService.iaasAskSummary;
    };

    $scope.calculateAIDiskAsk = function(AIAvgDiskSizeInGB, NumAIPacks) {
        return AIAvgDiskSizeInGB * NumAIPacks * 50;
    };

    //This is the main calculator. We do all the per vm stuff and add the 
    //constants at the bottom.  <--iaasAskSummary-->
    $scope.applyTemplate = function() {
        iaasService.resetIaaSAsk();

        tileService.tiles.forEach(function (tile) {
            var template = tile.template;
            var vmLayout = new Array();
            tile.currentConfig = vmLayout;
            for (var i = 0; i < template.length; i++) {
                var vm = {};
                angular.extend(vm, template[i]);
                if ( !vm.singleton ) {
                    if ( tileService.isRunnerVM(vm)) {
                        vm.instances = $scope.totalRunners();
                        vm.ram = $scope.platformConfigMapping.runnerSize.size;
                        vm.ephemeral_disk = $scope.platformConfigMapping.runnerSizeDisk.size;
                    } else {
                        vm.instances = vm.instances * elasticRuntime.config.azCount;
                    }
                }
                if ( tileService.isCompilationVM(vm)){
                    vm.instances = $scope.platformConfigMapping.pcfCompilationJobs.value;
                }
                iaasService.doIaasAskForVM(vm);
                vmLayout.push(vm);
            }
        });
        iaasService.addRunnerDisk($scope.platformConfigMapping.avgAIDisk.value, $scope.aiPacks().value);
    };
    
    $scope.loadAzTemplate = function() {
    	return $http.get('/ersjson/' + $scope.platformConfigMapping.ersVersion.value)
    		.success(function(data) {
				tileService.addTile(tileService.ersName, $scope.platformConfigMapping.ersVersion.value, data);
                $scope.applyTemplate(tileService.getTile(tileService.ersName).template);
    		}).error(function(data) { 
    			alert("Failed to get PCF AZ Template json template");
    		});
    };
    
	$scope.loadAzTemplate();
	
	//Watch for Non ng-select input changes
	[
	 'elasticRuntime.config.azCount',
	 'platformConfigMapping.nPlusX'
	].forEach(function(e,l,a) {
		$scope.$watch(e, function() { 
            $scope.dropDownTriggerSizing()
		});
	});
	
	$scope.dropDownTriggerSizing = function () {
        $scope.applyTemplate();
        elasticRuntime.config.runnerDisk = $scope.platformConfigMapping.runnerSizeDisk.size;
        elasticRuntime.config.runnerRAM = $scope.platformConfigMapping.runnerSize.size;
	};
	
});