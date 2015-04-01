shekelApp.directive('shklMoney', function() {
	
	function link(scope, element, attr) {
		attr.$observe('value', function(value) { 
			var origText = parseFloat(value); 
			element.text(origText.toFixed(2));
		});
	};
	
	return { 
		link: link,
		restrict: 'E',
		scope: { 
			value: '@'
		}		
	};
});
