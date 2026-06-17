// Rasterize the brand SVGs into the exact PNG sizes Expo / EAS expects.
// Run: node scripts/render-assets.mjs
import sharp from "sharp"
import { readFileSync, mkdirSync } from "node:fs"
import path from "node:path"

const src = path.resolve("assets/_src")
const out = path.resolve("assets")
mkdirSync(out, { recursive: true })

async function render(svg, file, size, density = 512) {
  const buf = readFileSync(path.join(src, svg))
  await sharp(buf, { density })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(out, file))
  console.log(`✓ ${file} (${size}x${size})`)
}

await render("icon.svg", "icon.png", 1024)
await render("adaptive-foreground.svg", "adaptive-icon.png", 1024)
await render("splash-icon.svg", "splash-icon.png", 1024)
await render("notification-icon.svg", "notification-icon.png", 96)
await render("icon.svg", "favicon.png", 48)
console.log("All assets rendered.")
