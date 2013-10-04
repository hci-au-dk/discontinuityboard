// This is where the functionality for the buttons will go

cornerTool = false;

cornerSize = 20;  // This should be an even number

$(document).ready(function() {
    // do stuff when DOM is ready
    setUpListeners();
    setUpCanvasAndPhoto();
});

function setUpListeners() {
    // the buttons should be listening to the proper thing
    $("#cornerselect").bind("click", cornerSelectClick);
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

        if (ev.pageX) { //Moz
	    x = ev.pageX;
	    y = ev.pageY;
        } else if (ev.clientX) { //IE
	    x = ev.clientX;
	    y = ev.clientY;
        }

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

	    layer.append(div);
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
