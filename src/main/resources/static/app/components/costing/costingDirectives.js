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

shekelApp.directive('shklMonth', function() { 
	
    function roundUp(x) {  
    	var totalX;
	    if (x == Math.round(x)) { 
			totalX = x;
		} else  { 
			totalX = parseInt(x) +1;
		}
	    return totalX;
    }
    
	function link(scope, element, attr) {
		attr.$observe('value', function(value) {
			element.text(roundUp(value));
		});
	}
	
	return { 
		link: link,
		restrict: 'E', 
		scope: {
			value: '@'
		}
	};
});