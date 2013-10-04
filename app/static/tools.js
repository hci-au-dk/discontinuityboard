// This is where the functionality for the buttons will go

cornerTool = false;
cornerCount = 0;

cornerSize = 20;  // This should be an even number

$(document).ready(function() {
    // do stuff when DOM is ready
    setUpListeners();
    setUpCanvasAndPhoto();
});

function setUpListeners() {
    // the buttons should be listening to the proper thing
    $("#cornerselect").bind("click", cornerSelectClick);
    $("#transformimage").bind("click", transformImageClick);
    // canvas needs to be listening too
    $("#imageeditparent").bind("click", canvasClick);
}

function setUpCanvasAndPhoto() {
    var images = $("#imagefile").children("img");
    if (images.length == 1) {
	var image = images[0];
	var width = image.clientWidth;
	var height = image.clientHeight;

	var layersToSetSize = [$("#imageeditparent"),
			       $("#imagelayer"),
			       $("#toolslayer")]

	for (var i = 0; i < layersToSetSize.length; i++) {
	    var div = layersToSetSize[i];
	    div.css("width", width);
	    div.css("height", height);
	}

	$("#imagelayer").css("background-image", "url(" + image.src + ")");
	$("#imagefile").hide();
    }
}

function cornerSelectClick() {
    cornerTool = !cornerTool;
    if (cornerTool) {
	$("#view").css("cursor", "crosshair");
    } else {
	$("#view").css("cursor", "default");
    }
}

function canvasClick(e) {

    if (cornerTool) {
	var ev = e || window.event; //Moz || IE

        var x = getX(e);
	var y = getY(e);

	var corners = $(".corner");

	if (corners.length < 4) {
	    // draw a box
	    var layer = $("#toolscanvas");

	    var div = $(document.createElement('div'));

	    div.css("left", (x - (cornerSize / 2)) + "px");
	    div.css("top", (y - (cornerSize / 2)) + "px");
	    div.addClass("corner");

	    div.css("width", cornerSize + "px");
	    div.css("height" , cornerSize + "px");
	    div.css("cursor", "pointer");
	    div.attr("id", "corner" + cornerCount);
	    div.draggable();

	    layer.append(div);
	   // $("#corner" + cornerCount).draggable();

	    cornerCount += 1;
	} else {
	    // find the nearest box and move it to where the user clicked
	    var minBox = null;
	    var minDist = -1;
	    // we're going to use Euclidean distance
	    for(var i = 0; i < corners.length; i++) {
		var corner = $(corners[i]);
		var cornerX = corner.position().left;
		var cornerY = corner.position().top;

		var dist = Math.sqrt(Math.pow(x - cornerX, 2) + 
				     Math.pow(y - cornerY, 2));
		if (dist < minDist || minDist < 0) {
		    minBox = corner;
		    minDist = dist;
		}
	    }
	    // now, move the minBox to where the user clicked
	    minBox.css("left", (x - (cornerSize / 2)) + "px");
	    minBox.css("top", (y - (cornerSize / 2)) + "px");
	}
    }
}


function transformImageClick(){
    // We'll make a post request to the server with the coordinates of the
    // selected corners
    var corners = $(".corner");


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
