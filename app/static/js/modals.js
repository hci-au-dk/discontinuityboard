$(function () {

    $("#overlay").hide();
    $(".modal").hide();

    $("#register-button").bind("click", function() {
	showModal($("#register-modal"), $("#overlay"));
    });

    $("#login-button").bind("click", function() {
	showModal($("#login-modal"), $("#overlay"));
    });

    $("#upload-modal-button").bind("click", function() { 
	showModal($("#upload-modal"), $("#overlay"));
    });

    $("#configure-button").bind("click", function() {
	showModal($("#configure-modal"), $("#overlay"));
	var loader = $(document.createElement("div"));
	loader.addClass("loading-icon");
	$("#configure-display").append(loader);

	if ($(".modal #photocontainer").length == 0) {
	    $("#configure-submit").attr("disabled", "true");
	    // we also want to load an unmodified picture from the pi
	    messenger.takePhotoWithPi(false, function(data) { 
		messenger.getPhoto(data.id, function(data) {
		    // set the hidden fields
		    $("#cwidth").val(data.width);
		    $("#cheight").val(data.width);
		    setNewPhotoConfigureView(data);
		    tools.cornerSelectClick($("#toolsdiv"), populateCoordinates);
		    $("#configure-submit").removeAttr("disabled");
		});
	    });
	}
    });

    // bind all modal closing buttons to the modal close function
    $(".modal-close").bind("click", function() {
	var $modal = getModalParent($(this));
	$modal.hide();
	$("#overlay").hide();
	$(window).unbind('resize.modal');
    });

});


function getModalParent($element) {
    var $parent = $($element.parent());
    while (!$parent.hasClass("modal")) {
	$parent = $($parent.parent());
    }
    return $parent;
}


function showModal($modal, $overlay) {
    // wrap the center method so it's bound to the displayed modal
    var centerMe = function() {
	center($modal);
    };

    $(window).bind("resize.modal", centerMe);
    $(window).trigger("resize.modal");

    $modal.show();
    $overlay.show();
}

function center($modal) {
    
   var top, left;

    top = Math.max($(window).height() - $modal.outerHeight(), 0) / 2;
    left = Math.max($(window).width() - $modal.outerWidth(), 0) / 2;

    $modal.css({
        top:top + $(window).scrollTop(), 
        left:left + $(window).scrollLeft()
    });
}

function populateCoordinates(e) {
    // Get the div that moved
    var corner = $(this);
    var x = corner.position().left;
    var y = corner.position().top;
    
    var cornerId = corner.attr("id");
    // depending on which div it is, we want different values for x and y
    var i = cornerId.substring(cornerId.length - 1);
    if (i == 3 || i == 2) {  // top right || bottom right
	x = x + corner.width();
    } 
    if (i == 1 || i == 2) {  // bottom left || bottom right
	y = y + corner.height();
    }

    // We want the "true" coordinates - immune to any resizing that happens
    $("#x" + i).attr("value", Math.round(x / currentPhotoRatio));
    $("#y" + i).attr("value", Math.round(y / currentPhotoRatio));
}
