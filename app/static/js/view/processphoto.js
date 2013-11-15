// This is the main javascript file for the photo manipulation.
// It holds the tools and messenger objects.
var tools = null;
var messenger = null;
var browser = null;
var viewer = null;

// Info about the photo that is currently being displayed
var currentPhotoId = null;
var currentPhotoRatio = 1;

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


    $(".loading-icon").hide();

    // load the proper photo
    var photoId = $("#photo-id").val()
    if (photoId) {
	messenger.getPhoto(photoId, setNewPhotoMainView);
    }

    tinymce.init({
	selector: '#notes',
	plugins: 'link image code',
	relative_urls: false
    });

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
    // Tools buttons
    $("#select-button").bind("click", tools.selectClick);
    $("#make-selection-button").bind("click", tools.makeSelection);
}

function showUpload() {
    // first, get the file
    var file = $("#filename")[0].files[0]
    messenger.uploadPhoto(file, browser.getPhoto);
    messenger.getAllPhotos(initializeBrowser);
    // clear the filename from the form
    $("#filename").val("");
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
    var width = data.width * currentPhotoRatio;
    var height = data.height * currentPhotoRatio;

    var ed = tinyMCE.activeEditor;
    var range = ed.selection.getRng();                  // get range
    var newNode = ed.getDoc().createElement( "img" );  // create img node
    newNode.src = data.path;                           // add src attribute
    newNode.width = width;
    newNode.height = height;
    range.insertNode(newNode);       // insert it into the editor! Bam!
}
