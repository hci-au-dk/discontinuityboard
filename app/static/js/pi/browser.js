/* Javascript for viewing and manipulating the thumbnails of all
 * photos associated with the pi that you are logged into.
 */

var MAX_SIZE = 200; // Corresponds with the size set in discontinuityboard.css

// Initialize a browser with the data from messenger.getAllPhotos
var Browser = function(data) {
    $("#browsebucket").remove();
    
    var bb = $(document.createElement("div"));
    bb.attr("id", "browsebucket");

    $.each(data.photos, function(index) {
	// create the div and attach the binding
	var div = $(document.createElement("div"));
	div.addClass("thumbContainer")

	var img = $(document.createElement("img"));
	img.attr("src", data.photos[index]["path"]);
	img.attr("id", data.photos[index]["id"]);
	img.addClass("thumbnail");

	var w = data.photos[index]["width"];
	var h = data.photos[index]["height"];
	var scale = PhotoView.prototype.getScale(w, h,
						 MAX_SIZE, MAX_SIZE);
	
	img.css("width", w * scale); // Set new width
	img.css("height", h * scale); // Scale height based on ratio
	div.append(img);

	var p = $(document.createElement("p"));
	p.text("Access code: " + data.photos[index]["code"]);
	div.append(p);

	var p = $(document.createElement("p"));
	if (data.photos[index]["saved"]) {
	    p.text("This photo has been saved.")
	} else {
	    p.text("Expires on: " + data.photos[index]["time"]);
	}
	div.append(p);

	bb.append(div);
    });
    
    $("#browse").append(bb);
}

// Shows which thumbnail is currently selected
Browser.prototype.setSelected = function(e) {
    var photoId = $(this).attr("id");
    var thumbs = $(".thumbnail");
    for (var i = 0; i < thumbs.length; i++) {
	var id = $(thumbs[i]).attr("id");
	if (id == photoId) {
	    $(thumbs[i]).addClass("selected");
	} else {
	    $(thumbs[i]).removeClass("selected");
	}
    }
}


// Deletes the current thumbnail, and, if there is a next thumbnail,
// sets it to be selected.
Browser.prototype.deletePhoto = function(e) {
    if ($(".selected").length == 0) {
	return;
    }
    var thumbToDelete = $($(".selected")[0]);
    var photoId = $($(".selected")[0]).attr("id");
    messenger.deletePhoto(photoId);
    messenger.getAllPhotos(function(data) {
	initializeBrowser(data);
	// get the id of the next photo in the browser
	// if there is one, set it as the photo that is currently
	// being viewed
	var thumbs = $(".thumbnail");
	var reset = false;
	for (var i = 0; i < thumbs.length && !reset; i++) {
	    var id = $(thumbs[i]).attr("id");
	    if (id > photoId) {
		$(thumbs[i]).addClass("selected");
		reset = true;
	    }
	}
    });
}


