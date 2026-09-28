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
