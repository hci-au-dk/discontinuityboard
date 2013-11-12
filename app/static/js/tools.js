// This is where the functionality for the buttons will go

var Tools = function() {

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

	    div.trigger("drag");
	}

    }

    
    var cutTool = false;  // TODO: see if this variable is necessary
    var inUse = null;

    // Creates a cut tool to cut the photo into blocks
    this.selectClick = function() {
	// TODO: make it so that you can't use other tools at the same time
	cutTool = !cutTool;
	if (cutTool) {
	    inUse = "cut";
	    $("#toolsdiv").bind("mousedown", selectionDown);
	    $("#toolsdiv").css("cursor", "crosshair");
	    $("#make-selection-button").show();
	    $("#make-selection-button").attr("disabled", "disabled");
	    //cutTool = false;
	} else {
	    $("#toolsdiv").css("cursor", "default");
	    $("#toolsdiv").unbind("mousedown");
	    $("#make-selection-button").hide();
	    $("#selector").remove();
	    inUse = null;
	}
    }
    
    this.makeSelection = function() {
	if (inUse == "cut") {  // making a cut is a valid thing to do
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
