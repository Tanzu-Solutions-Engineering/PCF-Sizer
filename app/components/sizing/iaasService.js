"use strict";
var iaasService = shekelApp.factory('iaasService', function($rootScope) {
    return {
        iaasAskSummary: {ram: 1, disk: 1, vcpu: 1},
        resetIaaSAsk: function() {
            this.iaasAskSummary = {ram: 1, disk: 1, vcpu: 1}
        }
    };
});