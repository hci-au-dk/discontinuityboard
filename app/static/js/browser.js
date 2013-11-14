
var MAX_SIZE = 200;

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
	div.append(img)

	var p = $(document.createElement("p"));
	p.text("Access: " + data.photos[index]["code"]);
	div.append(p);


	bb.append(div);
    });
    
    $("#browse").append(bb);

}

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


// Deletes the current photo, and, if there is a next photo,
// sets it to be viewed.
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


