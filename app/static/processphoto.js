// This is the main javascript file for the photo manipulation.
// It holds the tools and messenger objects.
var tools = null;
var messenger = null;
var browser = null;

var currentPhotoId = null;
var currentPhotoRatio = 1;

var configsSet = false;

// size constants
CORNER_BORDER_SIZE = 2;
CORNER_SIZE = 20 + (2 * CORNER_BORDER_SIZE);

$(window).load(function() {
    // because IE tries to cache all the things
    $.ajaxSetup({cache:false});

    // set up listeners and such things

    messenger = new Messenger();

    messenger.getAllPhotos(initializeBrowser);

    tools = new Tools();

    $("#takephoto").bind("click", takePhotoClick);
});

function takePhotoClick() {
    messenger.takePhotoWithPi(configsSet);
    messenger.getAllPhotos(initializeBrowser);
}

function initializeBrowser(data) {
    browser = new Browser(data);
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

    var width = $(imgSpan.children()[0]).width();
    var height = $(imgSpan.children()[0]).height();
    
    // reset the ratio so that we can send accurate coordinates to the pi
    var ratio = owidth / width;
    currentPhotoRatio = ratio;

    imgSpan.remove()

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
