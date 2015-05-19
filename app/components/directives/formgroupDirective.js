shekelApp.directive('shklFormGroup', function () {
    return {
        scope: {
            label: '@label',
            value: '@value',
            //id: "@generated_value" TODO Need to come up with a way to generate ID's so we don't break screen reades
        },
        restrict: 'E',
        templateUrl: '/app/components/directives/formgroup.html'
    };
});