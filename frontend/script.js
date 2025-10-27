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

  let notes = [];
  let groupedCategories = null; // persist grouping

  // === RENDER DEFAULT NOTES ===
  function renderNotes() {
    if (groupedCategories) {
      renderGroupedAndUngrouped();
      return;
    }

    notesContainer.innerHTML = "";
    if (!notes.length) {
      notesContainer.innerHTML = `<p class="empty">No notes yet. Click ＋ to add one!</p>`;
      return;
    }

    const grid = document.createElement("div");
    grid.classList.add("note-grid");
    grid.style.display = "flex";
    grid.style.flexWrap = "wrap";
    grid.style.justifyContent = "center";
    grid.style.gap = "1rem";

    notes.forEach((note) => {
      const noteEl = document.createElement("div");
      noteEl.classList.add("note");
      noteEl.textContent = note.text;
      noteEl.onclick = () => deleteNote(note.id);
      grid.appendChild(noteEl);
    });

    notesContainer.appendChild(grid);
  }

  // === RENDER GROUPED + NEW NOTES ===
  function renderGroupedAndUngrouped() {
    notesContainer.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.classList.add("hybrid-wrapper");

    // --- GROUPED HEADER ---
    const groupedHeader = document.createElement("h2");
    groupedHeader.textContent = "🗂️ Grouped Notes";
    groupedHeader.classList.add("section-title");
    wrapper.appendChild(groupedHeader);

    // --- GROUPED CATEGORIES ---
    const groupedRow = document.createElement("div");
    groupedRow.classList.add("grouped-row");

    groupedCategories.forEach((cat) => {
      const col = document.createElement("div");
      col.classList.add("category-col");

      const title = document.createElement("h3");
      title.textContent = cat.topic;
      col.appendChild(title);

      const grid = document.createElement("div");
      grid.classList.add("note-grid");
      cat.notes.forEach((noteText) => {
        const card = document.createElement("div");
        card.classList.add("note");
        card.textContent = noteText;
        grid.appendChild(card);
      });

      col.appendChild(grid);
      groupedRow.appendChild(col);
    });

    wrapper.appendChild(groupedRow);

    // --- NEW NOTES ROW ---
    const groupedTexts = new Set(groupedCategories.flatMap((c) => c.notes));
    const ungroupedNotes = notes.filter((n) => !groupedTexts.has(n.text));

    if (ungroupedNotes.length) {
      const newHeader = document.createElement("h2");
      newHeader.textContent = "New Notes";
      newHeader.classList.add("section-title");
      wrapper.appendChild(newHeader);

      const newNotesRow = document.createElement("div");
      newNotesRow.classList.add("new-notes-row");

      ungroupedNotes.forEach((note) => {
        const noteEl = document.createElement("div");
        noteEl.classList.add("note");
        noteEl.textContent = note.text;
        newNotesRow.appendChild(noteEl);
      });

      wrapper.appendChild(newNotesRow);
    }

    notesContainer.appendChild(wrapper);
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

  // === SAVE NOTE ===
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

    notes.push(newNote);
    localStorage.setItem("notes", JSON.stringify(notes));

    // If grouped view is active, refresh hybrid layout
    if (groupedCategories) renderGroupedAndUngrouped();
    else renderNotes();

    noteInput.value = "";
    modal.classList.add("hidden");
  }

  // === DELETE NOTE ===
async function deleteNote(id) {
  const confirmed = confirm("Delete this note?");
  if (!confirmed) return;

  // Remove from both grouped + ungrouped if found
  notes = notes.filter((n) => n.id !== id);

  if (groupedCategories) {
    groupedCategories.forEach((cat) => {
      cat.notes = cat.notes.filter((text) => text.id !== id && text !== id);
    });
  }

  localStorage.setItem("notes", JSON.stringify(notes));
  renderGroupedAndUngrouped();

  try {
    await fetch(`${API_BASE}/notes/${id}`, { method: "DELETE" });
    console.log("🗑️ Deleted from backend:", id);
  } catch (err) {
    console.warn("⚠️ Backend delete failed:", err);
  }
}

  // === MODAL HANDLING ===
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

  // === SHORTCUTS ===
  noteInput.addEventListener("keydown", async (e) => {
    if (e.key === "Escape") modal.classList.add("hidden");
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      await saveNote();
    }
  });

  // === GROUP NOTES ===
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

    // Handle flexible API shapes (data.grouped or data.groups)
    const categories =
      data?.grouped?.categories ||
      data?.categories ||
      data?.groups ||
      null;

    if (!categories || !Array.isArray(categories)) {
      alert("⚠️ AI grouping response didn’t contain valid categories. Check CloudWatch logs.");
      return;
    }

    // Store grouped categories
    groupedCategories = categories;

    // Remove grouped notes from main list
    const groupedTexts = new Set(
      categories.flatMap((c) => c.notes.map((t) => t.toLowerCase()))
    );
    notes = notes.filter((n) => !groupedTexts.has(n.text.toLowerCase()));
    localStorage.setItem("notes", JSON.stringify(notes));

    renderGroupedAndUngrouped();
    alert("✅ Grouping complete!");
  } catch (err) {
    console.error("Group Notes error:", err);
    alert("❌ Failed to group notes — check console for details.");
  }
};

  digestBtn.onclick = () => alert("☀️ Daily Digest (coming soon!)");

  // === INITIAL LOAD ===
  loadNotes();
});
