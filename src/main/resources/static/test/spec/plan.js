(function() {

    var createController;

    beforeEach(module('ShekelApp'));

    beforeEach(inject(function($injector) {
        $rootScope = $injector.get('$rootScope');
        var $controller = $injector.get('$controller');

        createController = function () {
            return $controller('ShekelPlanController', {'$scope': $rootScope});
        };
    }));
});