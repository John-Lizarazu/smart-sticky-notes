// === GLOBAL ELEMENTS ===
const API_BASE = "https://lfq9k0uldd.execute-api.us-east-1.amazonaws.com/Prod";

document.addEventListener("DOMContentLoaded", () => {
  // --- UI ELEMENTS ---
  const addBtn = document.getElementById("addBtn");
  const groupBtn = document.getElementById("groupBtn");
  const digestBtn = document.getElementById("digestBtn");
  const modal = document.getElementById("noteModal");
  const saveBtn = document.getElementById("saveNote");
  const cancelBtn = document.getElementById("cancelNote");
  const noteInput = document.getElementById("noteInput");
  const notesContainer = document.getElementById("notes-container");

  // Local notes cache (for instant UI updates)
  let notes = [];

  // === RENDER NOTES ===
  function renderNotes() {
    notesContainer.innerHTML = "";
    if (!notes.length) {
      notesContainer.innerHTML = `<p class="empty">No notes yet. Click ＋ to add one!</p>`;
      return;
    }

    notes.forEach((note) => {
      const noteEl = document.createElement("div");
      noteEl.classList.add("note");
      noteEl.textContent = note.text || note;
      noteEl.onclick = () => deleteNote(note.id);
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
      notes = JSON.parse(localStorage.getItem("notes")) || [];
      renderNotes();
    }
  }

  // === SAVE NOTE TO BACKEND ===
  async function saveNote() {
    const text = noteInput.value.trim();
    if (!text) return alert("Please write something!");

    const newNote = {
      id: Date.now().toString(),
      text,
      created_at: new Date().toISOString(),
      user: "demo-user",
    };

    try {
      await fetch(`${API_BASE}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });
      console.log("✅ Saved to backend:", newNote);
    } catch (err) {
      console.warn("⚠️ Backend save failed, storing locally:", err);
    }

    // Update UI immediately
    notes.push(newNote);
    localStorage.setItem("notes", JSON.stringify(notes));
    renderNotes();

    // Reset modal
    noteInput.value = "";
    modal.classList.add("hidden");
  }

  // === DELETE NOTE ===
  async function deleteNote(id) {
    const confirmed = confirm("Delete this note?");
    if (!confirmed) return;

    notes = notes.filter((n) => n.id !== id);
    localStorage.setItem("notes", JSON.stringify(notes));
    renderNotes();

    try {
      await fetch(`${API_BASE}/notes/${id}`, { method: "DELETE" });
      console.log("🗑️ Deleted from backend:", id);
    } catch (err) {
      console.warn("⚠️ Backend delete failed:", err);
    }
  }

  // === MODAL + BUTTON LOGIC ===
  addBtn.onclick = () => {
    modal.classList.remove("hidden");
    noteInput.focus();
  };

  cancelBtn.onclick = () => {
    modal.classList.add("hidden");
    noteInput.value = "";
  };

  saveBtn.onclick = async () => {
    await saveNote();
  };

  // === KEYBOARD SHORTCUTS ===
  noteInput.addEventListener("keydown", async (e) => {
    if (e.key === "Escape") modal.classList.add("hidden");
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      await saveNote();
    }
  });

  // === PLACEHOLDER BUTTONS ===
  groupBtn.onclick = async () => {
  alert("✨ Grouping your notes — please wait...");

  try {
    const res = await fetch(`${API_BASE}/notes/group`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });

    const data = await res.json();
    console.log("🤖 AI Grouping Result:", data);

    const categories = data?.grouped?.categories;
    if (!categories || !Array.isArray(categories)) {
      alert("⚠️ AI grouping response didn’t contain valid categories. Check CloudWatch logs.");
      return;
    }

    // ✅ Clear old notes
    notesContainer.innerHTML = "";

    // === Create grouped layout ===
    const groupedWrapper = document.createElement("div");
    groupedWrapper.classList.add("grouped-wrapper");
    groupedWrapper.innerHTML = `<h2 style="margin-bottom:1rem;">🗂️ Grouped Notes</h2>`;

    categories.forEach((cat) => {
      const section = document.createElement("section");
      section.classList.add("category-section");
      section.style.marginBottom = "2rem";

      // Category title
      const title = document.createElement("h3");
      title.textContent = cat.topic;
      title.style.marginBottom = "1rem";
      title.style.color = "#333";

      // Notes grid under each category
      const grid = document.createElement("div");
      grid.classList.add("category-grid");
      grid.style.display = "grid";
      grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(200px, 1fr))";
      grid.style.gap = "1rem";

      cat.notes.forEach((noteText) => {
        const card = document.createElement("div");
        card.classList.add("note");
        card.textContent = noteText;
        card.style.background = "white";
        card.style.borderRadius = "10px";
        card.style.padding = "1rem";
        card.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
        card.style.cursor = "pointer";
        card.onclick = () => alert(`📝 ${noteText}`);
        grid.appendChild(card);
      });

      section.appendChild(title);
      section.appendChild(grid);
      groupedWrapper.appendChild(section);
    });

    notesContainer.appendChild(groupedWrapper);
    alert("✅ Grouping complete! Scroll down to view grouped sticky notes.");
  } catch (err) {
    console.error("Group Notes error:", err);
    alert("❌ Failed to group notes — check console for details.");
  }
};

  digestBtn.onclick = () => alert("☀️ Daily Digest (coming soon!)");

  // === INITIAL LOAD ===
  loadNotes();
});
