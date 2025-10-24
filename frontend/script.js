const addBtn = document.getElementById("addBtn");
const groupBtn = document.getElementById("groupBtn");
const digestBtn = document.getElementById("digestBtn");
const modal = document.getElementById("noteModal");
const saveBtn = document.getElementById("saveNote");
const cancelBtn = document.getElementById("cancelNote");
const noteInput = document.getElementById("noteInput");
const notesContainer = document.getElementById("notes-container");

let notes = JSON.parse(localStorage.getItem("notes")) || [];

function renderNotes() {
  notesContainer.innerHTML = "";
  notes.forEach((text, index) => {
    const note = document.createElement("div");
    note.classList.add("note");
    note.textContent = text;
    note.onclick = () => deleteNote(index);
    notesContainer.appendChild(note);
  });
}

function deleteNote(index) {
  if (confirm("Delete this note?")) {
    notes.splice(index, 1);
    saveNotes();
  }
}

function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes();
}

addBtn.onclick = () => {
  modal.classList.remove("hidden");
  noteInput.focus();
};

cancelBtn.onclick = () => {
  modal.classList.add("hidden");
  noteInput.value = "";
};

saveBtn.onclick = () => {
  const text = noteInput.value.trim();
  if (text) {
    notes.push(text);
    saveNotes();
    noteInput.value = "";
    modal.classList.add("hidden");
  }
};

groupBtn.onclick = () => alert("✨ Grouping notes (agent feature coming soon!)");
digestBtn.onclick = () => alert("☀️ Daily Digest (coming soon!)");

renderNotes();
