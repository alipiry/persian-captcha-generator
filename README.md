# Persian Captcha Generator

A library for generating customizable captchas with Persian numbers and alphabets. This library generates a captcha image with various options such as Persian numbers, alphabets, or both, and adds noise elements like random lines and dots for enhanced complexity.

<div align="center">
  <h2>Made with ❤ by <a href="https://github.com/alipiry">Ali Piry</a></h2>
</div>

## Features

- Generate captchas with:
  - Only Persian numbers
  - Only Persian alphabets
  - A mix of Persian numbers and alphabets
- Customizable:
  - Image size (width and height)
  - Font size and colors
  - Noise elements like lines and dots
- Outputs a PNG buffer and the text for verification

## Installation

`Npm`:

```bash
npm install persian-captcha-generator
```

`Yarn`:

```bash
yarn add persian-captcha-generator
```

## Usage

### NodeJS

```typescript
import fs from "fs";
import { persianCaptchaGenerator } from "persian-captcha-generator";

(async () => {
  const captcha = await persianCaptchaGenerator({
    length: 6,
    characterSet: "numbers",
    width: 300,
    height: 100,
    fontSize: 40,
    lineCount: 10,
    dotCount: 100,
    textColor: "#000000",
    backgroundColor: "#f8f9fa",
  });

  // Save the PNG buffer as a file
  fs.writeFileSync("captcha.png", captcha.imageBuffer);

  // Log the captcha text for validation
  console.log("Generated Captcha Text:", captcha.text);
})();
```

### ExpressJS

```typescript
import express from "express";
import { persianCaptchaGenerator } from "persian-captcha-generator";

const app = express();
const PORT = 3000;

app.get("/captcha", async (_req, res) => {
  try {
    const captcha = await persianCaptchaGenerator({
      width: 300,
      height: 100,
      length: 6,
      backgroundColor: "#ffffff",
      textColor: "#000000",
      fontSize: 44,
      lineCount: 8,
      dotCount: 50,
      characterSet: "both",
    });

    console.log("Generated Captcha Text:", captcha.text);

    res.setHeader("Content-Type", "image/png");
    res.send(captcha.imageBuffer);
  } catch (error) {
    console.error("Error generating captcha:", error);
    res.status(500).send("Failed to generate captcha");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
```

### NextJS

Route handler:

```typescript
import { NextResponse } from "next/server";
import { persianCaptchaGenerator } from "persian-captcha-generator";

export async function GET() {
  const captcha = await persianCaptchaGenerator({
    length: 6,
    characterSet: "numbers",
    width: 300,
    height: 100,
    fontSize: 40,
    lineCount: 10,
    dotCount: 100,
    textColor: "#000000",
    backgroundColor: "#f8f9fa",
  });

  const imageBuffer = Buffer.from(captcha.imageBuffer);

  return new NextResponse(imageBuffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Length": imageBuffer.length.toString(),
    },
  });
}
```

<a href="https://github.com/alipiry/next15-persian-captcha">See full example here</a>

## Function API

The `persianCaptchaGenerator` function accepts the following options:
| Parameter | Type | Default | Description |
|-----------------|--------------------------------|-----------|------------------------------------------------------------------------------------|
| `width` | `number` | `200` | Width of the captcha image (in pixels). |
| `height` | `number` | `80` | Height of the captcha image (in pixels). |
| `length` | `number` | `5` | Number of characters in the captcha text. |
| `backgroundColor` | `string` | `"#ffffff"` | Background color of the captcha image (CSS color value). |
| `textColor` | `string` | `"#000000"` | Text color of the captcha characters (CSS color value). |
| `fontSize` | `string` | `32` | Font size of the captcha characters (in pixels). |
| `lineCount` | `string` | `5` | Number of random lines drawn over the captcha for obfuscation. |
| `dotCount` | `string` | `50` | Number of random noise dots added to the captcha image. |
| `characterSet` | `numbers`, `alphabets`, `both` | `numbers` | Choose the type of characters in the captcha: Persian numbers, alphabets, or both. |

## Output

The `persianCaptchaGenerator` function returns an object with the following properties:
| Property | Type | Description |
|----------|----------|-------------------------------------------------------|
| `text` | `string` | The randomly generated captcha text (for validation). |
| `imageBuffer` | `Buffer` | The PNG image buffer of the generated captcha. |

## Sample images

![num_white](https://github.com/user-attachments/assets/1d02e921-f75f-4bdb-9025-deaac7fb91fe)
![num_red](https://github.com/user-attachments/assets/bac6ed9f-cdf1-4aa3-944e-57f7cbca60df)
![num_yellow](https://github.com/user-attachments/assets/46e5d178-9650-4053-a014-cdd873db62ad)
![alph](https://github.com/user-attachments/assets/8f816bac-fd35-4208-aea8-f556b3a44f13)
![both](https://github.com/user-attachments/assets/da3c3998-f590-4ba7-b602-6083ccbbd5ef)

## License

[MIT](LICENSE)
