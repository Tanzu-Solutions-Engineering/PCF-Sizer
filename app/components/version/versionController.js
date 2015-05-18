shekelApp.controller('ShekelVersionController', function($scope, $http) {

	$scope.version = null; 
	
	$scope.getVersion = function() {
		$http.get('/buildnumber').success(function(data) {
			$scope.version = data.application_name;
		});
	};
	
	$scope.getVersion();
});