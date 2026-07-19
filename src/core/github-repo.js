const GITHUB_REPO_URL = /^https?:\/\/(?:www\.)?github\.com\/([^/\s]+)\/([^/#?\s]+)\/?(?:[#?].*)?$/i;

/** Parses a public GitHub repository URL without accepting arbitrary URLs. */
export function parseGitHubRepoUrl(value) {
  const match = String(value ?? "").trim().match(GITHUB_REPO_URL);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/i, "") };
}

function isTextFile(path) {
  return /\.(txt|md|markdown|js|jsx|ts|tsx|json|css|html|yml|yaml|py|rb|go|rs|java|c|cpp|h|sh)$/i.test(path);
}

/**
 * Flattens text files from a public GitHub repository using the Git Trees and
 * Contents APIs. It has a conservative file cap so a giant repository cannot
 * freeze the browser or produce an unshareable paste.
 */
export async function fetchPublicRepoText(repoUrl, fetchImpl = globalThis.fetch) {
  const repo = parseGitHubRepoUrl(repoUrl);
  if (!repo) return { ok: false, error: "Paste a public GitHub repository URL." };

  const base = `https://api.github.com/repos/${repo.owner}/${repo.repo}`;
  let treeResponse;
  try {
    treeResponse = await fetchImpl(`${base}/git/trees/HEAD?recursive=1`);
  } catch {
    return { ok: false, error: "GitHub could not be reached. Try again shortly." };
  }
  if (treeResponse.status === 404) return { ok: false, error: "That public repository was not found." };
  if (!treeResponse.ok) return { ok: false, error: "GitHub could not load that repository." };

  const tree = await treeResponse.json();
  const files = (tree.tree ?? []).filter((item) => item.type === "blob" && isTextFile(item.path)).slice(0, 80);
  if (files.length === 0) return { ok: false, error: "No supported text files were found in that repository." };

  try {
    const contents = await Promise.all(files.map(async (file) => {
      const response = await fetchImpl(`${base}/contents/${encodeURIComponent(file.path)}?ref=HEAD`);
      if (!response.ok) return "";
      const content = await response.json();
      if (content.encoding !== "base64" || typeof content.content !== "string") return "";
      return `\n\n// ${file.path}\n${globalThis.atob(content.content.replace(/\n/g, ""))}`;
    }));
    const text = contents.join("");
    return text.trim() ? { ok: true, text, fileCount: files.length } : { ok: false, error: "GitHub returned no readable text files." };
  } catch {
    return { ok: false, error: "GitHub could not read the repository files." };
  }
}
