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

![num_white](https://github.com/user-attachments/assets/d694b661-3fd3-4d16-93b6-4bce81702351)
![num_green](https://github.com/user-attachments/assets/bc76ab1c-dd08-4582-ad56-6a580d50efd6)
![num_yellow](https://github.com/user-attachments/assets/c28b2dec-b0cd-43be-9d60-8f274c1d003f)
![num_red](https://github.com/user-attachments/assets/533e700c-503b-49c7-bc29-363c25900502)
![alph](https://github.com/user-attachments/assets/835192b7-8645-4aaa-a35a-9262aef54246)
![both](https://github.com/user-attachments/assets/271e2efb-9414-4654-af76-776fdfcad44d)

## License

[MIT](LICENSE)
