import { mkdirSync, readdirSync, existsSync } from "fs";
import path from "path";
import { spawnSync } from "child_process";

const gallerySlug = "ruth-afriyie-graduation-proofs";
const rawDir = path.join(process.cwd(), "public/images/galleries", gallerySlug, "raw");
const proofsDir = path.join(process.cwd(), "public/images/galleries", gallerySlug, "proofs");
const force = process.argv.includes("--force");

function commandExists(command: string) {
  return spawnSync("bash", ["-lc", `command -v ${command}`], { encoding: "utf8" }).status === 0;
}

function convertWithDarktable(input: string, output: string) {
  return spawnSync("darktable-cli", [input, output, "--width", "3000", "--height", "3000"], {
    encoding: "utf8",
    stdio: "pipe"
  });
}

function convertWithRawTherapee(input: string, output: string) {
  return spawnSync("rawtherapee-cli", ["-o", output, "-j90", "-Y", "-c", input], {
    encoding: "utf8",
    stdio: "pipe"
  });
}

mkdirSync(rawDir, { recursive: true });
mkdirSync(proofsDir, { recursive: true });

const hasDarktable = commandExists("darktable-cli");
const hasRawTherapee = commandExists("rawtherapee-cli");
if (!hasDarktable && !hasRawTherapee) {
  console.error("No CR3 conversion tool found. Install darktable with: sudo apt update && sudo apt install -y darktable");
  process.exit(1);
}

const files = readdirSync(rawDir)
  .filter((file) => /\.cr3$/i.test(file))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

let converted = 0;
let skipped = 0;
let failed = 0;

for (const file of files) {
  const input = path.join(rawDir, file);
  const output = path.join(proofsDir, `${path.parse(file).name}.jpg`);
  if (existsSync(output) && !force) {
    skipped++;
    continue;
  }

  const result = hasDarktable ? convertWithDarktable(input, output) : convertWithRawTherapee(input, output);
  if (result.status === 0 && existsSync(output)) {
    converted++;
  } else {
    failed++;
    console.error(`Failed to convert ${file}`);
    if (result.stderr) console.error(result.stderr.trim());
  }
}

console.log(JSON.stringify({
  source: rawDir,
  destination: proofsDir,
  tool: hasDarktable ? "darktable-cli" : "rawtherapee-cli",
  filesFound: files.length,
  converted,
  skipped,
  failed,
  force
}, null, 2));

if (failed) process.exit(1);
