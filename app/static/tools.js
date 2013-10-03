// This is where the functionality for the buttons will go

cornerTool = false;

$(document).ready(function() {
    // do stuff when DOM is ready
    setUpListeners();
    setUpCanvasAndPhoto();
});

function setUpListeners() {
    // the buttons should be listening to the proper thing
    $("#cornerselect").bind("click", cornerSelectClick);
    $("#imagecanvas").bind("click", canvasClick);
}

function setUpCanvasAndPhoto() {
    var images = $("#imagefile").children("img");
    if (images.length == 1) {
	var image = images[0];
	var width = image.clientWidth;
	var height = image.clientHeight;
	$("#imagecanvas").css("width", width);
	$("#imagecanvas").css("height", height);
	$("#imagecanvas").css("background-image", "url(" + image.src + ")");
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

function canvasClick() {
    if (cornerTool) {
    
    }
}
