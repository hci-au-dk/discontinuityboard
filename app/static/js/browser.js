

var Browser = function (data) {
    $("#browsebucket").remove();
    
    var bb = $(document.createElement("div"));
    bb.attr("id", "browsebucket");

    $.each(data.photos, function(index) {
	// create the div and attach the binding
	var thumbnail = $(document.createElement('span'));
	thumbnail.addClass("thumbnailInfo");

	var img = $(document.createElement('img'));
	img.attr("src", data.photos[index]["path"]);
	img.attr("id", data.photos[index]["id"]);
	img.addClass("thumbnail");
	thumbnail.append(img);

	bb.append(img);
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
    var photoId = $(".selected")[0].attr("id");
    messenger.deletePhoto(photoId, removePhoto);
    messenger.getAllPhotos(initializeBrowser);

    // get the id of the next photo in the browser
    // if there is one, set it as the photo that is currently
    // being viewed
    var thumbs = $(".thumbnail");
    var reset = false;
    for (var i = 0; i < thumbs.length && !reset; i++) {
	var id = $(thumbs[i]).attr("id");
	if (id > currentPhotoId) {
	    $(thumbs[i]).trigger("click");
	    reset = true;
	}
    }
}
