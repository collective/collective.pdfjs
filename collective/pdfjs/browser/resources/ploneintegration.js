(function($) {
    $(document).ready(function() {   
    	   	
    	var outercontainer = $("#outerContainer")
    	
    	if (outercontainer.length != 0) {
    		var windowHeight = $(window).height();
	    	outercontainer.css("position", "relative");
	    	outercontainer.css("min-height", windowHeight -20);
	    	
	        var new_position = outercontainer.offset();
	        window.scrollTo(new_position.left,new_position.top - 10);
    	}	
    });
})(jQuery);