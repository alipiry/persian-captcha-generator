import { persianCaptchaGenerator } from "../index";

describe("Captcha Generator", () => {
  it("should generate a captcha with Persian numbers", async () => {
    const captcha = await persianCaptchaGenerator({
      length: 6,
      characterSet: "numbers",
    });

    expect(captcha.text).toHaveLength(6);
    expect(captcha.text).toMatch(/^[۰-۹]+$/);
    expect(Buffer.isBuffer(captcha.imageBuffer)).toBe(true);
  });

  it("should generate a captcha with Persian alphabets", async () => {
    const captcha = await persianCaptchaGenerator({
      length: 6,
      characterSet: "alphabets",
    });

    expect(captcha.text).toHaveLength(6);
    expect(captcha.text).toMatch(/^[ابپتثجچحخدذرزژسشصضطظعغفقکگلمنهوی]+$/);
    expect(Buffer.isBuffer(captcha.imageBuffer)).toBe(true);
  });

  it("should generate a captcha with both Persian numbers and alphabets", async () => {
    const captcha = await persianCaptchaGenerator({
      length: 6,
      characterSet: "both",
    });

    expect(captcha.text).toHaveLength(6);
    expect(captcha.text).toMatch(/^[۰-۹ابپتثجچحخدذرزژسشصضطظعغفقکگلمنهوی]+$/);
    expect(Buffer.isBuffer(captcha.imageBuffer)).toBe(true);
  });
});
