// This is where the functionality for the buttons will go


var Tools = function() {
    
    var cornersFunction = false;

    var cornerSelectClick = function() {
	if (!cornersFunction) {
	    return;
	}
	$("#selectcornerform").show();

	var parentX = $("#photocontainer").position().left;
	var parentY = $("#photocontainer").position().top;
	var parentWidth = $("#photocontainer").width();
	var parentHeight = $("#photocontainer").height();

	for (var i = 1; i <= 4; i++) {
	    if ($(".corner").length >= 4) {
		break;
	    }
	    var x = parentX + CORNER_BORDER_SIZE;
	    var y = parentY + CORNER_BORDER_SIZE;

	    var div = $(document.createElement('div'));

	    if (i == 4 || i == 3) {  // top right || bottom right
		x = x + parentWidth - (CORNER_SIZE);
	    } 
	    if (i == 2 || i == 3) {  // bottom left || bottom right
		y = y + parentHeight - (CORNER_SIZE);
	    }
	    div.css("left", x + "px");
	    div.css("top", y + "px");
	    div.addClass("corner");

	    div.css("width", (CORNER_SIZE - (2 * CORNER_BORDER_SIZE)) + "px");
	    div.css("height" , (CORNER_SIZE - (2 * CORNER_BORDER_SIZE)) + "px");
	    div.attr("id", "corner" + i);
	    div.draggable({containment: "#photocontainer"});
	    div.bind("mousemove", populateCoordinates);  // listen for future updates

	    $("#toolsdiv").append(div);

	    div.trigger("mousemove");
	}
	// set our borders for the boxes
	var borderStr = CORNER_BORDER_SIZE + "px dashed red";
	$(".corner").css("border", borderStr); 

	// show the coordinate selection boxes
	$("selectCornerForm").show();
    }

    $("#cornerselect").bind("click", cornerSelectClick);
    $("#cornerselectdiv").hide();

    $("#transformimage").bind("click", function() {
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
    });

    // Deletes the current photo, and, if there is a next photo,
    // sets it to be viewed.
    var deletePhoto = function() {
	messenger.deletePhoto(currentPhotoId, removePhoto);
	hideTools();

	// get the id of the next photo in the browser
	// if there is one, set it as the photo that is currently
	// being viewed
	var thumbs = $(".thumbnail");
	for (var i = 0; i < thumbs.length; i++) {
	    var id = $(thumbs[i]).attr("id");
	    if (id > currentPhotoId || (i == thumbs.length - 1 && id != currentPhotoId)) {
		alert(id);
		messenger.getPhoto(id);
		break;
	    }
	}

	messenger.getAllPhotos(initializeBrowser);
    }


    $("#deletephoto").bind("click", deletePhoto);
    $("#deletephoto").hide();


    this.showCornerTools = function(rawImage) {
	if (!rawImage) {  // We should not show the tools
	    $("#cornerselectdiv").hide();
	    cornersFunction = false;
	} else {
	    $("#cornerselectdiv").show();
	    cornersFunction = true;
	}
	// always show the delete button if there is a photo shown
	if ($("#view").children().length > 0) {
	    $("#deletephoto").show();
	}
    }
}

function hideTools() {
    $("#selectcornerform").hide();
    $("#deletephoto").hide();
}

function populateCoordinates(e) {
    // Get the div that moved
    var corner = $(this);
    var x = corner.position().left;
    var y = corner.position().top;
    
    var cornerId = corner.attr("id");
    // The matching coordinate input boxes have ids of cornerId + [x|y]
    x = x - (CORNER_SIZE);
    y = y - (CORNER_SIZE);

    // We need to adjust for the placement of the tool canvas
    x = x - ($("#toolsdiv").position().left - (CORNER_SIZE));
    y = y - ($("#toolsdiv").position().top - (CORNER_SIZE));

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
