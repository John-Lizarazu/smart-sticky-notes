// === ELEMENT REFERENCES ===
const addBtn = document.getElementById("addBtn");
const groupBtn = document.getElementById("groupBtn");
const digestBtn = document.getElementById("digestBtn");
const modal = document.getElementById("noteModal");
const saveBtn = document.getElementById("saveNote");
const cancelBtn = document.getElementById("cancelNote");
const noteInput = document.getElementById("noteInput");
const notesContainer = document.getElementById("notes-container");

// === BACKEND URL ===
const API_BASE = "https://lfq9k0uldd.execute-api.us-east-1.amazonaws.com/Prod";

// === RENDER NOTES ON SCREEN ===
function renderNotes(notes = []) {
  notesContainer.innerHTML = "";

  if (!notes.length) {
    notesContainer.innerHTML = `<p class="empty">No notes yet. Click ＋ to add one!</p>`;
    return;
  }

  notes.forEach((n) => {
    const note = document.createElement("div");
    note.classList.add("note");
    note.textContent = n.text;
    note.onclick = () => deleteNote(n.id);
    notesContainer.appendChild(note);
  });
}

// === FETCH ALL NOTES ===
async function loadNotes() {
  try {
    const res = await fetch(`${API_BASE}/notes`);
    const data = await res.json();
    renderNotes(data);
  } catch (err) {
    console.error("Failed to load notes:", err);
  }
}

// === ADD A NEW NOTE ===
async function addNote() {
  const noteText = noteInput.value.trim();
  if (!noteText) return alert("Please write something!");

  const note = {
    id: Date.now().toString(),
    text: noteText,
    created_at: new Date().toISOString(),
    user: "demo-user",
  };

  try {
    await fetch(`${API_BASE}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });

    noteInput.value = "";
    modal.classList.add("hidden");
    await loadNotes(); // refresh notes after saving
  } catch (err) {
    console.error("Error adding note:", err);
  }
}

// === DELETE NOTE (OPTIONAL BACKEND FEATURE) ===
async function deleteNote(id) {
  if (!confirm("Delete this note?")) return;
  try {
    await fetch(`${API_BASE}/notes/${id}`, { method: "DELETE" });
    await loadNotes();
  } catch (err) {
    console.error("Error deleting note:", err);
  }
}

// === MODAL CONTROLS ===
addBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
  noteInput.focus();
});

cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  noteInput.value = "";
});

saveBtn.addEventListener("click", async () => {
  await addNote();
});

noteInput.addEventListener("keydown", async (e) => {
  if (e.key === "Escape") modal.classList.add("hidden");
  if (e.key === "Enter" && e.shiftKey) {
    e.preventDefault();
    await addNote();
  }
});

// === PLACEHOLDER BUTTONS ===
groupBtn.onclick = () => alert("✨ Grouping notes (agent feature coming soon!)");
digestBtn.onclick = () => alert("☀️ Daily Digest (coming soon!)");

// === INITIAL LOAD ===
document.addEventListener("DOMContentLoaded", loadNotes);
