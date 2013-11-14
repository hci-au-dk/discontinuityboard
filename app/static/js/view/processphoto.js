// This is the main javascript file for the photo manipulation.
// It holds the tools and messenger objects.
var tools = null;
var messenger = null;
var browser = null;
var viewer = null;

var currentPhotoId = null;
var currentPhotoRatio = 1;

var configsSet = false;

// size constants
var MIN_SELECT_SIZE = 10;

$(window).load(function() {
    // because IE tries to cache all the things
    $.ajaxSetup({cache:false});

    // disable dragging on images
    $(document).on("dragstart", function(e) {
	var cl = $(this)
	if (e.target.nodeName.toUpperCase() == "IMG") {
            return false;
	}
    });

    messenger = new Messenger();

    // Must get the photos before we get the configuration
    tools = new Tools();
    viewer = new PhotoView();

    attachListeners();

    // make all the columns have equal height
    $(window).bind("resize", fixDimensions);
    $(window).trigger("resize");

    $(".loading-icon").hide();

    // load the proper photo
    var photoId = $("#photo-id").val()
    if (photoId) {
	messenger.getPhoto(photoId, setNewPhotoMainView);
    }
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
    $("#take-photo-button").bind("click", takeRegularPhotoClick);
    $("#deleteconfigs").bind("click", deleteConfigs);
    $("#uploadphotobutton").bind("click", showUpload);

    // Tools buttons
    $("#deletephoto").bind("click", tools.deletePhoto);
    $("#select-button").bind("click", tools.selectClick);
    $("#make-selection-button").bind("click", tools.makeSelection);
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
    $(".loading-icon").show();
    messenger.takePhotoWithPi(configs, function(data) {
	browser.getPhoto(data)
	$(".loading-icon").hide();
    });
    messenger.getAllPhotos(initializeBrowser);
}


function initializeBrowser(data) {
    browser = new Browser(data);
    $(".thumbnail").bind("click", browser.getPhotoClick);
}

function removePhoto() {
    $("#photo-tools-dropdown").hide();
    $("#notes-options").hide();
    $("#photocontainer").remove()
}

function setNewPhotoMainView(data) {
    setNewPhoto($("#view"), data);
}

function setNewPhoto($parent, data) {
    var stats = viewer.setNewPhoto($parent, data);
    currentPhotoId = stats.id;
    currentPhotoRatio = stats.ratio;

    $("#photo-tools-dropdown").show();
    $("#notes-options").show();
}

function appendSelection(data) {
    var img = $(document.createElement("img"));
    img.attr("src", data.path);
    var width = data.width * currentPhotoRatio;
    var height = data.height * currentPhotoRatio;
    img.css("width", width);
    img.css("height", height);
    $("#notes").append(img);
}
