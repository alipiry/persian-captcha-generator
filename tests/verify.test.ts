import { describe, expect, it } from "vitest";
import { verifyCaptcha } from "../src/index";

describe("verifyCaptcha", () => {
  it("accepts the exact answer", () => {
    expect(verifyCaptcha("کی۱۲", "کی۱۲")).toBe(true);
  });

  it.each([
    ["Arabic yeh", "بی", "بي"],
    ["Arabic alef maksura", "بی", "بى"],
    ["Arabic kaf", "کب", "كب"],
    ["ASCII digits", "۰۱۲۳۴۵۶۷۸۹", "0123456789"],
    ["Arabic-Indic digits", "۰۱۲۳۴۵۶۷۸۹", "٠١٢٣٤٥٦٧٨٩"],
    ["surrounding and inner whitespace", "ابپت", "  اب پت\n"],
    ["zero-width joiners", "ابپت", "ا‌ب‍پت"],
  ])("accepts %s as equivalent", (_, expected, input) => {
    expect(verifyCaptcha(expected, input)).toBe(true);
  });

  it.each([
    ["a wrong character", "ابپت", "ابپث"],
    ["a reversed answer", "ابپت", "تپبا"],
    ["a shorter answer", "ابپت", "ابپ"],
    ["a longer answer", "ابپت", "ابپتت"],
    ["an empty answer", "ابپت", ""],
    ["a whitespace-only answer", "ابپت", "   "],
  ])("rejects %s", (_, expected, input) => {
    expect(verifyCaptcha(expected, input)).toBe(false);
  });

  it.each([undefined, null, 1234, ["ابپت"]])(
    "rejects non-string input %j without throwing",
    (input) => {
      expect(verifyCaptcha("ابپت", input)).toBe(false);
    },
  );

  it("never accepts an empty expected answer", () => {
    expect(verifyCaptcha("", "")).toBe(false);
  });
});
