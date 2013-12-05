/* Set up all the functionality needed for the pi front end.
 */

var messenger = null;
var browser = null;
var viewer = null;

var currentPhotoId = null;
var currentPhotoRatio = 1;

$(window).ready(function() {
    // because IE tries to cache all the things
    $.ajaxSetup({cache:false});

    messenger = new Messenger();

    // Must get the photos before we get the configuration
    messenger.getAllPhotos(initializeBrowser);
    viewer = new PhotoView();

    attachListeners();
    $(".loading-icon").hide();

    // trigger a configure event if the user got here through set up
    if (window.location.pathname == "/pi/configure-modal") {
	$("#configure-button").trigger("click");
    }
});

// Reload the photos every now and then automatically
window.setInterval(loadPhotos, 100000);
function loadPhotos() {
    messenger.getAllPhotos(initializeBrowser);
}


function attachListeners() {
    // Photo taking/uploading
    $("#take-photo-button").bind("click", takePhotoClick);
    $("#uploadphotobutton").bind("click", showUpload);
}

// Upload a photo and refresh the browser so that it shows things accurately.
function showUpload() {
    // first, get the file
    var file = $("#filename")[0].files[0]
    messenger.uploadPhoto(file);
    messenger.getAllPhotos(initializeBrowser);
    // clear the filename from the form
    $("#filename").val("");
}

// Take a photo and refresh the browser.
function takePhotoClick() {
    $(".loading-icon").show();
    messenger.takePhotoWithPi(true, function(data) {
	$(".loading-icon").hide();
	}, function(data) {
	    $(".loading-icon").hide();
	    window.location.reload();
	});
    messenger.getAllPhotos(initializeBrowser);
}

// Initialize the browser and make the thumbnails listen to the correct things.
function initializeBrowser(data) {
    browser = new Browser(data);
    $(".thumbnail").bind("click", browser.setSelected);
    $("#deletephoto").unbind("click");
    $("#deletephoto").bind("click", browser.deletePhoto);
}

// Set a new photo to be viewed in the configuration window
function setNewPhotoConfigureView(data) {
    var stats = viewer.setNewPhoto($("#configure-display"), data);
    currentPhotoId = stats.id;
    currentPhotoRatio = stats.ratio;
}
