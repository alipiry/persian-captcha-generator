import sharp from "sharp";
import fs from "fs";
import path from "path";

interface PersianCaptchaGeneratorOptions {
  environment: "node" | "next";
  width?: number;
  height?: number;
  length?: number;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  lineCount?: number;
  dotCount?: number;
  characterSet?: "numbers" | "alphabets" | "both";
  fontPath?: string;
}

export async function persianCaptchaGenerator({
  environment = "node",
  width = 200,
  height = 80,
  length = 5,
  backgroundColor = "#ffffff",
  textColor = "#000000",
  fontSize = 32,
  lineCount = 8,
  dotCount = 50,
  characterSet = "numbers",
  fontPath,
}: PersianCaptchaGeneratorOptions) {
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

  const randomOffsets = Array.from({ length: randomText.length }, () =>
    Math.floor(Math.random() * 10 - 5)
  );

  const tspanElements = randomText
    .split("")
    .map((char, index) => {
      const offset = randomOffsets[index];
      return `<tspan x="${
        (width / (length + 1)) * (index + 1)
      }" dy="${offset}">${char}</tspan>`;
    })
    .join("");

  const lineElements = Array.from({ length: lineCount }, () => {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    const isCurved = Math.random() > 0.5;
    return isCurved
      ? `<path d="M ${x1},${y1} Q ${cx},${cy} ${x2},${y2}" stroke="${color}" stroke-width="2" fill="none"/>`
      : `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2"/>`;
  }).join("");

  const dotElements = Array.from({ length: dotCount }, () => {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const r = Math.random() * 2 + 1;
    const color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" />`;
  }).join("");

  let resolvedFontPath: string;

  if (environment === "node") {
    resolvedFontPath = path.resolve(
      __dirname,
      "fonts",
      "Vazirmatn-Regular.ttf"
    );
  } else if (environment === "next" && fontPath) {
    resolvedFontPath = fontPath;
  } else {
    throw new Error(
      "For Next.js environment, please provide a valid fontPath option pointing to the font file in the public directory."
    );
  }

  if (!fs.existsSync(resolvedFontPath)) {
    throw new Error("Font file not found at: " + resolvedFontPath);
  }

  const fontBase64 = fs.readFileSync(resolvedFontPath).toString("base64");

  const svgContent = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        @font-face {
          font-family: 'Vazirmatn';
          src: url('data:font/ttf;base64,${fontBase64}');
        }
        text {
          font-family: 'Vazirmatn';
        }
      </style>
      <rect width="100%" height="100%" fill="${backgroundColor}" />
      ${lineElements}
      ${dotElements}
      <text x="50%" y="50%" font-size="${fontSize}" fill="${textColor}"
        text-anchor="middle" dominant-baseline="middle"
        stroke="${textColor}" stroke-width="0.75">
        ${tspanElements}
      </text>
    </svg>
  `;

  const buffer = await sharp(Buffer.from(svgContent)).png().toBuffer();

  return {
    text: randomText,
    imageBuffer: buffer,
  };
}
