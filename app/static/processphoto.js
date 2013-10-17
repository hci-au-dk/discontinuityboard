// This is the main javascript file for the photo manipulation.
// It holds the tools and messenger objects.
var tools = null;
var messenger = null;
var browser = null;

var currentPhotoId = null;
var currentPhotoRatio = 1;

var configsSet = false;

// size constants
var CORNER_BORDER_SIZE = 2;
var CORNER_SIZE = 20 + (2 * CORNER_BORDER_SIZE);
var MAX_PHOTO_WIDTH = 500;

$(window).load(function() {
    // because IE tries to cache all the things
    $.ajaxSetup({cache:false});

    messenger = new Messenger();

    // Must get the photos before we get the configuration
    messenger.getAllPhotos(initializeBrowser);

    messenger.getConfigured(setConfigured);

    tools = new Tools();

    $("#takephoto").bind("click", takeRegularPhotoClick);
    $("#takerawphoto").bind("click", takeRawPhotoClick);
    $("#deleteconfigs").bind("click", deleteConfigs);
    $("#uploadphotobutton").bind("click", showUpload);
});

function deleteConfigs() {
    messenger.deleteConfigs();
    messenger.getConfigured(setConfigured);
}

function setConfigured(data) {
    console.log(data.configs);
    if (data.configs.x0.length > 0) {
	configsSet = true;
    }
    console.log("after check: " + configsSet);
}


function showUpload() {
    var upload = $("#filename").val()
    
    // now get the proper thumbnail by the name
    var thumbs = $(".thumbnail");
    for (var i = 0; i < thumbs.length; i++) {
	var name = $(thumbs[i]).attr("src");
	// split on '/'
	var parts = name.split("/");
	// the name should be the last piece
	if (upload == parts[parts.length - 1]) {
	    var id = $(thumbs[i]).attr("id");
	    messenger.getPhoto(id);
	}
    }
}

function takeRegularPhotoClick() {
    takePhotoClick(configsSet);
}

function takeRawPhotoClick() {
    takePhotoClick(false);
}

function takePhotoClick(configs) {
    messenger.takePhotoWithPi(configs, getPhotoToDisplay);
    messenger.getAllPhotos(initializeBrowser);
}


function initializeBrowser(data) {
    browser = new Browser(data);
}

function getPhotoToDisplay(data) {
    messenger.getPhoto(data.id);
}

function removePhoto() {
    $("#photocontainer").remove()
}

function setNewPhoto(data) {
    // change the current photo id to the one that is being displayed
    currentPhotoId = data.id;

    $("#photocontainer").remove();

    var photoCont = $(document.createElement("div"));
    photoCont.attr("id", "photocontainer");

    var imgSpan = $(document.createElement("span"));

    var img = $(document.createElement("img"));
    img.attr("src", data.path);

    var owidth = data.width;
    var oheight = data.height;
    var raw = data.raw;

    img.attr("id", "imagefile");

    imgSpan.append(img)
    photoCont.append(imgSpan);
    $("#view").append(photoCont);

    
    var width = owidth;
    var height = oheight;
    currentPhotoRatio = 1;

    // reset the ratio so that we can send accurate coordinates to the pi
    if (owidth > MAX_PHOTO_WIDTH) {
	var ratio = MAX_PHOTO_WIDTH / owidth;   // get ratio for scaling image
	currentPhotoRatio = ratio;

	width = MAX_PHOTO_WIDTH;
	height = oheight * ratio;
    }
   
    img.css("width", width); // Set new width
    img.css("height", height);  // Scale height based on ratio


    // now set the proper margins
    var toolsCan = $(document.createElement("div"));
    toolsCan.attr("id", "toolsdiv");

    photoCont.css("width", width + CORNER_SIZE);
    photoCont.css("height", height + CORNER_SIZE);

    toolsCan.css("margin", CORNER_SIZE / 2);

    toolsCan.css("width", width);
    toolsCan.css("height", height);

    photoCont.append(toolsCan);

    toolsCan.append(imgSpan);

    tools.showCornerTools(raw);
}
