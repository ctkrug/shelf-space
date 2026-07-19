import { describe, expect, it } from "vitest";
import { clampOrbitState } from "../src/render/orbit.js";

describe("clampOrbitState", () => {
  it("keeps values already within the camera comfort range", () => {
    expect(clampOrbitState({ azimuth: 1, polar: 1.2, distance: 5 })).toEqual({ azimuth: 1, polar: 1.2, distance: 5 });
  });

  it("clamps zero, extreme, and negative zoom/elevation boundaries", () => {
    expect(clampOrbitState({ azimuth: 0, polar: 0, distance: 0 })).toMatchObject({ polar: 0.8, distance: 3.8 });
    expect(clampOrbitState({ azimuth: 0, polar: 99, distance: 99 })).toMatchObject({ polar: 1.65, distance: 8.5 });
    expect(clampOrbitState({ azimuth: -2, polar: -1, distance: -1 }).azimuth).toBe(-2);
  });
});
