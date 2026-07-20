import { readTextFile } from "../core/file-input.js";
import { fetchPublicRepoText, parseGitHubRepoUrl } from "../core/github-repo.js";

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
export function initPastePanel({ onInput, onCloseInspector }) {
  const textarea = document.getElementById("paste-input");
  const clearBtn = document.getElementById("clear-btn");
  const charCount = document.getElementById("char-count");
  const readout = document.getElementById("readout");
  const panelToggle = document.getElementById("panel-toggle");
  const dropZone = document.getElementById("drop-zone");
  const filePicker = document.getElementById("file-picker");
  const fileInput = document.getElementById("file-input");
  const inputMessage = document.getElementById("input-message");
  const inspector = document.getElementById("book-inspector");
  const inspectorKicker = document.getElementById("inspector-kicker");
  const inspectorTitle = document.getElementById("inspector-title");
  const inspectorRange = document.getElementById("inspector-range");
  const inspectorText = document.getElementById("inspector-text");
  const inspectorClose = document.getElementById("inspector-close");

  let debounceTimer = null;

  function renderCharCount(text) {
    charCount.textContent = `${formatCount(text.length)} character${text.length === 1 ? "" : "s"}`;
  }

  async function emit() {
    let text = textarea.value;
    renderCharCount(text);
    if (parseGitHubRepoUrl(text)) {
      showInputMessage("Loading public repository…");
      const result = await fetchPublicRepoText(text);
      if (!result.ok) {
        showInputMessage(result.error, true);
        return;
      }
      text = result.text;
      textarea.value = text;
      renderCharCount(text);
      showInputMessage(`Loaded ${result.fileCount} text files from GitHub.`);
    }
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

  inspectorClose.addEventListener("click", () => onCloseInspector?.());

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

  function renderInspector(source) {
    if (!source) {
      inspector.hidden = true;
      return;
    }
    inspectorKicker.textContent = `${source.modelLabel} · ${source.location}`;
    inspectorTitle.textContent = `Book ${source.bookNumber} of ${formatCount(source.totalBooks)}`;
    inspectorRange.textContent = `Characters ${formatCount(source.start + 1)}–${formatCount(source.end)}`;
    inspectorText.textContent = source.text || "This book represents a source interval smaller than one character.";
    inspector.hidden = false;
    inspectorClose.focus();
  }

  function setText(text) {
    textarea.value = text;
    renderCharCount(text);
    onInput(text);
  }

  return { renderReadout, renderInspector, setText, showInputMessage };
}
