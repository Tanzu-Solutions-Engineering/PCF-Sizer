"use strict";

shekelApp.controller('ShekelRequirementsController', ['$scope','uiGridConstants', '$http', function ($scope, uiGridConstants, $http) {


  var data = [];

$scope.requirementsData = {
    enableGridMenu: true,
    exporterMenuCsv: true,
    showGridFooter: true,
    showColumnFooter: true,
    enableSorting: true,
    enableFiltering: true,
    paginationPageSizes: [25, 50, 75],
    paginationPageSize: 25,
    enableCellEditOnFocus: true, //enables the editor on a single click, if you use enableCellEdit: true you would have to doubleclick

    columnDefs: [
        { field: 'Id', width: '5%' , enableFiltering: false,
          editableCellTemplate: '<input type="number" ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD" />' 
      },
        { field: 'Title', cellTooltip: true, headerTooltip: true, width: '20%',enableFiltering: false },
        { field: 'Tasks', enableCellEdit: true, cellTooltip: true, headerTooltip: true, width: '50%' , enableFiltering: false,
              editableCellTemplate: '<textarea style="width:100%" ng-class="\'colt\' + col.index" ng-input="COL_FIELD" ng-model="COL_FIELD"></textarea>'},
        { name: 'Labels', field: 'Labels', width: '10%',enableFiltering: true},
        { name: 'Environments', field: 'Environments', width: '15%',enableFiltering: true}
  ],
    data: data,
    rowHeight: 70,
    onRegisterApi: function(gridApi) {
            $scope.gridApi = gridApi;
    }
};

$scope.toggleFooter = function() {
  $scope.requirementsData.showGridFooter = !$scope.requirementsData.showGridFooter;
  $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);
};

$scope.toggleColumnFooter = function() {
  $scope.requirementsData.showColumnFooter = !$scope.requirementsData.showColumnFooter;
  $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.OPTIONS);
};



$http.get('/requirements/' + $scope.platform.ersVersion.value)
  .success(function(data) {
    data.forEach( function(row) {
      row.registered = Date.parse(row.registered);
    });
    $scope.requirementsData.data = data;
  });
}]);
