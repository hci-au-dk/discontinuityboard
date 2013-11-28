var Notes = function() {
}


Notes.prototype.saveContent = function() {
    var content = tinyMCE.activeEditor.getContent();
    messenger.saveNotes(currentPhotoId, content, function(data) {
	$("#save-notes-button").html("Saved")
    });
}


$(function () {
    var notes = new Notes();
    $("#save-notes-button").bind("click", notes.saveContent);b
});
