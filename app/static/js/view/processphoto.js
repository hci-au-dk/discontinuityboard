// This is the main javascript file for the photo manipulation.
// It holds the tools and messenger objects.
var tools = null;
var messenger = null;
var browser = null;
var viewer = null;

// Info about the photo that is currently being displayed
var current = {};

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

    $(".loading-icon").hide();

    initializeTinyMCE();


    $("input#code").focus();
    $("input#code").bind('keyup paste', function(){
	    if ($("input#code").val().length == 6) {
		$('form[name="photoview"]').submit();
	    }
	});    

    // and the centering of the content
    $(window).bind("resize", fixWidth);


    // load the proper photo
    var photoId = $("#photo-id").val()
    if (photoId) {
	messenger.getPhoto(photoId, function(data){
	    if (data.notes == null) {
		$("#time-left").html("Expires on: " + data.time);
	    } else {
		$("#time-left").html("Congratulations, your photo will not be deleted!");
	    }
	    setNewPhoto($("#view"), data);
	    viewer.initializeNotes(data);
	    $(window).trigger("resize");
	});
    }
});

function initializeTinyMCE() {
    var height = $("#content").height();

    if (tinyMCE.activeEditor != null) {
	tinyMCE.activeEditor.remove();
    }

    tinymce.init({
	selector: '#notes',
	menubar: '',
	toolbar: "undo redo | alignleft aligncenter alignright alignjustify | bold italic | link image | save export",
	plugins: 'link image code',
	relative_urls: false,
       	height: height - 75,  // height of the content minus height of the tinymce toolbars
	setup: function(ed) {
            ed.on("change", editorChange);
	    ed.on("keyDown", editorChange);
	    // Add a custom button
	    ed.addButton('save', {
			title : 'Save button',
			onclick : function() {
			ed.label = 'Save';
			var content = tinyMCE.activeEditor.getContent();
			messenger.saveNotes(current.id, content, function(data) {
				$("#save-notes-button").html("Saved");
			    });
			}
		    });
	    ed.addButton('export', {
			title : 'Export button',
			text: 'Export to PDF',
			onclick : function() {
			var content = tinyMCE.activeEditor.getContent();
			messenger.saveNotes(current.id, content, function(data) {
				$("#save-notes-button").html("Saved");
				window.location = $("#export-link").attr("href");
			    });
		    }
		});
	    }
    });
}

function editorChange(ed) {
    var message = $("#save-notes-button").html();
    if (message != "Save Notes") {
	$("#save-notes-button").html("Save Notes");
    }
}

window.setInterval(updateTime, 100000);

function updateTime() {
    messenger.getPhoto(current.id, function(data){
	if (data.path){
	    if (data.notes == null) {
		$("#time-left").html("Expires on: " + data.time);
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
    width = (width / 2);
    $("#content").css("margin-left", (-1 * width) + "px");
    var height = $("#content").height() - $("#logo").height() - 10;
    width = $("#view").width();

    current.ratio = viewer.getScale(current.width, current.height, 
					width, height);
    var nwidth = current.width * current.ratio;
    var nheight = current.height * current.ratio;
	    
    $("#imagefile").css("width", nwidth); // Set new width
    $("#imagefile").css("height", nheight); // Scale height based on ratio

    $("#photocontainer").css("width", nwidth);
    $("#photocontainer").css("height", nheight);
    
    $("#toolsdiv").css("width", nwidth);
    $("#toolsdiv").css("height", nheight);

    $("#photocontainer").css("margin-top", (-1 * (height / 2)));

    initializeTinyMCE();
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
    current = viewer.setNewPhoto($parent, data);

    // make it selectable
    var ias = $("#imagefile").imgAreaSelect({
	    onSelectEnd: tools.makeSelection
    });
}

function appendSelection(data) {
    var width = data.width * current.ratio;
    var height = data.height * current.ratio;

    var ed = tinyMCE.activeEditor;
    var range = ed.selection.getRng();                  // get range
    var newNode = ed.getDoc().createElement( "img" );  // create img node
    newNode.src = data.path;                           // add src attribute
    newNode.style.width = width + "px";
    newNode.style.height = height + "px";
    ed.execCommand('mceInsertContent', false, newNode.outerHTML);
    $($(".imgareaselect-selection")[0].parentNode).css("display", "none");
    $($(".imgareaselect-selection")[0].parentNode).css("width", "0");
    $($(".imgareaselect-selection")[0].parentNode).css("top", "0");
    $($(".imgareaselect-selection")[0].parentNode).css("left", "0");
    $($(".imgareaselect-selection")[0].parentNode).css("height", "0");
    $(".imgareaselect-outer").hide();
}
