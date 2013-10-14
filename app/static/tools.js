// This is where the functionality for the buttons will go


var Tools = function() {

    var cornerCount = 0;
    
    var cornerSelectClick = function() {
	$("#selectcornerform").show();

	var parentX = $("#photocontainer").position().left;
	var parentY = $("#photocontainer").position().top;
	var parentWidth = $("#photocontainer").width();
	var parentHeight = $("#photocontainer").height();

	for (var i = 0; i < 4 && cornerCount < 4; i++) {
	    var x = parentX + CORNER_BORDER_SIZE;
	    var y = parentY + CORNER_BORDER_SIZE;

	    var div = $(document.createElement('div'));
	    cornerCount += 1;  // Because we want to use 1-based indexing for the corners

	    if (cornerCount == 4 || cornerCount == 3) {  // top right || bottom right
		x = x + parentWidth - (CORNER_SIZE);
	    } 
	    if (cornerCount == 2 || cornerCount == 3) {  // bottom left || bottom right
		y = y + parentHeight - (CORNER_SIZE);
	    }
	    div.css("left", x + "px");
	    div.css("top", y + "px");
	    div.addClass("corner");

	    div.css("width", (CORNER_SIZE - (2 * CORNER_BORDER_SIZE)) + "px");
	    div.css("height" , (CORNER_SIZE - (2 * CORNER_BORDER_SIZE)) + "px");
	    div.attr("id", "corner" + cornerCount);
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

    $("#selectcornerform").hide();

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
    $("#" + cornerId + "x").attr("value", Math.round(x * currentPhotoRatio));
    $("#" + cornerId + "y").attr("value", Math.round(y * currentPhotoRatio));
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
