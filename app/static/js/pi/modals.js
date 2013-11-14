$(function () {
    var modals = new Modals($("#modal-overlay"));
    var tools = new ConfigTools();

    $("#register-button").bind("click", function() {
	modals.showModal($("#register-modal"));
    });

    $("#login-button").bind("click", function() {
	modals.showModal($("#login-modal"))
    });
    
    $("#upload-button").bind("click", function() {
	modals.showModal($("#upload-modal"));
    });

    $("#configure-button").bind("click", function() {
	showConfigure(modals, tools);
    });

});

function showConfigure(modals, tools) {
    modals.showModal($("#configure-modal"));

    if ($(".modal #photocontainer").length == 0) {
	$(".loading-icon").show();

        $("#configure-submit").attr("disabled", "true");
        // we also want to load an unmodified picture from the pi
        messenger.takePhotoWithPi(false, function(data) {
            messenger.getPhoto(data.id, function(data) {
                // set the hidden fields
                $("#cwidth").val(data.width);
                $("#cheight").val(data.width);
		$(".loading-icon").hide();
                setNewPhotoConfigureView(data);
                tools.cornerSelectClick($("#toolsdiv"), populateCoordinates);
                $("#configure-submit").removeAttr("disabled");
            });
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
