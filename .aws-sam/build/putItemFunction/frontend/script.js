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

// local fallback in case backend is offline
let notes = [];

// === RENDER NOTES ===
function renderNotes() {
  notesContainer.innerHTML = "";
  if (!notes.length) {
    notesContainer.innerHTML = `<p class="empty">No notes yet. Click ＋ to add one!</p>`;
    return;
  }
  notes.forEach((note, index) => {
    const noteEl = document.createElement("div");
    noteEl.classList.add("note");
    noteEl.textContent = note.text || note; // supports both string and object
    noteEl.onclick = () => deleteNote(note.id || index);
    notesContainer.appendChild(noteEl);
  });
}

// === LOAD NOTES FROM BACKEND ===
async function loadNotes() {
  try {
    const res = await fetch(`${API_BASE}/notes`);
    const data = await res.json();
    notes = data || [];
    renderNotes();
  } catch (err) {
    console.error("Failed to load notes:", err);
    // fallback: load local storage notes if backend is unavailable
    notes = JSON.parse(localStorage.getItem("notes")) || [];
    renderNotes();
  }
}

// === SAVE NOTE (TO BACKEND + LOCAL FALLBACK) ===
saveBtn.onclick = async () => {
  const text = noteInput.value.trim();
  if (!text) return;

  const newNote = {
    id: Date.now().toString(),
    text,
    created_at: new Date().toISOString(),
    user: "demo-user",
  };

  // 1️⃣ Save to backend
  try {
    await fetch(`${API_BASE}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newNote),
    });
    console.log("✅ Sent to backend:", newNote);
  } catch (err) {
    console.warn("⚠️ Backend save failed, storing locally:", err);
  }

  // 2️⃣ Local copy (for immediate render)
  notes.push(newNote);
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes();

  // 3️⃣ Reset modal
  noteInput.value = "";
  modal.classList.add("hidden");
};

// === DELETE NOTE (OPTIONAL BACKEND SUPPORT) ===
async function deleteNote(id) {
  const confirmed = confirm("Delete this note?");
  if (!confirmed) return;

  // Remove locally
  notes = notes.filter((n) => n.id !== id);
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes();

  // Remove from backend
  try {
    await fetch(`${API_BASE}/notes/${id}`, { method: "DELETE" });
    console.log("🗑️ Deleted from backend:", id);
  } catch (err) {
    console.warn("⚠️ Backend delete failed:", err);
  }
}

// === MODAL + BUTTON CONTROLS ===
document.addEventListener("DOMContentLoaded", () => {
  // --- Modal ---
  addBtn.onclick = () => {
    modal.classList.remove("hidden");
    noteInput.focus();
  };

  cancelBtn.onclick = () => {
    modal.classList.add("hidden");
    noteInput.value = "";
  };

  saveBtn.onclick = async () => {
    await saveNoteToBackend();
  };

  // --- Group + Digest Buttons ---
  groupBtn.onclick = () => alert("✨ Grouping notes (agent feature coming soon!)");
  digestBtn.onclick = () => alert("☀️ Daily Digest (coming soon!)");

  // --- Initial Data Load ---
  loadNotes();
});
