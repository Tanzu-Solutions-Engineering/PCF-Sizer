shekelApp.controller('ShekelVersionController', function($scope, $http) {

	$scope.version = $scope.getVersion(); 
	
	$scope.getVersion = function() {
		$http.get('/buildnumber').success(function(data) {
			$scope.version = data.application_name;
		});
	};
	
	$scope.getVersion();
});