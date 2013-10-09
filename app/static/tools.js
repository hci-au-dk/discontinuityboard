// This is where the functionality for the buttons will go

cornerTool = true;  // meaning that we haven't populated them yet
cornerCount = 0;

cornerSize = 20 + 4;  // This should be an even number
cornerBorderSize = 2;  // this will be added to all sides of the corner
cornerBorderColor = "red";
cornerBorderStyle = "dashed";

$(document).ready(function() {
    // do stuff when DOM is ready
    setUpListeners();
    setUpCanvasAndPhoto();
});

function setUpListeners() {
    // the buttons should be listening to the proper thing
    $("#cornerselect").bind("click", cornerSelectClick);
    $("#transformimage").bind("click", transformImageClick);
}

function setUpCanvasAndPhoto() {
    var images = $("#imagefile").children("img");
    if (images.length == 1) {
	var image = images[0];
	var width = image.clientWidth;
	var height = image.clientHeight;

	var layersToSetSize = [$("#imagelayer"),
			       $("#toolscanvas")]

	for (var i = 0; i < layersToSetSize.length; i++) {
	    var div = layersToSetSize[i];
	    div.css("width", width);
	    div.css("height", height);
	}

	$("#imageeditparent").css("width", width + cornerSize);
	$("#imageeditparent").css("height", height + cornerSize);

	// now set the proper margins
	$("#imagelayer").css("margin", cornerSize / 2);

	$("#imagelayer").css("background-image", "url(" + image.src + ")");
	$("#imagefile").hide();

	// set the file id in the tools form
    }
}

function cornerSelectClick() {
    if (cornerTool) {
	// We want to automatically populate four corner selection boxes
	populateCorners();
    }
    cornerTool = false;
}

function populateCorners() {
    var parentX = $("#toolscanvas").position().left;
    var parentY = $("#toolscanvas").position().top;
    var parentWidth = $("#toolscanvas").width();
    var parentHeight = $("#toolscanvas").height();

    for (var i = 0; i < 4; i++) {
	var x = parentX;
	var y = parentY;

	// draw a box
	var layer = $("#toolscanvas");

	var div = $(document.createElement('div'));

	cornerCount += 1;  // Because we want to use 1-based indexing for the corners

	if (cornerCount == 4 || cornerCount == 3) {  // top right || bottom right
	    x = x + parentWidth;
	} 
	if (cornerCount == 2 || cornerCount == 3) {  // bottom left || bottom right
	    y = y + parentHeight;
	}
	x = x - (cornerSize / 2);
	y = y - (cornerSize / 2);

	// Corner 1 should be in the top left
	div.css("left", x + "px");
	div.css("top", y + "px");
	div.addClass("corner");

	div.css("width", (cornerSize - (2 * cornerBorderSize)) + "px");
	div.css("height" , (cornerSize - (2 * cornerBorderSize)) + "px");
	div.css("cursor", "pointer");
	div.attr("id", "corner" + cornerCount);
	div.draggable({containment: "#imageeditparent"});
	div.bind("mousemove", populateCoordinates);  // listen for future updates

	layer.append(div);

	div.trigger("mousemove");
    }
    // set our borders for the boxes
    var borderStr = cornerBorderSize + "px " + 
		     cornerBorderStyle + " " + 
		     cornerBorderColor;
    $(".corner").css("border", borderStr); 

}


function populateCoordinates(e) {
    // Get the div that moved
    var corner = $(this);
    var x = corner.position().left;
    var y = corner.position().top;
    
    var cornerId = corner.attr("id");
    // The matching coordinate input boxes have ids of cornerId + [x|y]
    x = x - (cornerSize / 2);
    y = y - (cornerSize / 2);

    // We need to adjust for the placement of the tool canvas
    x = x - ($("#toolscanvas").position().left - (cornerSize));
    y = y - ($("#toolscanvas").position().top - (cornerSize));

    $("#" + cornerId + "x").attr("value", x);
    $("#" + cornerId + "y").attr("value", y);
}


function transformImageClick(){
    // We'll make a post request to the server with the coordinates of the
    // selected corners
    var corners = $(".corner");
    if (corners.length != 4) {
	// get angry
	alert("You must set 4 corners before correcting perspective.");
	return;
    }
    var parameters = {};
    for (var i = 0; i < corners.length; i++) {
	var corner = $(corners[i]);

	var cornerX = corner.position().left;
	var cornerY = corner.position().top;

	var middleX = cornerX + (cornerSize / 2);
	var middleY = cornerY + (cornerSize / 2);
	var coords = {'x': middleX, 'y': middleY};
    }

    //postToUrl("/transform",

}
	

function postToUrl(path, params, method) {
    method = method || "post"; // Set method to post by default if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
         }
    }

    document.body.appendChild(form);
    form.submit();
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
