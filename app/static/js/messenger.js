/* A general messenger object that provides a convenient interface
 * to execute AJAX requests from. Goes to debug mode if the host's
 * location is "localhost" or "127.0.0.1".
 */

var Messenger = function() {

    var host = window.location.host;
    var DEBUG = (host.indexOf("localhost") != -1) ||
                (host.indexOf("127.0.0.1") != -1);

    // Get all photos associated with this pi
    // Returns on successan array of photo objects:
    // {"path": path to photo, 
    // "id": photo id,
    // "code": access code,
    // "width": original photo width,
    // "height": original photo height,
    // "time": expiry time,
    // "saved": whether or not the photo has been saved}
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

    // Get a single photo specified by this id.
    // Returns on succes:
    // {"path": path to photo, 
    // "id": photo id,
    // "width": original photo width,
    // "height": original photo height,
    // "raw": whether this photo was configured,
    // "time": expiry time,
    // "notes": notes content for this  photo}
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

    // Deletes the photo and all selections associated with the photo
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

    // Take a photo with the pi, if configsSet, get a configured photo
    // Returns on success:
    // {"id": photo id}
    this.takePhotoWithPi = function(configsSet, successFn, failureFn) {
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
		    failureFn(data);
		$("#loading").hide();
		if (DEBUG)
		    alert("take photo error");
	    }
	});
    }

    // Upload a photo into our server
    // Returns on success:
    // {"id": photo id}
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

    /* AJAX view functions */

    // Save these notes associated with this photo
    // Returns on success:
    // {}
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

    // Make a selection from the given rectangle of the given photo
    // Returns on success:
    // {"path": path to the selection,
    // "id": selection id,
    // "width": original width of selection,
    // "height": original height of selection}
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
