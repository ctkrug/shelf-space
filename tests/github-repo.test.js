import { describe, expect, it, vi } from "vitest";
import { fetchPublicRepoText, parseGitHubRepoUrl } from "../src/core/github-repo.js";

describe("parseGitHubRepoUrl", () => {
  it("extracts owner and repo from public GitHub URLs", () => {
    expect(parseGitHubRepoUrl("https://github.com/octo/demo.git")).toEqual({ owner: "octo", repo: "demo" });
  });

  it("rejects empty, malformed, and non-GitHub URLs", () => {
    expect(parseGitHubRepoUrl("")).toBeNull();
    expect(parseGitHubRepoUrl("github.com/octo/demo")).toBeNull();
    expect(parseGitHubRepoUrl("https://example.com/octo/demo")).toBeNull();
  });
});

describe("fetchPublicRepoText", () => {
  it("concatenates supported files from the repository tree", async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tree: [{ type: "blob", path: "src/a.js" }, { type: "blob", path: "logo.png" }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ encoding: "base64", content: "Y29uc29sZS5sb2coJ2hpJyk7" }) });
    await expect(fetchPublicRepoText("https://github.com/octo/demo", fetchImpl)).resolves.toMatchObject({ ok: true, fileCount: 1, text: expect.stringContaining("src/a.js") });
  });

  it("returns designed errors for bad URLs, missing repos, and network failures", async () => {
    await expect(fetchPublicRepoText("nope", vi.fn())).resolves.toMatchObject({ ok: false });
    await expect(fetchPublicRepoText("https://github.com/octo/demo", vi.fn().mockResolvedValue({ ok: false, status: 404 }))).resolves.toMatchObject({ ok: false, error: expect.stringContaining("not found") });
    await expect(fetchPublicRepoText("https://github.com/octo/demo", vi.fn().mockRejectedValue(new Error("offline")))).resolves.toMatchObject({ ok: false, error: expect.stringContaining("reached") });
  });
});
