import { describe, expect, it } from "vitest";
import { framingFor } from "../src/render/scene.js";

describe("framingFor", () => {
  it("keeps a finite, wider framing for portrait viewports", () => {
    const desktop = framingFor(16 / 9);
    const phone = framingFor(390 / 844);

    expect(phone.vFovDeg).toBeGreaterThan(desktop.vFovDeg);
    expect(phone.distance).toBeGreaterThanOrEqual(desktop.distance);
    expect(phone).toEqual(expect.objectContaining({ vFovDeg: expect.any(Number), distance: expect.any(Number) }));
  });

  it("falls back to desktop framing for zero or invalid layout dimensions", () => {
    expect(framingFor(0)).toEqual(framingFor(16 / 9));
    expect(framingFor(Number.NaN)).toEqual(framingFor(16 / 9));
  });
});
