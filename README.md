# Persian Captcha Generator

A library for generating customizable captchas with Persian numbers and alphabets. It renders a PNG with rotated, jittered characters and random lines and dots drawn both under and over the text, and returns the answer for server-side verification.

<div align="center">
  <h2>Made with ❤ by <a href="https://github.com/alipiry">Ali Piry</a></h2>
</div>

## Features

- Generate captchas with:
  - Only Persian numbers
  - Only Persian alphabets
  - A mix of Persian numbers and alphabets
- Answers read right-to-left for letters, as Persian readers expect; digit-only captchas read left-to-right
- Answers generated with a cryptographically secure RNG
- Customizable:
  - Image size (width and height)
  - Font size
  - Text and background colors
  - Number of noise lines and dots
- `verifyCaptcha` helper: constant-time comparison that accepts Arabic keyboard and ASCII-digit input
- Every option validated with explicit bounds, so request-derived values can't exhaust your server

Requires Node.js 22 or later. Rendering uses the native [`@napi-rs/canvas`](https://github.com/Brooooooklyn/canvas) addon, so it runs in Node.js only (not browsers or edge runtimes).

## Installation

```bash
pnpm add persian-captcha-generator
# or
npm install persian-captcha-generator
# or
yarn add persian-captcha-generator
```

## Usage

Store `captcha.text` server-side (e.g. in the session), send only the image, never log the answer, and verify it exactly once.

### Node.js

```typescript
import fs from "node:fs";
import { persianCaptchaGenerator } from "persian-captcha-generator";

const captcha = persianCaptchaGenerator({
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

fs.writeFileSync("captcha.png", captcha.imageBuffer);
```

### Express

```typescript
import express from "express";
import session from "express-session";
import {
  persianCaptchaGenerator,
  verifyCaptcha,
} from "persian-captcha-generator";

declare module "express-session" {
  interface SessionData {
    captcha?: string;
  }
}

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
  }),
);

app.get("/captcha", (req, res) => {
  const captcha = persianCaptchaGenerator({
    width: 300,
    height: 100,
    length: 6,
    fontSize: 44,
    characterSet: "both",
  });

  req.session.captcha = captcha.text;
  res.set({ "Content-Type": "image/png", "Cache-Control": "no-store" });
  res.send(captcha.imageBuffer);
});

app.post("/login", (req, res) => {
  const expected = req.session.captcha;
  // Single use: a wrong guess must not allow retrying the same captcha.
  delete req.session.captcha;

  if (!expected || !verifyCaptcha(expected, req.body.captcha)) {
    res.status(400).send("Invalid captcha");
    return;
  }
  // ...continue with login
});

app.listen(3000);
```

### Next.js

Route handler:

```typescript
import { cookies } from "next/headers";
import { persianCaptchaGenerator } from "persian-captcha-generator";

// The canvas addon is native: pin the Node.js runtime and never cache.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const captcha = persianCaptchaGenerator({
    length: 6,
    characterSet: "numbers",
    width: 300,
    height: 100,
    fontSize: 40,
  });

  // Store the answer server-side; `saveCaptchaAnswer` stands in for your
  // session store (keyed by an httpOnly session cookie).
  await saveCaptchaAnswer((await cookies()).get("sid")?.value, captcha.text);

  return new Response(new Uint8Array(captcha.imageBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
```

Verify on submit with `verifyCaptcha(storedAnswer, submittedValue)` and delete the stored answer whether or not it matched.

<a href="https://github.com/alipiry/next15-persian-captcha">See full example here</a>

## API

### `persianCaptchaGenerator(options?)`

Synchronous. All options are optional.

| Parameter         | Type                                 | Default     | Allowed      | Description                                                               |
| ----------------- | ------------------------------------ | ----------- | ------------ | ------------------------------------------------------------------------- |
| `width`           | `number`                             | `200`       | 50–1000      | Width of the image in pixels.                                             |
| `height`          | `number`                             | `100`       | 30–500       | Height of the image in pixels.                                            |
| `length`          | `number`                             | `5`         | 4–10         | Number of characters in the answer.                                       |
| `fontSize`        | `number`                             | `40`        | 10–200       | Font size in pixels.                                                      |
| `lineCount`       | `number`                             | `8`         | 0–50         | Number of random noise lines (half under, half over the text).            |
| `dotCount`        | `number`                             | `50`        | 0–500        | Number of random noise dots (half under, half over the text).             |
| `backgroundColor` | `string`                             | `"#ffffff"` | CSS color    | Background color.                                                         |
| `textColor`       | `string`                             | `"#000000"` | CSS color    | Text color.                                                               |
| `characterSet`    | `"numbers" \| "alphabets" \| "both"` | `"numbers"` | one of these | Persian digits, Persian letters, or both (never two digits side by side). |

All numbers must be integers. An out-of-range value throws a `RangeError` and a wrong type throws a `TypeError`. A `RangeError` is also thrown when `length` characters at `fontSize` can't fit in `width` × `height`. Color strings aren't validated: an invalid CSS color is ignored by the canvas.

Returns a `PersianCaptcha`:

| Property      | Type     | Description                                                          |
| ------------- | -------- | -------------------------------------------------------------------- |
| `text`        | `string` | The answer, in the order a human reads and types it. Keep it secret. |
| `imageBuffer` | `Buffer` | The PNG image.                                                       |

The `PersianCaptchaGeneratorOptions` and `PersianCaptcha` types are exported.

### `verifyCaptcha(expected, input)`

Returns `true` when `input` matches `expected`. The comparison runs in constant time. Before comparing, it:

- ignores whitespace and zero-width (non-)joiners;
- treats Arabic `ي` `ى` `ك` as Persian `ی` `ک`;
- treats ASCII and Arabic-Indic digits as Persian digits.

It returns `false` for empty or non-string input.

## Migrating from 1.x

- **Synchronous API.** `persianCaptchaGenerator` returns the result directly. Existing `await` call sites keep working; replace `.then()` chains.
- **Validation.** Out-of-range, non-integer or wrongly typed options throw instead of rendering. `length` is now at least 4. Text that can't fit the canvas throws.
- **Reading order.** For `alphabets` and `both`, `text` now matches the right-to-left order users read in the image. In 1.x, users typed these answers reversed.
- **Font.** The bundled B Nazanin font was replaced with an OFL-licensed Vazirmatn subset. Glyphs are wider, so configurations near the width limit may now throw.
- **Font lookup.** The fallback that searched `process.cwd()/node_modules` was removed. The font always loads from the installed package.
- **Node.js 22+** is required.
- **Verification.** Use `verifyCaptcha` instead of `===`. It is constant-time and accepts input from Arabic keyboards.

## Sample images

![numbers](https://raw.githubusercontent.com/alipiry/persian-captcha-generator/main/samples/numbers.png)
![numbers, green](https://raw.githubusercontent.com/alipiry/persian-captcha-generator/main/samples/numbers-green.png)
![numbers, yellow](https://raw.githubusercontent.com/alipiry/persian-captcha-generator/main/samples/numbers-yellow.png)
![numbers, red](https://raw.githubusercontent.com/alipiry/persian-captcha-generator/main/samples/numbers-red.png)
![alphabets](https://raw.githubusercontent.com/alipiry/persian-captcha-generator/main/samples/alphabets.png)
![both](https://raw.githubusercontent.com/alipiry/persian-captcha-generator/main/samples/both.png)

## License

[MIT](LICENSE). The bundled Vazirmatn font subset is licensed under the [SIL Open Font License 1.1](fonts/OFL.txt).
