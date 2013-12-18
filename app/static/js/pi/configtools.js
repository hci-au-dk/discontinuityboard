// Tools associated with configuring the pi.

var ConfigTools = function() {

    // This is what gets called with the configure photo is loaded.
    // It displays the corner selection arrows and makes them work correctly.
    this.cornerSelectClick = function($parent, dragFn) {
	var parentX = $parent.offset().left;
	var parentY = $parent.offset().top;
	var parentWidth = $parent.width();
	var parentHeight = $parent.height();

	for (var i = 0; i < 4; i++) {
	    if ($(".corner").length >= 4) {
		break;
	    }
	    var x = 0;
	    var y = 0;

	    var div = $(document.createElement('div'));

	    if (i == 3 || i == 2) {  // top right || bottom right
		div.css("right", "0");
	    } 
	    if (i == 1 || i == 2) {  // bottom left || bottom right
		div.css("bottom", "0")
	    }
	    if (i == 0 || i == 3) {  // top left || top right
		div.css("top", "0");
	    }
	    if (i == 0 || i == 1) {  // top left || bottom left
		div.css("left", "0");
	    }
	    div.addClass("corner");

	    if (i == 3) {  // top right
		div.addClass("upperright");
	    } else if (i == 2) {  // bottom right
		div.addClass("lowerright");
	    } else if (i == 1) {  // bottom left
		div.addClass("lowerleft");
	    }

	    div.css("width", "20px");
	    div.css("height" , "20px");
	    div.attr("id", "corner" + i);
	    div.draggable({containment: "#" + $parent.attr("id")});
	    div.bind("drag", dragFn);  // listen for future updates
	    
	    $parent.append(div);
	    div.css("position", "absolute");

	    div.trigger("drag");
	}
    }
}