import { createCanvas, registerFont } from "canvas";

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

export async function persianCaptchaGenerator({
  width = 200,
  height = 80,
  length = 5,
  backgroundColor = "#ffffff",
  textColor = "#000000",
  fontSize = 32,
  lineCount = 8,
  dotCount = 50,
  characterSet = "numbers",
}: PersianCaptchaGeneratorOptions) {
  const persianNumbers = "۰۱۲۳۴۵۶۷۸۹";
  const persianAlphabets = "ابپتثجچحخدذرزژسشصضطظعغفقکگلمنهوی";

  registerFont(
    "node_modules/persian-captcha-generator/fonts/Vazirmatn-Regular.ttf",
    { family: "Vazirmatn" }
  );

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

  context.font = `${fontSize}px Vazirmatn`;
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
    imageBuffer: canvas.toBuffer(),
  };
}
