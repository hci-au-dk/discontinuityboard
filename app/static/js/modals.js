$(function () {

    $("#overlay").hide();
    $("#register-modal").hide();
    $("#login-modal").hide();

    $("#register-button").bind("click", function() {
	showModal($("#register-modal"), $("#overlay"));
    });

    $("#login-button").bind("click", function() {
	showModal($("#login-modal"), $("#overlay"));
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
