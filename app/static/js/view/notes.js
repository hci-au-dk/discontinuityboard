var Notes = function() {
}


Notes.prototype.saveContent = function() {
    var content = tinyMCE.activeEditor.getContent();
    messenger.saveNotes(currentPhotoId, content);
}

Notes.prototype.exportContent = function(e) {
    var kind = $(this).attr("id");
}

$(function () {
    var notes = new Notes();
    $("#save-notes-button").bind("click", notes.saveContent);

    $(".export-notes-button").bind("click", notes.exportContent);
});
