// This is the main javascript file for the photo manipulation.
// It holds the tools and messenger objects.
var tools = null;
var messenger = null;
var browser = null;

var currentPhotoId = null;
var currentPhotoRatio = 1;

var configsSet = false;

// size constants
var MIN_SELECT_SIZE = 10;

$(window).load(function() {
    // because IE tries to cache all the things
    $.ajaxSetup({cache:false});

    messenger = new Messenger();

    // Must get the photos before we get the configuration
    messenger.getAllPhotos(initializeBrowser);

    messenger.getConfigured(setConfigured);

    tools = new Tools();

    attachListeners();

    // make all the columns have equal height
    $(window).bind("resize", fixDimensions);
    $(window).trigger("resize");

    
});

// to deal with sizing
function fixDimensions() {
    var height = $("#content").height();
    $(".column").height(height);
    // and the centering of the content
    var width = $("#content").width();
    $("#content").css("margin-left", (-1 * (width / 2)) + "px");
}


function attachListeners() {
    // Photo taking/uploading
    $("#takephoto").bind("click", takeRegularPhotoClick);
    $("#deleteconfigs").bind("click", deleteConfigs);
    $("#uploadphotobutton").bind("click", showUpload);

    // Tools buttons
    $("#deletephoto").bind("click", tools.deletePhoto);
    $("#cut").bind("click", tools.cutClick);
    $("#makecut").bind("click", tools.makeCut);
}

// TODO: fix configuration deletion service
function deleteConfigs() {
    messenger.deleteConfigs();
    messenger.getConfigured(setConfigured);
}

function setConfigured(data) {
    if (data.configs.x0.length > 0) {
	configsSet = true;
    }
}

function showUpload() {
    // first, get the file
    var file = $("#filename")[0].files[0]
    messenger.uploadPhoto(file, browser.getPhoto);
    messenger.getAllPhotos(initializeBrowser);
    // clear the filename from the form
    $("#filename").val("");
}

function takeRegularPhotoClick() {
    takePhotoClick(true);
}

function takePhotoClick(configs) {
    messenger.takePhotoWithPi(configs, browser.getPhoto);
    messenger.getAllPhotos(initializeBrowser);
}


function initializeBrowser(data) {
    browser = new Browser(data);
    $(".thumbnail").bind("click", browser.getPhotoClick);
}

function removePhoto() {
    $("#photocontainer").remove()
}

function setNewPhotoMainView(data) {
    setNewPhoto($("#view"), data);
}

function setNewPhotoConfigureView(data) {
    $("#configure-loading").hide();
    setNewPhoto($("#configure-display"), data);
}

function setNewPhoto($parent, data) {
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
    img.addClass("unselectable");

    imgSpan.append(img)
    photoCont.append(imgSpan);
    $parent.append(photoCont);
    
    var width = owidth;
    var height = oheight;
    currentPhotoRatio = 1;
    // max width is width of the view portal, plus some to allow for margins
    var maxWidth = $parent.width();
    var maxHeight = $parent.height();

    // reset the ratio so that we can send accurate coordinates to the pi
    if (owidth > maxWidth || oheight > maxHeight) {
	// get ratio for scaling image
        var ratio = Math.min((maxWidth / owidth), (maxHeight / oheight));
        currentPhotoRatio = ratio;

        width = owidth * ratio;
        height = oheight * ratio;
    }
    img.css("width", width); // Set new width
    img.css("height", height); // Scale height based on ratio

    // now set the proper margins
    var toolsCan = $(document.createElement("div"));
    toolsCan.attr("id", "toolsdiv");

    photoCont.css("width", width);
    photoCont.css("height", height);

    toolsCan.css("width", width);
    toolsCan.css("height", height);

    photoCont.append(toolsCan);

    toolsCan.append(imgSpan);

    browser.setSelected(data.id);
    tools.showCornerTools(raw);
}

function appendSelection(data) {
    var img = $(document.createElement("img"));
    img.attr("src", data.path);
    $("#notes").append(img);
}
