

# Generador de Captchas Persa

Una biblioteca para generar captchas personalizables con números y letras persas. Esta biblioteca genera una imagen de captcha con varias opciones, como números persas, letras, o una combinación de ambos, y agrega elementos de ruido como líneas y puntos aleatorios para aumentar la complejidad.

<div align="center">
  <h2>Hecho con ❤ por <a href="https://github.com/alipiry">Ali Piry</a></h2>
</div>

## Características

- Generar captchas con:
  - Solo números persas
  - Solo letras persas
  - Una combinación de números y letras persas
- Personalizable:
  - Tamaño de la imagen (ancho y alto)
  - Tamaño y color de la fuente
  - Elementos de ruido como líneas y puntos
- Devuelve un buffer PNG y el texto para la verificación

## Instalación

`Npm`:

```bash
npm install persian-captcha-generator
```

`Yarn`:

```bash
yarn add persian-captcha-generator
```

## Uso

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

Manejador de ruta:

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

<a href="https://github.com/alipiry/next15-persian-captcha">Ver ejemplo completo aquí</a>

## API de la función

La función `persianCaptchaGenerator` acepta las siguientes opciones:
| Parámetro | Tipo | Predeterminado | Descripción |
|-----------------|--------------------------------|-----------|------------------------------------------------------------------------------------|
| `width` | `number` | `200` | Ancho de la imagen del captcha (en píxeles). |
| `height` | `number` | `80` | Alto de la imagen del captcha (en píxeles). |
| `length` | `number` | `5` | Número de caracteres en el texto del captcha. |
| `backgroundColor` | `string` | `"#ffffff"` | Color de fondo de la imagen del captcha (valor de color CSS). |
| `textColor` | `string` | `"#000000"` | Color del texto de los caracteres del captcha (valor de color CSS). |
| `fontSize` | `string` | `32` | Tamaño de fuente de los caracteres del captcha (en píxeles). |
| `lineCount` | `string` | `5` | Número de líneas aleatorias dibujadas sobre el captcha para ofuscarlo. |
| `dotCount` | `string` | `50` | Número de puntos de ruido aleatorios agregados a la imagen del captcha. |
| `characterSet` | `numbers`, `alphabets`, `both` | `numbers` | Elige el tipo de caracteres en el captcha: números persas, letras, o ambos. |

## Salida

La función `persianCaptchaGenerator` devuelve un objeto con las siguientes propiedades:
| Propiedad | Tipo | Descripción |
|----------|----------|-------------------------------------------------------|
| `text` | `string` | El texto del captcha generado aleatoriamente (para validación). |
| `imageBuffer` | `Buffer` | El buffer de imagen PNG del captcha generado. |

## Imágenes de ejemplo

![num_white](https://github.com/user-attachments/assets/d694b661-3fd3-4d16-93b6-4bce81702351)
![num_green](https://github.com/user-attachments/assets/bc76ab1c-dd08-4582-ad56-6a580d50efd6)
![num_yellow](https://github.com/user-attachments/assets/c28b2dec-b0cd-43be-9d60-8f274c1d003f)
![num_red](https://github.com/user-attachments/assets/533e700c-503b-49c7-bc29-363c25900502)
![alph](https://github.com/user-attachments/assets/835192b7-8645-4aaa-a35a-9262aef54246)
![both](https://github.com/user-attachments/assets/271e2efb-9414-4654-af76-776fdfcad44d)

## Licencia

[MIT](LICENSE)
