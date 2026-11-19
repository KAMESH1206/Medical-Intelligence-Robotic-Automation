const { execSync } = require("child_process");

if (process.env.RENDER) {
  console.log("⚡ Skipping Next.js compilation on Render (Background WhatsApp Engine)");
  process.exit(0);
} else {
  console.log("🚀 Building Next.js Webpack production bundle...");
  execSync("next build --webpack", { stdio: "inherit" });
}
