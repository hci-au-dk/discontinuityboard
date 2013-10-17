

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


	img.bind("click", getPhoto);
	bb.append(img);
    });
    
    $("#browse").append(bb);

    if (data.photos.length == 0) {
	$("#browse").hide();
    }

    function getPhoto(e) {
	var id = $(this).attr("id");
	messenger.getPhoto(id);
    }
}
