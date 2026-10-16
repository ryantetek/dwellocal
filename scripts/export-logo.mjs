import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
mkdirSync(publicDir, { recursive: true });

function render(svgName, pngName, width) {
  const svg = readFileSync(join(publicDir, svgName));
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    background: "rgba(0,0,0,0)",
    font: { loadSystemFonts: true },
  })
    .render()
    .asPng();
  writeFileSync(join(publicDir, pngName), png);
  console.log(`wrote public/${pngName} (${png.length} bytes)`);
}

render("logo.svg", "logo.png", 1024);
render("logo-lockup.svg", "logo-lockup.png", 1840);
