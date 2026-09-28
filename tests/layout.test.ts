// Tested below the public API on purpose: reading order is a property of
// glyph positions, and asserting it through rendered pixels would need
// per-glyph OCR.
import { describe, expect, it } from "vitest";
import { glyphCenters } from "../src/layout";

const base = { length: 5, width: 200, height: 100, fontSize: 40 };

describe("glyphCenters", () => {
  it("puts the first answer character leftmost for digits", () => {
    const xs = glyphCenters({ ...base, rtl: false });

    expect(xs).toEqual([...xs].sort((a, b) => a - b));
  });

  it("puts the first answer character rightmost for Persian letters", () => {
    const xs = glyphCenters({ ...base, rtl: true });

    expect(xs).toEqual([...xs].sort((a, b) => b - a));
  });

  it.each([4, 7, 10])("centers %d characters on the canvas", (length) => {
    const xs = glyphCenters({ ...base, length, width: 400, rtl: false });

    expect((xs[0] + xs[length - 1]) / 2).toBeCloseTo(200);
  });

  it("rejects text wider than the canvas", () => {
    expect(() =>
      glyphCenters({ ...base, length: 10, width: 200, rtl: true }),
    ).toThrow(
      new RangeError(
        "10 characters at fontSize 40 need a width of at least 310, received 200",
      ),
    );
  });

  it("rejects text taller than the canvas", () => {
    expect(() => glyphCenters({ ...base, height: 40, rtl: true })).toThrow(
      new RangeError("fontSize 40 needs a height of at least 48, received 40"),
    );
  });
});
