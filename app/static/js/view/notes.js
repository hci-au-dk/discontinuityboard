var Notes = function() {
}


Notes.prototype.saveContent = function() {
    var content = tinyMCE.activeEditor.getContent();
    messenger.saveNotes(currentPhotoId, content, function(data) {
	    $("#save-notes-button").html("Saved");
    });
}

Notes.prototype.exportContent = function() {
    var content = tinyMCE.activeEditor.getContent();
    messenger.saveNotes(currentPhotoId, content, function(data) {
	    $("#save-notes-button").html("Saved");
	    window.location = $("#export-link").attr("href");
    });
}


$(function () {
    var notes = new Notes();
    $("#save-notes-button").bind("click", notes.saveContent);
    $("#export-pdf-button").bind("click", notes.exportContent);

});
