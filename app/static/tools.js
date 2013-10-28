// This is where the functionality for the buttons will go

var Tools = function() {

    var buttons = new Array();
    buttons[0] = $("#cornerselect");
    buttons[1] = $("#transformimage");
    buttons[2] = $("#cut");
    buttons[3] = $("#annotate");
    
    var cornersFunction = false;

    this.cornerSelectClick = function() {
	if (!cornersFunction) {
	    return;
	}
	$("#cornerselectform").show();

	var parentX = $("#toolsdiv").offset().left;
	var parentY = $("#toolsdiv").offset().top;
	var parentWidth = $("#toolsdiv").width();
	var parentHeight = $("#toolsdiv").height();

	for (var i = 1; i <= 4; i++) {
	    if ($(".corner").length >= 4) {
		break;
	    }
	    var x = 0;
	    var y = 0;

	    var div = $(document.createElement('div'));

	    if (i == 4 || i == 3) {  // top right || bottom right
		div.css("right", "0");
	    } 
	    if (i == 2 || i == 3) {  // bottom left || bottom right
		div.css("bottom", "0")
	    }
	    if (i == 1 || i == 4) {  // top left || top right
		div.css("top", "0");
	    }
	    if (i == 1 || i == 2) {  // top left || bottom left
		div.css("left", "0");
	    }
	    div.addClass("corner");

	    if (i == 4) {  // top right
		div.addClass("upperright");
	    } else if (i == 3) {  // bottom right
		div.addClass("lowerright");
	    } else if (i == 2) {  // bottom left
		div.addClass("lowerleft");
	    }

	    div.css("width", (CORNER_SIZE - (2 * CORNER_BORDER_SIZE)) + "px");
	    div.css("height" , (CORNER_SIZE - (2 * CORNER_BORDER_SIZE)) + "px");
	    div.attr("id", "corner" + i);
	    div.draggable({containment: "#toolsdiv"});
	    div.bind("drag", populateCoordinates);  // listen for future updates

	    $("#toolsdiv").append(div);

	    div.trigger("drag");
	}

	// show the coordinate selection boxes
	$("cornerselectform").show();
    }

    // If the user is setting the coordinates for how this image should
    // be transformed
    this.transformClick = function() {
	var coordinates = {'x1': $("#corner1x").val(),
			   'y1': $("#corner1y").val(),
			   'x2': $("#corner2x").val(),
			   'y2': $("#corner2y").val(),
			   'x3': $("#corner3x").val(),
			   'y3': $("#corner3y").val(),
			   'x4': $("#corner4x").val(),
			   'y4': $("#corner4y").val()};

	messenger.transformImage(coordinates);
	configsSet = true;
    }

    // Deletes the current photo, and, if there is a next photo,
    // sets it to be viewed.
    this.deletePhoto = function() {
	messenger.deletePhoto(currentPhotoId, removePhoto);
	hideTools();

	messenger.getAllPhotos(initializeBrowser);

	// get the id of the next photo in the browser
	// if there is one, set it as the photo that is currently
	// being viewed
	var thumbs = $(".thumbnail");
	var reset = false;
	for (var i = 0; i < thumbs.length && !reset; i++) {
	    var id = $(thumbs[i]).attr("id");
	    if (id > currentPhotoId) {
		messenger.getPhoto(id);
		reset = true;
	    }
	}
    }
    
    var cutTool = false;  // TODO: see if this variable is necessary
    var inUse = null;

    // Creates a cut tool to cut the photo into blocks
    this.cutClick = function() {
	// TODO: make it so that you can't use other tools at the same time
	cutTool = !cutTool;
	if (cutTool) {
	    $("#view").css("cursor", "crosshair");
	    for (var i = 0; i < buttons.length; i++) {
		//buttons[i].attr("disabled", true);
	    }
	    $("#cutoptions").toggle();
	    inUse = useCutTool(inUse);
	    cutTool = false;
	} else {
	    $("#view").css("cursor", "default");
	}
    }

    // Creates the annotation tool to annotate different parts of the photo
    this.annotateTool = function() {
	$("#view").css("cursor", "text");
    }
    
    hideTools();

    this.showCornerTools = function(rawImage) {
	if (!rawImage) {  // We should not show the tools
	    $("#cornerselectdiv").hide();
	    cornersFunction = false;
	} else {
	    $("#cornerselectdiv").show();
	    $("#cornerselectform").hide();
	    cornersFunction = true;
	}
	// always show the delete button if there is a photo shown
	if ($("#view").children().length > 0) {
	    $("#deletephoto").show();
	    $("#cut").show();
	    $("#annotate").show();
	}
    }
    
    this.makeCut = function() {
	if (inUse == "cut") {  // making a cut is a valid thing to do
	    // get the coordinates of the cutBox
	    var box = $("#cutBox");
	    var td = $("#toolsdiv");
	    var x = box.position().left;
	    var y = box.position().top;
	    
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
	    messenger.makeCut(currentPhotoId, x, y, botX, botY);
	}
	//inUse = null;  // TODO: uncomment this
    }
}

function hideTools() {
    $("#cornerselectform").hide();
    $("#deletephoto").hide();
    $("#cut").hide();
    $("#annotate").hide();
    $("#cornerselectdiv").hide();
    $("#cutoptions").hide();
}


function useCutTool(inUse) {
    if (inUse != null) {
	return inUse;
    }
    var div = $(document.createElement('div'));

    var x = $("#toolsdiv").position().left + ((CORNER_SIZE / 2));
    var y = $("#toolsdiv").position().top + ((CORNER_SIZE / 2));
    var parentWidth = $("#toolsdiv").width();
    var parentHeight = $("#toolsdiv").height();

    div.css("left", x + "px");
    div.css("top", y + "px");
    div.css("width", parentWidth);
    div.css("height", parentHeight);
    div.attr("id", "cutBox");

    // add corners to the div (grabbers)
    for (var i = 1; i <= 4; i++) {
	var grab = $(document.createElement("div"));
	grab.attr("id" , "grabber" + i);
	grab.addClass("grabber");
	if (i == 4 || i == 3) {  // top right || bottom right
	    grab.css("right", "0");
	} 
	if (i == 2 || i == 3) {  // bottom left || bottom right
	    grab.css("bottom", "0")
	}
	if (i == 1 || i == 4) {  // top left || top right
	    grab.css("top", "0");
	}
	if (i == 1 || i == 2) {  // top left || bottom left
	    grab.css("left", "0");
	}
	grab.bind("mousedown", grabClick);
	div.append(grab);
    }
    
    $("#photocontainer").append(div);
    // indicate that we are now using the cut tool
    return "cut";
}

function grabClick(e) {
    var grab = $(this);
    var args = {};
    if (grab.css("left") == "0px") {  // top right || bottom right
	args.side1 = "left";
    } else {
	args.side1 = "right";
    }
    if (grab.css("top") == "0px") {
	args.side2 = "top";
    } else {
	args.side2 = "bottom";
    }
    $("#cutBox").bind("mousemove", args, resizeDiv);
    $("body").bind("mouseup", function() {
	$("#cutBox").unbind("mousemove");
	$("body").unbind("mouseup");
    });
}

function resizeDiv(e) {
    // e.data.side1 is the first side we need to move
    // e.data.side2 is the second side we need to move
    var x = getX(e);
    var y = getY(e);

    var top = $("#cutBox").position().top;
    var left = $("#cutBox").position().left;
    var w = $("#cutBox").width();
    var h = $("#cutBox").height();

    // we want some constraints, like that the box can't get too small    
    var width = x - left;
    if (e.data.side1 == "left") {
	width = (left - x) + w;
	if (isOK(width)) {
	    $("#cutBox").css("left", x);
	}
    }
    if (isOK(width)) {
	$("#cutBox").css("width", width); 
    }

    var height = y - top;
    if (e.data.side2 == "top") {
	height = (top - y) + h;
	if (isOK(height)) {
	    $("#cutBox").css("top", y);
	}
    }
    if (isOK(height)) {
	$("#cutBox").css("height", height);
    }
}

function isOK(num) {
    return num >= MIN_SELECT_SIZE;
}


function populateCoordinates(e) {
    // Get the div that moved
    var corner = $(this);
    var x = corner.position().left;
    var y = corner.position().top;
    
    var cornerId = corner.attr("id");
    // depending on which div it is, we want different values for x and y
    var i = cornerId.substring(cornerId.length - 1);
    if (i == 4 || i == 3) {  // top right || bottom right
	x = x + corner.width();
    } 
    if (i == 2 || i == 3) {  // bottom left || bottom right
	y = y + corner.height();
    }

    // We want the "true" coordinates - immune to any resizing that happens
    $("#" + cornerId + "x").attr("value", Math.round(x / currentPhotoRatio));
    $("#" + cornerId + "y").attr("value", Math.round(y / currentPhotoRatio));
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
