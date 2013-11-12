$(function () {
    var modals = new Modals($("#modal-overlay"));

    $("#photo-view-button").bind("click", function() { 
	modals.showModal($("#photo-view-modal"));
    });

    // trigger a photo view event if there is no user
    if (window.location.pathname == "/") {
	modals.showModal($("#photo-view-modal"));
    }
});
