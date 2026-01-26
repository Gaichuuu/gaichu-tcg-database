import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function runScript(scriptPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["tsx", scriptPath], {
      cwd: join(__dirname, ".."),
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

async function main(): Promise<void> {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║  OpenZoo TTS Mod Builder                 ║");
  console.log("╚══════════════════════════════════════════╝\n");

  const startTime = Date.now();

  try {
    await runScript(join(__dirname, "generate-mod.ts"));

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log("\n" + "═".repeat(50));
    console.log(`Build completed in ${duration}s`);
    console.log("═".repeat(50));
    console.log("\nOutput: tts-mod/output/mods/OpenZoo_Mod.json");
    console.log("\nNext steps:");
    console.log("  1. Copy mod JSON to TTS Saves folder");
    console.log("  2. Load in Tabletop Simulator and test");
    console.log("  3. Update Steam Workshop mod");
  } catch (error) {
    console.error("\nBuild failed:", error);
    process.exit(1);
  }
}

main();
