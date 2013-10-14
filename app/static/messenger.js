

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

    this.takePhotoWithPi = function(configsSet, successFn) {

	$.ajax({
	    url: "/take-photo/",
	    type: "GET",
	    dataType:"json",
	    data: {"configured": configsSet},
	    success: function(data) {
		successFn(data);
	    },
	    error: function(data) {
		if (DEBUG)
		    alert("take photo error");
	    }
	});
    }



    this.transformImage = function(coordinates) {
	var params = {"coordinates" : coordinates};

	$.ajax({
            url: "/set-transform-coords/",
            type: "POST",
            dataType: "json",
	    headers: "application/json",
            data: params,
            success: function(data) {
		if (data.saved) {
		    configsSet = true;
		} else {
		    configsSet = false;
		}
		console.log(configsSet);
	    },
            error: function() {
                if (DEBUG)
                    alert("transform image ajax error");
            }
        });
    }
}
