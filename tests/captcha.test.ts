import { describe, expect, it } from "vitest";
import { persianCaptchaGenerator } from "../src/index";

describe("Captcha Generator", () => {
  it("should generate a captcha with Persian numbers", () => {
    const captcha = persianCaptchaGenerator({
      length: 6,
      characterSet: "numbers",
    });

    expect(captcha.text).toHaveLength(6);
    expect(captcha.text).toMatch(/^[۰-۹]+$/);
    expect(Buffer.isBuffer(captcha.imageBuffer)).toBe(true);
  });

  it("should generate a captcha with Persian alphabets", () => {
    const captcha = persianCaptchaGenerator({
      length: 6,
      characterSet: "alphabets",
    });

    expect(captcha.text).toHaveLength(6);
    expect(captcha.text).toMatch(/^[ابپتثجچحخدذرزژسشصضطظعغفقکگلمنهوی]+$/);
    expect(Buffer.isBuffer(captcha.imageBuffer)).toBe(true);
  });

  it("should generate a captcha with both Persian numbers and alphabets", () => {
    const captcha = persianCaptchaGenerator({
      length: 6,
      characterSet: "both",
    });

    expect(captcha.text).toHaveLength(6);
    expect(captcha.text).toMatch(/^[۰-۹ابپتثجچحخدذرزژسشصضطظعغفقکگلمنهوی]+$/);
    expect(Buffer.isBuffer(captcha.imageBuffer)).toBe(true);
  });

  it("never places two digits next to each other in mixed captchas", () => {
    const answers = Array.from(
      { length: 300 },
      () =>
        persianCaptchaGenerator({
          length: 10,
          width: 400,
          characterSet: "both",
        }).text,
    );

    for (const text of answers) expect(text).not.toMatch(/[۰-۹]{2}/);
    // Guards against the constraint degenerating into letters-only.
    expect(answers.join("")).toMatch(/[۰-۹]/);
  });

  it("renders a PNG of the requested size", () => {
    const { imageBuffer } = persianCaptchaGenerator({
      width: 321,
      height: 123,
    });

    expect(imageBuffer.subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
    // IHDR is always the first chunk: width and height follow its type tag.
    expect(imageBuffer.readUInt32BE(16)).toBe(321);
    expect(imageBuffer.readUInt32BE(20)).toBe(123);
  });

  it("uses documented defaults when called with no arguments", () => {
    const captcha = persianCaptchaGenerator();

    expect(captcha.text).toMatch(/^[۰-۹]{5}$/);
  });

  it("returns the result synchronously", () => {
    expect(persianCaptchaGenerator()).not.toBeInstanceOf(Promise);
  });

  it("keeps 1.x call sites that await the result working", async () => {
    const captcha = await persianCaptchaGenerator();

    expect(captcha.text).toHaveLength(5);
  });
});
