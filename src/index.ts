import fs from "fs";
import { join } from "path";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";

interface PersianCaptchaGeneratorOptions {
  width?: number;
  height?: number;
  length?: number;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  lineCount?: number;
  dotCount?: number;
  characterSet?: "numbers" | "alphabets" | "both";
}

function registerFont() {
  const possiblePaths = [
    join(__dirname, "..", "fonts", "BNazanin.ttf"),
    join(
      process.cwd(),
      "node_modules",
      "persian-captcha-generator",
      "fonts",
      "BNazanin.ttf"
    ),
  ];

  let fontPath = null;
  for (const path of possiblePaths) {
    if (fs.existsSync(path)) {
      fontPath = path;
      break;
    }
  }

  if (!fontPath) {
    throw new Error(
      `Font file not found. Please ensure BNazanin.ttf exists in one of these locations: ${possiblePaths.join(
        ", "
      )}`
    );
  }

  try {
    GlobalFonts.registerFromPath(fontPath, "BNazanin");
  } catch (error) {
    console.error("Error registering font:", error);
    throw new Error(`Failed to load font from path: ${fontPath}`);
  }
}

export async function persianCaptchaGenerator({
  width = 200,
  height = 100,
  length = 5,
  backgroundColor = "#ffffff",
  textColor = "#000000",
  fontSize = 40,
  lineCount = 8,
  dotCount = 50,
  characterSet = "numbers",
}: PersianCaptchaGeneratorOptions) {
  registerFont();

  const persianAlphabets = "ابپتثجچحخدذرزژسشصضطظعغفقکگلمنهوی";
  const persianNumbers = "۰۱۲۳۴۵۶۷۸۹";

  let characters: string;
  if (characterSet === "numbers") {
    characters = persianNumbers;
  } else if (characterSet === "alphabets") {
    characters = persianAlphabets;
  } else {
    characters = persianNumbers + persianAlphabets;
  }

  const randomText = Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join("");

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
      Math.PI * 2
    );
    context.fillStyle = `hsl(${Math.random() * 360}, 70%, 50%)`;
    context.fill();
  }

  context.font = `${fontSize}px BNazanin`;
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
