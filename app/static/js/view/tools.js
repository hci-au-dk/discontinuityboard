// This is where the functionality for the buttons will go

var Tools = function() {
    
    this.makeSelection = function() {
	if ($(".imgareaselect-selection").length == 1) {  // making a cut is a valid thing to do
	    // get the coordinates of the cutBox
	    var box = $($(".imgareaselect-selection")[0]);
	    var td = $("#toolsdiv");
	    var x = box.offset().left;
	    var y = box.offset().top;
	    
	    // We need to get them in relation to the placement of the tool canvas
	    x = x - td.offset().left;
	    y = y - td.offset().top;
	    var botX = x + box.width();
	    var botY = y + box.height();

	    // If any of these coordinates are outside the bounds of the picture,
	    // we need to correct this
	    if (x < 0) {
		x = 0;
	    }
	    if (y < 0) {
		y = 0;
	    }
	    if (botX > td.width()) {
		botX = td.width();
	    }
	    if (botY > td.height()) {
		botY = td.height();
	    }

	    // Correct for the ratio that the picture is being displayed at
	    x = Math.round(x / current.ratio);
	    y = Math.round(y / current.ratio);
	    botX = Math.round(botX / current.ratio);
	    botY = Math.round(botY / current.ratio);

	    // send them to a service
	    if (x < botX && y < botY) {
		messenger.makeCut(current.id, x, y, botX, botY, appendSelection);
	    }
	}
    }
}

function selectionDown(e) {
    $("#make-selection-button").removeAttr("disabled");
    // get rid of any old selectors
    $("#selector").remove();

    // make a div that appears where the user clicked
    var x = getX(e) - $(this).offset().left;
    var y = getY(e) - $(this).offset().top;
    
    var div = $(document.createElement("div"));
    div.attr("id", "selector");
    div.css("top", y + "px");
    div.css("left", x + "px");
    div.css("cursor", "pointer");
    div.css("position", "absolute");  /* needs to be programmatically set to override style*/
    div.addClass("ui-widget-content")

    div.draggable({containment: "#toolsdiv"}).resizable({containment: "#toolsdiv", handles: "n,e,s,w,se,sw,ne,nw"});

    $(this).append(div);

    $("#toolsdiv").unbind("mousedown");
}

function getX(e) {
    var ev = e || window.event; //Moz || IE

    var x = 0;
    if (ev.pageX) { //Moz
	x = ev.pageX;
    } else if (ev.clientX) { //IE
	x = ev.clientX;
    }
    return x;
}

function getY(e) {
    var ev = e || window.event; //Moz || IE

    var y = 0;
    if (ev.pageX) { //Moz
	y = ev.pageY;
    } else if (ev.clientX) { //IE
	y = ev.clientY;
    }
    return y;
}
