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

const API_BASE = "https://lfq9k0uldd.execute-api.us-east-1.amazonaws.com/Prod";

// Create a new note
async function addNote() {
  const noteText = document.getElementById("noteInput").value.trim();
  if (!noteText) return alert("Please write something!");

  const note = {
    id: Date.now().toString(),
    text: noteText,
    created_at: new Date().toISOString(),
    user: "demo-user",
  };

  await fetch(`${API_BASE}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });

  document.getElementById("noteInput").value = "";
  await loadNotes();
}

// Get all notes
async function loadNotes() {
  const res = await fetch(`${API_BASE}/notes`);
  const data = await res.json();
  renderNotes(data);
}

// Load all notes when the page first loads
document.addEventListener("DOMContentLoaded", () => {
  loadNotes(); // fetch notes from your API Gateway backend
});

// --- Modal Controls ---
const addBtn = document.getElementById("addBtn");
const modal = document.getElementById("noteModal");
const cancelNote = document.getElementById("cancelNote");
const saveNote = document.getElementById("saveNote");

addBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

cancelNote.addEventListener("click", () => {
  modal.classList.add("hidden");
});

saveNote.addEventListener("click", async () => {
  await addNote();  // calls the addNote() function we defined earlier
  modal.classList.add("hidden");
});

document.getElementById("noteInput").addEventListener("keydown", async (e) => {
  if (e.key === "Escape") modal.classList.add("hidden");
  if (e.key === "Enter" && e.shiftKey) {
    e.preventDefault();
    await addNote();
    modal.classList.add("hidden");
  }
});

groupBtn.onclick = () => alert("✨ Grouping notes (agent feature coming soon!)");
digestBtn.onclick = () => alert("☀️ Daily Digest (coming soon!)");

renderNotes();
