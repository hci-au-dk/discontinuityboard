var PhotoView = function() {
}

PhotoView.prototype.setNewPhoto = function($parent, data) {

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
    
    // max width is width of the view portal, plus some to allow for margins
    var currentPhotoRatio = PhotoView.prototype.getScale(owidth, oheight, 
							 $parent.width(),
							 $parent.height());
    var width = owidth * currentPhotoRatio;
    var height = oheight * currentPhotoRatio;

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

    var obj = {"id": data.id,
	       "ratio": currentPhotoRatio,
	       "width": data.width,
	       "height": data.height};
    return obj
}

PhotoView.prototype.initializeNotes = function(data) {
    var content = data.notes;
    if (content) {
	tinyMCE.activeEditor.setContent(content);
    }
}

PhotoView.prototype.getScale = function(w, h, maxW, maxH) {
    var currentPhotoRatio = 1;
    // reset the ratio so that we can send accurate coordinates to the pi
    if (w > maxW || h > maxH) {
	// get ratio for scaling image
        var ratio = Math.min((maxW / w), (maxH / h));
        currentPhotoRatio = ratio;

    } else {
        var ratio = Math.min((maxW / w), (maxH / h));
        currentPhotoRatio = ratio;
    }
    return currentPhotoRatio;
}
