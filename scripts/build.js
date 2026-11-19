const { execSync } = require("child_process");

// Only compile Next.js when deploying to Vercel (frontend)
if (process.env.VERCEL) {
  console.log("🚀 Building Next.js Webpack production bundle for Vercel...");
  execSync("next build --webpack", { stdio: "inherit" });
} else {
  console.log("⚡ Skipping Next.js compilation on Render/Cloud WhatsApp Engine");
  process.exit(0);
}
