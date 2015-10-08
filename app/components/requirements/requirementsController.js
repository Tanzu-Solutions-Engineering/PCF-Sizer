"use strict";


shekelApp.controller('ShekelRequirementsController', ['$scope','uiGridConstants', '$http', function ($scope, uiGridConstants, $http) {

  $scope.template = {
    availableOptions : [
      {name: "vSphere + ER", id:'1'},
      {name: "vSphere + ER + MySQL", id:'2'},
      {name: "vSphere + ER + MySQL + RabbitMQ", id:'3'},
      {name: "vSphere + ER + MySQL + RabbitMQ + Redis", id:'4'},
      {name: "vSphere + ER + MySQL + RabbitMQ + Redis + Spring Cloud Services", id:'5'},
      {name: "vSphere + ER + MySQL + RabbitMQ + Redis + Spring Cloud Services + Mobile Services", id:'6'}
    ],
    selectedOption: {id: '1', name: "vSphere + ER"}
  };

   $scope.type = "template";
   $scope.selectedCustomer = undefined;

   $scope.customer = {
    availableOptions: [
      {name: "FORD", id:'1', password:"FORD"},
      {name: "GM", id:'2', password:"GM"},
      {name: "FCA", id:'3', password:"FCA"}
    ],
    selectedOption: {id: '0', name: '', password:''} //This sets the default value of the select in the ui
  };

  $scope.requirementsRadio = 0;

  $scope.setTemplateOptions = function() {
      $scope.templateOptions = requirementsTemplate;
  }


  $scope.dropDownTriggerTemplate = function () {
    console.log("ShekelRequirementsController:MGLOG:" + $scope.template.selectedOption.id );
    $scope.loadRequirements("template-" + $scope.template.selectedOption.id) ;
	};

  $scope.dropDownTriggerCustomer = function () {
    console.log("ShekelRequirementsController:MGLOG:" + $scope.customer.selectedOption.name );
	};

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


$scope.loadRequirements = function(templateName) {
  console.log("ShekelRequirementsController:MGLOG:" + '/requirements/'  + templateName.toLowerCase() + '/' + $scope.platform.ersVersion.value);
  $http.get('/requirements/'  + templateName.toLowerCase() + '/' + $scope.platform.ersVersion.value)
    .success(function(data) {
      console.log("ShekelRequirementsController:MGLOG:" + data);
      $scope.sizingData = data.sizing;
      $scope.requirementsData.data = data.requirements;
//      $scope.requirements.forEach( function(row) {
//        row.registered = Date.parse(row.registered);
//      });
    });
}

$scope.loadRequirements("template-1");

$scope.sizingData = {
  totalRam: 0,
  totalStg: 0,
  totalvCPU: 0,
  totalCores:0,
  totalIP: 0
};

/*
$http.get('/requirements/' + $scope.platform.ersVersion.value)
  .success(function(data) {
    data.forEach( function(row) {
      row.registered = Date.parse(row.registered);
    });
    $scope.requirementsData.data = data;
  });
*/

}]);
