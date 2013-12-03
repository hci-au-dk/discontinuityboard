$(function () {
	if (messenger == null) {
	    messenger = new Messenger();
	}
    var modals = new Modals($("#modal-overlay"));
    var tools = new ConfigTools();


    // these are for password reset. If a url comes in with a hash matching a modal id, display that modal
    modals.registerButtonAndHash($("#register-button"), "register-modal",
				 $("#register-modal"), modals);

    modals.registerButtonAndHash($("#login-button"), "login-modal",
				 $("#login-modal"), modals);

    modals.registerButtonAndHash($("#edit-pi-button"), "edit-pi-modal",
				 $("#edit-pi-modal"), modals);

    modals.registerButtonAndHash($("#upload-button"), "upload-modal",
				 $("#upload-modal"), modals);

    if (window.location.hash == "#configure-modal") {
	showConfigure(modals, tools);
    }
    $("#configure-button").bind("click", function() {
	    showConfigure(modals, tools);
	    window.location.hash = "#configure-modal";
    });



    modals.registerButtonAndHash($("#delete-pi-button"), "delete-pi-modal",
				 $("#delete-pi-modal"), modals);
});

function showConfigure(modals, tools) {
    modals.showModal($("#configure-modal"));

    if ($(".modal #photocontainer").length == 0) {
	$(".loading-icon").show();

        $("#configure-submit").attr("disabled", "true");
        // we also want to load an unmodified picture from the pi
        messenger.takePhotoWithPi(false,
				  function(data) {
            messenger.getPhoto(data.id, function(data) {
                // set the hidden fields
                $("#cwidth").val(data.width);
                $("#cheight").val(data.width);
		$(".loading-icon").hide();
                setNewPhotoConfigureView(data);
                tools.cornerSelectClick($("#toolsdiv"), populateCoordinates);
                $("#configure-submit").removeAttr("disabled");
            });
				  },
				  function() {
				      $(".loading-icon").hide();
				      window.location.reload();
				  });
    }
}

function populateCoordinates(e) {
    // Get the div that moved
    var corner = $(this);
    var x = corner.position().left;
    var y = corner.position().top;
    
    var cornerId = corner.attr("id");
    // depending on which div it is, we want different values for x and y
    var i = cornerId.substring(cornerId.length - 1);
    if (i == 3 || i == 2) { // top right || bottom right
        x = x + corner.width();
    }
    if (i == 1 || i == 2) { // bottom left || bottom right
        y = y + corner.height();
    }

    // We want the "true" coordinates - immune to any resizing that happens
    $("#x" + i).attr("value", Math.round(x / currentPhotoRatio));
    $("#y" + i).attr("value", Math.round(y / currentPhotoRatio));
}
