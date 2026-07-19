const TEXT_FILE_TYPES = new Set(["text/plain", "text/markdown"]);

/**
 * Validates a browser File before reading it into Shelf Space. File names are
 * included because several browsers omit File.type for ordinary .txt files.
 */
export function validateTextFile(file) {
  if (!file || typeof file.name !== "string") {
    return { ok: false, error: "Choose a .txt file to stack." };
  }

  const isTextName = /\.(txt|md|markdown)$/i.test(file.name);
  if (!isTextName && !TEXT_FILE_TYPES.has(file.type)) {
    return { ok: false, error: "That file is not plain text. Drop a .txt file instead." };
  }
  if (file.size === 0) return { ok: false, error: "That text file is empty." };

  return { ok: true };
}

/** Reads validated text files and turns browser read failures into UI-safe errors. */
export async function readTextFile(file) {
  const validation = validateTextFile(file);
  if (!validation.ok) return validation;

  try {
    return { ok: true, text: await file.text() };
  } catch {
    return { ok: false, error: "Shelf Space could not read that file. Try another .txt file." };
  }
}
