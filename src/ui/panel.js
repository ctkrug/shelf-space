const DEBOUNCE_MS = 120;

function formatCount(n) {
  return n.toLocaleString("en-US");
}

/**
 * Wires the paste textarea, clear button, and mobile bottom-sheet
 * toggle. Calls `onInput(text)` (debounced) whenever the text changes,
 * and exposes `renderReadout` for the caller to push shelf states back
 * into the per-model legend.
 */
export function initPastePanel({ onInput }) {
  const textarea = document.getElementById("paste-input");
  const clearBtn = document.getElementById("clear-btn");
  const charCount = document.getElementById("char-count");
  const readout = document.getElementById("readout");
  const panelToggle = document.getElementById("panel-toggle");
  const dropZone = document.getElementById("drop-zone");
  const filePicker = document.getElementById("file-picker");
  const fileInput = document.getElementById("file-input");
  const inputMessage = document.getElementById("input-message");

  let debounceTimer = null;

  function emit() {
    const text = textarea.value;
    charCount.textContent = `${formatCount(text.length)} character${text.length === 1 ? "" : "s"}`;
    onInput(text);
  }

  function scheduleEmit() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(emit, DEBOUNCE_MS);
  }

  textarea.addEventListener("input", scheduleEmit);

  function showInputMessage(message, isError = false) {
    inputMessage.textContent = message;
    inputMessage.classList.toggle("is-error", isError);
  }

  async function loadFile(file) {
    const result = await readTextFile(file);
    if (!result.ok) {
      showInputMessage(result.error, true);
      return;
    }
    textarea.value = result.text;
    showInputMessage(`Loaded ${file.name}.`);
    emit();
  }

  filePicker.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    if (fileInput.files?.[0]) loadFile(fileInput.files[0]);
    fileInput.value = "";
  });
  dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("is-dragging");
  });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("is-dragging"));
  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("is-dragging");
    loadFile(event.dataTransfer?.files?.[0]);
  });
  dropZone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fileInput.click();
    }
  });

  clearBtn.addEventListener("click", () => {
    textarea.value = "";
    emit();
    textarea.focus();
  });

  panelToggle.addEventListener("click", () => {
    const expanded = panelToggle.getAttribute("aria-expanded") === "true";
    panelToggle.setAttribute("aria-expanded", String(!expanded));
  });

  // Start collapsed on narrow (bottom-sheet) layouts so the shelves stay
  // the hero on first load; desktop's toggle is hidden by CSS anyway.
  if (window.matchMedia("(max-width: 768px)").matches) {
    panelToggle.setAttribute("aria-expanded", "false");
  }

  function renderReadout(shelfStatesByModelId, models) {
    readout.innerHTML = "";
    for (const model of models) {
      const state = shelfStatesByModelId[model.id];
      const li = document.createElement("li");
      li.className = "readout-row";
      if (state.overflowing) li.classList.add("is-overflowing");
      else if (state.totalBooks === 0) li.classList.add("is-empty");

      const label = document.createElement("span");
      label.className = "readout-label";
      label.textContent = model.label;

      const count = document.createElement("span");
      count.className = "readout-count";
      count.textContent = state.overflowing
        ? `${formatCount(state.tokens)} tok · ${formatCount(state.booksOnFloor)} on floor`
        : `${formatCount(state.tokens)} tok · ${state.booksOnShelf}/${state.shelfCapacityBooks} books`;

      li.append(label, count);
      readout.appendChild(li);
    }
  }

  return { renderReadout };
}
import { readTextFile } from "../core/file-input.js";
