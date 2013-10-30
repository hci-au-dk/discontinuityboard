

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
	    error: function(jqxhr, data) {
		console.log(jqxhr);
		if (DEBUG)
		    alert("get one photo error");
	    }
	});
    }

    this.deletePhoto = function(photoId, successFn) {
	$.ajax({
	    url: "/delete-photo/",
	    type: "GET",
	    dataType: "json",
	    data: {"id": photoId},
	    success: function() {
		successFn();
	    },
	    error: function() {
		if (DEBUG)
		    alert("delete photo error");
	    }
	});

    }

    this.getConfigured = function(successFn) {
	$.ajax({
	    url: "/get-configured/",
	    type: "GET",
	    success: function(data) {
		successFn(data);
	    },
	    error: function() {
		if (DEBUG) {
		    alert("get configured error");
		}
	    }
	});
    }

    this.takePhotoWithPi = function(configsSet, successFn) {
	$("#loading").show();
	$.ajax({
	    url: "/take-photo/",
	    type: "GET",
	    dataType:"json",
	    data: {"configured": configsSet},
	    success: function(data) {
		successFn(data);
		$("#loading").hide();
	    },
	    error: function(data) {
		if (DEBUG)
		    alert("take photo error");
	    }
	});
    }

    this.uploadPhoto = function(file, successFn) {
	var fd = new FormData();    
	fd.append( 'file', file );

	$.ajax({
	    url: '/upload/',
	    data: fd,
	    processData: false,
	    contentType: false,
	    type: 'POST',
	    success: function(data){
		successFn(data);
	    },
	    error: function(data) {
		if (DEBUG)
		    alert("upload photo error");
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
	    },
            error: function() {
                if (DEBUG)
                    alert("transform image ajax error");
            }
        });
    }

    this.deleteConfigs = function() {
	$.ajax({
	    url: "/delete-configs/",
	    type: "GET",
	    success: function(data) {
		if (data.saved) {
		    configsSet = false;
		} else {
		    configsSet = true;
		}
		console.log(configsSet);
	    },
	    error: function(data) {
		if (DEBUG)
		    alert("delete configs error");
	    }
	});	
    }

    this.makeCut = function(photoId, x1, y1, x2, y2, successFn) {
	$.ajax({
	    url: "/make-cut/",
	    type: "GET",
	    dataType: "json",
	    data: {"id": photoId,
		  "x1": x1,
		  "x2": x2,
		  "y1": y1,
		  "y2": y2},
	    success: function(data) {
		successFn(data);
	    },
	    error: function(data) {
		if (DEBUG)
		    alert("make cut error");
	    }
	});
    }
}
