var messenger = null;
var browser = null;
var viewer = null;


$(window).load(function() {
    // because IE tries to cache all the things
    $.ajaxSetup({cache:false});

    messenger = new Messenger();

    // Must get the photos before we get the configuration
    messenger.getAllPhotos(initializeBrowser);
    viewer = new PhotoView();

    attachListeners();

    $(".loading-icon").hide();
});


function attachListeners() {
    // Photo taking/uploading
    $("#take-photo-button").bind("click", takeRegularPhotoClick);
    $("#deleteconfigs").bind("click", deleteConfigs);
    $("#uploadphotobutton").bind("click", showUpload);

    // Tools buttons
    //$("#deletephoto").bind("click", tools.deletePhoto);
}

// TODO: fix configuration deletion service
function deleteConfigs() {
    messenger.deleteConfigs();
    messenger.getConfigured(setConfigured);
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
	$(".loading-icon").hide();
    });
    messenger.getAllPhotos(initializeBrowser);
}


function initializeBrowser(data) {
    browser = new Browser(data);
    $(".thumbnail").bind("click", browser.setSelected);
}

function setNewPhotoConfigureView(data) {
    $(".loading-icon").remove();
    viewer.setNewPhoto($("#configure-display"), data);
}
