"use strict";

shekelApp.controller('ShekelToolTipsController', function($scope, $http) {
	
	
	$scope.getToolTip = function(tipId) {
		for (var i = 0; i < $scope.infoToolTips.length; i++) {
    			if ( tipId == $scope.infoToolTips[i].tipId ) { 
    				return $scope.infoToolTips[i].msg
    			} 
		}
	};
	
    $scope.loadToolTips = function() {
    	$http.get('/js/data/tooltip_string_data.json')
    		.success(function(data) { 
    			$scope.infoToolTips = data;
    		}).error(function(data) { 
    			alert("Failed to get TooTip json template");
    		});
    };
    
	$scope.loadToolTips();
});