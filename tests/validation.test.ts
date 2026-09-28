import { describe, expect, it } from "vitest";
import {
  persianCaptchaGenerator,
  type PersianCaptchaGeneratorOptions,
} from "../src/index";

// Loosened so tests can pass what untyped JS callers could.
const generate = (options: Record<string, unknown>) =>
  persianCaptchaGenerator(options as PersianCaptchaGeneratorOptions);

const bounds = [
  ["width", 50, 1000],
  ["height", 30, 500],
  ["length", 4, 10],
  ["fontSize", 10, 200],
  ["lineCount", 0, 50],
  ["dotCount", 0, 500],
] as const;

// A canvas big enough that bound tests on one option never trip another limit.
const roomy = { width: 1000, height: 300, fontSize: 20 };

describe("option validation", () => {
  describe.each(bounds)("%s", (name, min, max) => {
    it.each([min, max])("accepts %d", (value) => {
      expect(() => generate({ ...roomy, [name]: value })).not.toThrow();
    });

    it.each([min - 1, max + 1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
      "rejects %d with a RangeError naming the option and range",
      (value) => {
        expect(() => generate({ ...roomy, [name]: value })).toThrow(
          new RangeError(
            `${name} must be an integer from ${min} to ${max}, received ${value}`,
          ),
        );
      },
    );

    it("rejects non-numbers with a TypeError", () => {
      expect(() => generate({ ...roomy, [name]: "10" })).toThrow(TypeError);
    });
  });

  it.each(["backgroundColor", "textColor"])(
    "rejects a non-string %s",
    (name) => {
      expect(() => generate({ [name]: 0 })).toThrow(
        new TypeError(`${name} must be a string, received number`),
      );
    },
  );

  it("rejects an unknown characterSet", () => {
    expect(() => generate({ characterSet: "latin" })).toThrow(
      new TypeError(
        "characterSet must be one of numbers, alphabets, both, received latin",
      ),
    );
  });
});
