"use strict";

shekelApp.controller('ShekelSizingController', function($scope, $http, tileService, aiService, iaasService) {

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
    
    $scope.platform = {
		ersVersion: $scope.ersVersionOptions[0],
    	avgRam: $scope.avgRamOptions[1],
    	avgAIDisk:  $scope.avgAIDiskOptions[0],
    	runnerSize: $scope.runnerSizeOptions[0],
    	runnerSizeDisk: $scope.runnerSizeOptionsDisk[1],
        numAZ: 3,
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

    //This function needs no update for diego as we use the same
    //logic for determining cell size
    $scope.runnerUsableRAM = function() {
    	return $scope.platform.runnerSize.size - 3;
    };

    //This function gets no update for diego as we use the same
    //logic for determining cell size. TODO Is that the correct thing to do.
    $scope.runnerUsableStg = function() {
    	return $scope.platform.runnerSizeDisk.size - $scope.platform.runnerSize.size - 4;
    
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

    	var totalRam = (aipacks * $scope.platform.avgRam.value);
    	var totalStg = (aipacks * $scope.platform.avgAIDisk.value);
    	    	
    	var runnerRAM = (totalRam / $scope.runnerUsableRAM());
    	var runnerStager = (totalStg / $scope.runnerUsableStg());

    	return $scope.roundUp(Math.max(runnerRAM, runnerStager));
    };
    
    $scope.runnersPerAz = function() {
    	var azRunners = $scope.numRunnersToRunAIs() / $scope.platform.numAZ;
    	return $scope.roundUp(azRunners) + $scope.platform.nPlusX;
    };
    
    $scope.totalRunners = function() {
    	return $scope.runnersPerAz() * $scope.platform.numAZ;
    };
    
	$scope.getVms = function() { return tileService.tiles; };
    
    
    $scope.getPhysicalCores = function() { 
    	return $scope.roundUp(
            iaasService.iaasAskSummary.vcpu / $scope.platform.iaasCPUtoCoreRatio.ratio);
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
                        vm.ram = $scope.platform.runnerSize.size;
                        vm.ephemeral_disk = $scope.platform.runnerSizeDisk.size;
                    } else {
                        vm.instances = vm.instances * $scope.platform.numAZ;
                    }
                }
                if ( tileService.isCompilationVM(vm)){
                    vm.instances = $scope.platform.pcfCompilationJobs.value;
                }
                iaasService.doIaasAskForVM(vm);
                vmLayout.push(vm);
            }
        });
        iaasService.addRunnerDisk($scope.platform.avgAIDisk.value, $scope.aiPacks().value);
    };
    
    $scope.loadAzTemplate = function() {
    	return $http.get('/ersjson/' + $scope.platform.ersVersion.value)
    		.success(function(data) {
				tileService.addTile(tileService.ersName, $scope.platform.ersVersion.value, data);
                $scope.applyTemplate(tileService.getTile(tileService.ersName).template);
    		}).error(function(data) { 
    			alert("Failed to get PCF AZ Template json template");
    		});
    };
    
	$scope.loadAzTemplate();
	
	//Watch for Non ng-select input changes
	[
	 'platform.numAZ',
	 'platform.nPlusX'
	].forEach(function(e,l,a) {
		$scope.$watch(e, function() { 
            $scope.dropDownTriggerSizing()
		});
	});
	
	$scope.dropDownTriggerSizing = function () {
        $scope.applyTemplate();
	};
	
});