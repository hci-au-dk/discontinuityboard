$(function () {
    var modals = new Modals($("#modal-overlay"));

    $("#set-up-pi-button").bind("click", function() { 
	modals.showModal($("#set-up-modal"));
    });

    $("#register-button").bind("click", function() {
	modals.closeModal($("#set-up-modal"));
	modals.showModal($("#register-modal"));
    });

    $("#login-button").bind("click", function() {
	modals.closeModal($("#set-up-modal"));
	modals.showModal($("#login-modal"));
    });
    
    $("#upload-button").bind("click", function() {
	modals.showModal($("#upload-modal"));
    });

    $(".step1-submit").bind("click", function() {
	modals.showModal($("configure-modal"));
    });
});
