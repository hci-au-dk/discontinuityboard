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
            }
        });
    }

    this.getPhoto = function(photoId, successFn) {
	$.ajax({
	    url: "/get-photo/",
	    type: "GET",
	    data: {"id": photoId},
	    success: function(data) {
		successFn(data);
	    },
	    error: function(jqxhr, data) {
		console.log(jqxhr);
		if (DEBUG)
		    alert("get one photo error");
	    }
	});
    }

    this.deletePhoto = function(photoId) {
	$.ajax({
	    url: "/delete-photo/",
	    type: "GET",
	    dataType: "json",
	    data: {"id": photoId},
	    success: function() {
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

    this.uploadPhoto = function(file) {
	var fd = new FormData();    
	fd.append( 'file', file );

	$.ajax({
	    url: '/upload/',
	    data: fd,
	    processData: false,
	    contentType: false,
	    type: 'POST',
	    success: function(data){

	    },
	    error: function(data) {
		if (DEBUG)
		    alert("upload photo error");
	    }
	}); 
    }


    // AJAX view functions

    this.saveNotes = function(photoId, notesContent, successFn) {
	var data = {id: photoId, content: notesContent};
	$.ajax({
	    url: '/save-notes/',
	    data: data,
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
