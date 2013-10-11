

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
	img.addClass("thumbnail");
	thumbnail.append(img);

	var photoid = $(document.createElement("p"));
	photoid.addClass("photoid");
	photoid.attr("hidden", "true");
	photoid.html(data.photos[index]["id"]);
	thumbnail.append(photoid);

	thumbnail.bind("click", getPhoto);
	bb.append(thumbnail);
    });
    
    $("#browse").append(bb);


    function getPhoto(e) {
	var id = $(this).children().filter(".photoid")[0].innerHTML;
	messenger.getPhoto(id);
    }
}
