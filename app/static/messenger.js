

var Messenger = function() {

    var host = window.location.host;
    var DEBUG = (host.indexOf("localhost") != -1) ||
                (host.indexOf("127.0.0.1") != -1);

    this.getAllPhotos = function(successFn) {
	$.ajax({
            url: "/get-all-photos/",
            type: "GET",
            success: function(data) {
                successFn(data);
            },
            error: function(data) {
                if (DEBUG)
                    alert("get all photos error");
            }
        });
    }

    this.getPhoto = function(photoId) {
	$.ajax({
	    url: "/get-photo/",
	    type: "GET",
	    dataType: "json",
	    data: {"id": photoId},
	    success: function(data) {
		setNewPhoto(data);
	    },
	    error: function(data) {
		if (DEBUG)
		    alert("get one photo error");
	    }
	});
    }

    this.takePhotoWithPi = function() {

	$.ajax({
	    url: "/take-photo/",
	    type: "GET",
	    success: function() {

	    },
	    error: function(data) {
		if (DEBUG)
		    alert("take photo error");
	    }
	});
    }



    this.transformImage = function(coordinates, photoId) {
	var params = {"photoid": photoId,
		      "coordinates" : coordinates};
	$.ajax({
            url: "/transform/",
            type: "POST",
            dataType: "json",
	    headers: "application/json",
            data: params,
            success: function(data) {
		setNewPhoto(data);
	    },
            error: function(data) {
                if (DEBUG)
                    alert("transform image ajax error");
            }
        });
    }
    
}
