var Modals = function($overlay) {
    this.$overlay = $overlay;
    this.$overlay.hide();
    $(".modal").hide();

    $(".modal-close").bind("click", function(e) {
	// We need to separate these things because this
	// refers to parts of the event that occurred, not the Modals
	// object
	$overlay.hide();
	Modals.prototype.close(e)
    });

};

Modals.prototype.showModal = function($modal) {
    // wrap the center method so it's bound to the displayed modal
    var centerMe = function() {
	Modals.prototype.center($modal);
    };

    $(window).bind("resize.modal", centerMe);
    $(window).trigger("resize.modal");
    
    $modal.show();
    this.$overlay.show();
};

Modals.prototype.close = function(e) {
    var $modal = Modals.prototype.getModalParent($(e.target));
    $modal.hide();
    $(window).unbind('resize.modal');
}

Modals.prototype.closeModal = function($modal) {
    $modal.hide();
    $(window).unbind('resize.modal');
}

Modals.prototype.center = function($modal) {
    var top, left;
    
    top = Math.max($(window).height() - $modal.outerHeight(), 0) / 2;
    left = Math.max($(window).width() - $modal.outerWidth(), 0) / 2;
    
    $modal.css({
        top:top + $(window).scrollTop(), 
        left:left + $(window).scrollLeft()
    });
};

Modals.prototype.getModalParent = function($element) {
    var $parent = $($element.parent());
    while (!$parent.hasClass("modal")) {
	$parent = $($parent.parent());
    }
    return $parent;
}
