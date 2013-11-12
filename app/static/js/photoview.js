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
    
    var width = owidth;
    var height = oheight;
    var currentPhotoRatio = 1;
    // max width is width of the view portal, plus some to allow for margins
    var maxWidth = $parent.width();
    var maxHeight = $parent.height();

    // reset the ratio so that we can send accurate coordinates to the pi
    if (owidth > maxWidth || oheight > maxHeight) {
	// get ratio for scaling image
        var ratio = Math.min((maxWidth / owidth), (maxHeight / oheight));
        currentPhotoRatio = ratio;

        width = owidth * ratio;
        height = oheight * ratio;
    }
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
	      "ratio": currentPhotoRatio};
    return obj
}
