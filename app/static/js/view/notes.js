var Notes = function() {
}


Notes.prototype.saveContent = function() {
    var content = tinyMCE.activeEditor.getContent();
    messenger.saveNotes(currentPhotoId, content, function(data) {
	$("#save-notes-button").html("Saved")
    });
}

Notes.prototype.exportContent = function(e) {
    var kind = $(this).attr("id");
    kind = kind.substring(kind.indexOf("-") + 1);
    messenger.exportNotes(currentPhotoId, kind);
}

Notes.prototype.watchNotes = function(e) {
    alert("change!");
}


$(function () {
    var notes = new Notes();
    $("#save-notes-button").bind("click", notes.saveContent);

    $(".export-notes-button").bind("click", notes.exportContent);

    $("#notes").bind("change", notes.watchNotes);
});
