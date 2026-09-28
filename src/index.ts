import { randomInt } from "crypto";
import path from "path";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";

export interface PersianCaptchaGeneratorOptions {
  width?: number;
  height?: number;
  length?: number;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  lineCount?: number;
  dotCount?: number;
  characterSet?: CharacterSet;
}

const CHARACTER_SETS = ["numbers", "alphabets", "both"] as const;
type CharacterSet = (typeof CHARACTER_SETS)[number];

// Caps keep option values that leak in from a request from allocating
// huge canvases or burning CPU; the length floor keeps captchas unguessable.
const INTEGER_BOUNDS = {
  width: [50, 1000],
  height: [30, 500],
  length: [4, 10],
  fontSize: [10, 200],
  lineCount: [0, 50],
  dotCount: [0, 500],
} as const satisfies Record<string, readonly [number, number]>;

export interface PersianCaptcha {
  /** The answer, in the order a human reads and types it. */
  text: string;
  imageBuffer: Buffer;
}

const FONT_FAMILY = "BNazanin";
// Resolves from both src (tests) and dist (published), which sit at the same depth.
const FONT_PATH = path.resolve(__dirname, "..", "fonts", "BNazanin.ttf");

let fontRegistered = false;

function ensureFontRegistered() {
  if (fontRegistered) return;
  // Returns null instead of throwing, so a missing or corrupt font would
  // otherwise silently fall back to a system font.
  if (!GlobalFonts.registerFromPath(FONT_PATH, FONT_FAMILY)) {
    throw new Error(`Failed to load captcha font from ${FONT_PATH}`);
  }
  fontRegistered = true;
}

const PERSIAN_ALPHABETS = "ابپتثجچحخدذرزژسشصضطظعغفقکگلمنهوی";
const PERSIAN_NUMBERS = "۰۱۲۳۴۵۶۷۸۹";

const CHARACTERS: Record<CharacterSet, string> = {
  numbers: PERSIAN_NUMBERS,
  alphabets: PERSIAN_ALPHABETS,
  both: PERSIAN_NUMBERS + PERSIAN_ALPHABETS,
};

// The answer is the secret, so it comes from a CSPRNG; Math.random is
// fine for cosmetic noise.
function generateAnswer(characterSet: CharacterSet, length: number) {
  let text = "";
  for (let i = 0; i < length; i++) {
    // Adjacent digits would form an LTR run inside RTL text, giving a
    // mixed captcha two plausible reading orders.
    const afterDigit = PERSIAN_NUMBERS.includes(text.at(-1) ?? "");
    const pool =
      characterSet === "both" && afterDigit
        ? PERSIAN_ALPHABETS
        : CHARACTERS[characterSet];
    text += pool[randomInt(pool.length)];
  }
  return text;
}

function assertIntegerInRange(
  name: keyof typeof INTEGER_BOUNDS,
  value: unknown,
) {
  const [min, max] = INTEGER_BOUNDS[name];
  if (typeof value !== "number") {
    throw new TypeError(`${name} must be a number, received ${typeof value}`);
  }
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(
      `${name} must be an integer from ${min} to ${max}, received ${value}`,
    );
  }
}

function assertString(name: string, value: unknown) {
  if (typeof value !== "string") {
    throw new TypeError(`${name} must be a string, received ${typeof value}`);
  }
}

export function persianCaptchaGenerator({
  width = 200,
  height = 100,
  length = 5,
  backgroundColor = "#ffffff",
  textColor = "#000000",
  fontSize = 40,
  lineCount = 8,
  dotCount = 50,
  characterSet = "numbers",
}: PersianCaptchaGeneratorOptions = {}): PersianCaptcha {
  // Runtime checks, not just types: JS callers and request-derived values
  // bypass the compiler.
  assertIntegerInRange("width", width);
  assertIntegerInRange("height", height);
  assertIntegerInRange("length", length);
  assertIntegerInRange("fontSize", fontSize);
  assertIntegerInRange("lineCount", lineCount);
  assertIntegerInRange("dotCount", dotCount);
  assertString("backgroundColor", backgroundColor);
  assertString("textColor", textColor);
  if (!CHARACTER_SETS.includes(characterSet)) {
    throw new TypeError(
      `characterSet must be one of ${CHARACTER_SETS.join(", ")}, received ${String(characterSet)}`,
    );
  }

  ensureFontRegistered();

  const randomText = generateAnswer(characterSet, length);

  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, width, height);

  for (let i = 0; i < lineCount; i++) {
    context.beginPath();
    context.moveTo(Math.random() * width, Math.random() * height);
    context.lineTo(Math.random() * width, Math.random() * height);
    context.strokeStyle = `hsl(${Math.random() * 360}, 70%, 50%)`;
    context.lineWidth = 2;
    context.stroke();
  }

  for (let i = 0; i < dotCount; i++) {
    context.beginPath();
    context.arc(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 2 + 1,
      0,
      Math.PI * 2,
    );
    context.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`;
    context.fill();
  }

  context.font = `${fontSize}px ${FONT_FAMILY}`;
  context.fillStyle = textColor;
  context.textAlign = "center";
  context.textBaseline = "middle";
  const centerX = width / 2;
  const centerY = height / 2;

  randomText.split("").forEach((char, i) => {
    const offset = Math.random() * 10 - 5;
    const x = centerX - (length * fontSize) / 4 + i * (fontSize * 0.6);
    context.fillText(char, x, centerY + offset);
  });

  return {
    text: randomText,
    imageBuffer: canvas.toBuffer("image/png"),
  };
}
