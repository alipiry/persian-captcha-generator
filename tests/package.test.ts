import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "..");
const run = (args: string[]) =>
  execFileSync("pnpm", args, { cwd: root, encoding: "utf8" });

describe("published package", () => {
  beforeAll(() => {
    run(["build"]);
  }, 60_000);

  it("ships only build output, fonts and docs", () => {
    const { files } = JSON.parse(run(["pack", "--dry-run", "--json"])) as {
      files: { path: string }[];
    };

    expect(files.map((f) => f.path).sort()).toEqual([
      "LICENSE",
      "README.md",
      "dist/index.d.ts",
      "dist/index.js",
      "dist/layout.d.ts",
      "dist/layout.js",
      "dist/verify.d.ts",
      "dist/verify.js",
      "fonts/OFL.txt",
      "fonts/Vazirmatn.ttf",
      "package.json",
    ]);
  });

  it("resolves its entry and types through the exports map", () => {
    const require = createRequire(path.join(root, "package.json"));

    expect(require.resolve("persian-captcha-generator")).toBe(
      path.join(root, "dist", "index.js"),
    );
    expect(
      typeof require("persian-captcha-generator").persianCaptchaGenerator,
    ).toBe("function");
  });
});
