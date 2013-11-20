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


    var height = $("#content").height();
    $(".column").height(height);

    tinymce.init({
	selector: '#notes',
	menubar: 'edit insert format tools',
	toolbar: "undo redo | alignleft aligncenter alignright alignjustify | bold italic | link image",
	plugins: 'link image code',
	relative_urls: false,
	height: height - 110,  // height of the content minus height of the tinymce toolbars
	setup: function(ed) {
            ed.on("change", editorChange);
            ed.on("keyDown", editorChange);
	}
    });

    // load the proper photo
    var photoId = $("#photo-id").val()
    if (photoId) {
	messenger.getPhoto(photoId, function(data){
	    if (data.notes == null) {
		$("#time-left").html("Days left to process: " + data.time);
	    } else {
		$("#time-left").html("Congratulations, your photo will not be deleted!");
	    }
	    setNewPhoto($("#view"), data);
	    viewer.initializeNotes(data);
	});
    }

    // and the centering of the content
    $(window).bind("resize", fixWidth);
    $(window).trigger("resize");
});

function editorChange(ed) {
    var message = $("#save-notes-button").html();
    if (message != "Save Notes") {
	$("#save-notes-button").html("Save Notes");
    }
}

window.setInterval(updateTime, 100000);

function updateTime() {
    messenger.getPhoto(currentPhotoId, function(data){
	if (data.path){
	    if (data.notes == null) {
		$("#time-left").html("Days left to process: " + data.time);
	    } else {
		$("#time-left").html("Congratulations, your photo will not be deleted!");
	    }
	} else {
	    // so that the browser doesn't ask the user about it
	    window.location = window.location.pathname;
	}
    });
}


function fixWidth() {
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

function setNewPhoto($parent, data) {
    var stats = viewer.setNewPhoto($parent, data);
    currentPhotoId = stats.id;
    currentPhotoRatio = stats.ratio;
}

function appendSelection(data) {
    var width = data.width * currentPhotoRatio;
    var height = data.height * currentPhotoRatio;

    var ed = tinyMCE.activeEditor;
    var range = ed.selection.getRng();                  // get range
    var newNode = ed.getDoc().createElement( "img" );  // create img node
    newNode.src = data.path;                           // add src attribute
    newNode.style.width = width + "px";
    newNode.style.height = height + "px";
    ed.execCommand('mceInsertContent', false, newNode.outerHTML)
}
