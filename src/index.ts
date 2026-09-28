import { randomInt } from "crypto";
import path from "path";
import { createCanvas, GlobalFonts, type SKRSContext2D } from "@napi-rs/canvas";
import { glyphCenters, maxJitter } from "./layout";

export { verifyCaptcha } from "./verify";

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

const FONT_FAMILY = "Vazirmatn";
// Resolves from both src (tests) and dist (published), which sit at the same depth.
const FONT_PATH = path.resolve(__dirname, "..", "fonts", "Vazirmatn.ttf");

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

  const centers = glyphCenters({
    length,
    rtl: characterSet !== "numbers",
    width,
    height,
    fontSize,
  });

  ensureFontRegistered();

  const text = generateAnswer(characterSet, length);

  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, width, height);

  // Half the noise goes over the text so OCR can't just mask it out as
  // background.
  const linesUnder = Math.floor(lineCount / 2);
  const dotsUnder = Math.floor(dotCount / 2);
  drawNoise(context, linesUnder, dotsUnder);

  context.font = `${fontSize}px ${FONT_FAMILY}`;
  context.fillStyle = textColor;
  context.textAlign = "center";
  context.textBaseline = "middle";
  const jitter = maxJitter(fontSize);
  [...text].forEach((char, i) => {
    context.save();
    context.translate(
      centers[i],
      height / 2 + (Math.random() * 2 - 1) * jitter,
    );
    context.rotate((Math.random() * 2 - 1) * MAX_ROTATION);
    context.fillText(char, 0, 0);
    context.restore();
  });

  drawNoise(context, lineCount - linesUnder, dotCount - dotsUnder);

  return { text, imageBuffer: canvas.toBuffer("image/png") };
}

const MAX_ROTATION = 0.3; // radians, ~17°: past this Persian glyphs get ambiguous

function drawNoise(context: SKRSContext2D, lines: number, dots: number) {
  const { width, height } = context.canvas;
  const randomColor = () => `hsl(${Math.random() * 360}, 70%, 50%)`;

  for (let i = 0; i < lines; i++) {
    context.beginPath();
    context.moveTo(Math.random() * width, Math.random() * height);
    context.lineTo(Math.random() * width, Math.random() * height);
    context.strokeStyle = randomColor();
    context.lineWidth = 2;
    context.stroke();
  }

  for (let i = 0; i < dots; i++) {
    context.beginPath();
    context.arc(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 2 + 1,
      0,
      Math.PI * 2,
    );
    context.fillStyle = randomColor();
    context.fill();
  }
}
