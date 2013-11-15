// This is where the functionality for the buttons will go

var Tools = function() {
    var cutTool = false;  // TODO: see if this variable is necessary
    $("#select-options").hide();

    // Creates a cut tool to cut the photo into blocks
    this.selectClick = function() {
	// TODO: make it so that you can't use other tools at the same time
	cutTool = !cutTool;
	if (cutTool) {
	    $("#toolsdiv").bind("mousedown", selectionDown);
	    $("#toolsdiv").css("cursor", "crosshair");
	    $("#select-options").show();
	    $("#make-selection-button").attr("disabled", "disabled");
	    $("#select-button").addClass("inuse");
	} else {
	    $("#toolsdiv").css("cursor", "default");
	    $("#toolsdiv").unbind("mousedown");
	    $("#select-options").hide();
	    $("#selector").remove();
	    $("#select-button").removeClass("inuse");
	}
    }
    
    this.makeSelection = function() {
	if ($("#selector").length == 1) {  // making a cut is a valid thing to do
	    // get the coordinates of the cutBox
	    var box = $("#selector");
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
	    x = Math.round(x / currentPhotoRatio);
	    y = Math.round(y / currentPhotoRatio);
	    botX = Math.round(botX / currentPhotoRatio);
	    botY = Math.round(botY / currentPhotoRatio);

	    // send them to a service
	    messenger.makeCut(currentPhotoId, x, y, botX, botY, appendSelection);
	    $("#selector").remove();
	    $("#make-selection-button").attr("disabled", "disabled");
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

    $(this).append(div);
    $(window).bind("mousemove", resizeSelector);
    $(window).bind("mouseup", finishSelecting);
}

function resizeSelector(e) {
    // only allow dragging right and down to grow the selector for now
    var x = getX(e);
    var y = getY(e);

    var sX = $("#selector").offset().left;
    var sY = $("#selector").offset().top;

    var w = x - sX;
    var h = y - sY;

    // new width and height
    if (w > 1) {
	$("#selector").css("width", w + "px");
    }
    if (h > 1) {
	$("#selector").css("height", h + "px");
    }
}

function finishSelecting() {
    $(window).unbind("mousemove");
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
