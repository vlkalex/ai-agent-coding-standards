#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const HELP = args.includes("--help") || args.includes("-h");

const SKILL_ROOTS = [".agents/skills", ".claude/skills"];

const coreDocs = [
  { src: "principles/coding-principles.md", dest: "docs/CODING-PRINCIPLES.md", label: "Coding principles" },
  { src: "review/quality-gate.md", dest: "docs/QUALITY-GATE.md", label: "Quality gate" },
  { src: "review/review-casebook.md", dest: "docs/REVIEW-CASEBOOK.md", label: "Review casebook" },
  { src: "workflow/mining-review-feedback.md", dest: "docs/MINING-REVIEW-FEEDBACK.md", label: "Mining review feedback" },
  { src: "agents/claude-md-guide.md", dest: "docs/CLAUDE-MD-GUIDE.md", label: "CLAUDE.md writing guide" },
  { src: "agents/agents-md-guide.md", dest: "docs/AGENTS-MD-GUIDE.md", label: "AGENTS.md writing guide" },
  { src: "workflow/ticket-structure.md", dest: "docs/TICKET-STRUCTURE.md", label: "Ticket structure for agents" },
  { src: "workflow/project-skill-template.md", dest: "docs/PROJECT-SKILL-TEMPLATE.md", label: "Project skill template" },
];

function skillFiles(skillName, sourceDir, relativePaths, label) {
  return SKILL_ROOTS.flatMap((root) =>
    relativePaths.map((relativePath) => ({
      src: `${sourceDir}/${relativePath}`,
      dest: `${root}/${skillName}/${relativePath}`,
      label: `${label} (${root})`,
    })),
  );
}

const coreSkills = [
  ...skillFiles("reuse-first-authoring", "skills/reuse-first-authoring", ["SKILL.md", "agents/openai.yaml"], "Reuse-first authoring skill"),
  ...skillFiles("agent-code-review", "skills/agent-code-review", ["SKILL.md", "agents/openai.yaml"], "Agent code review skill"),
];

const frameworkLayers = {
  react: {
    detectDependencies: ["react", "react-dom", "react-native", "next", "expo", "@remix-run/react"],
    files: skillFiles(
      "react-standards",
      "frameworks/react",
      ["SKILL.md", "casebook.md", "component-guidelines.md", "agents/openai.yaml"],
      "React standards layer",
    ),
  },
};

if (HELP) {
  console.log(`
  ai-agent-standards init

  Copy the core coding standards into docs/ and the core skills into .agents/skills/
  and .claude/skills/. A framework layer is installed as an extra skill when the
  project's package.json depends on that framework.

  Options:
    --framework <name>   Install this framework layer (repeatable; skips detection).
                         Available: ${Object.keys(frameworkLayers).join(", ")}. Use "none" for core only.
    --force              Overwrite existing files
    --help               Show this message
  `);
  process.exit(0);
}

const packageRoot = path.resolve(__dirname, "..");
const targetDir = process.cwd();

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

function readRequestedFrameworks() {
  const requested = new Set();
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    const isInitCommand = index === 0 && arg === "init";
    if (isInitCommand || arg === "--force" || arg === "--help" || arg === "-h") continue;
    if (arg === "--framework" || arg.startsWith("--framework=")) {
      const isInline = arg.startsWith("--framework=");
      const value = isInline ? arg.slice("--framework=".length) : args[++index];
      const isMissing = !value || value.startsWith("-");
      if (isMissing) fail("--framework needs a name, for example --framework react.");
      requested.add(value);
      continue;
    }
    fail(`Unknown option: ${arg}. Run with --help for usage.`);
  }
  return [...requested];
}

function readManifest() {
  const manifestPath = path.join(targetDir, "package.json");
  if (!fs.existsSync(manifestPath)) return undefined;
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const isObject = manifest !== null && typeof manifest === "object" && !Array.isArray(manifest);
    if (isObject) return manifest;
  } catch {
    // reported below
  }
  return fail("Could not read package.json to detect frameworks. Pass --framework <name> or --framework none.");
}

function detectFrameworks() {
  const manifest = readManifest();
  if (!manifest) return [];
  const dependencies = {
    ...manifest.dependencies,
    ...manifest.devDependencies,
    ...manifest.peerDependencies,
  };
  return Object.entries(frameworkLayers)
    .filter(([, layer]) => layer.detectDependencies.some((name) => Object.hasOwn(dependencies, name)))
    .map(([name]) => name);
}

const requestedFrameworks = readRequestedFrameworks();
const unknownFrameworks = requestedFrameworks.filter(
  (name) => name !== "none" && !Object.hasOwn(frameworkLayers, name),
);

if (unknownFrameworks.length > 0) {
  fail(`Unknown framework: ${unknownFrameworks.join(", ")}. Available: ${Object.keys(frameworkLayers).join(", ")}, none.`);
}

const isNoneCombined = requestedFrameworks.includes("none") && requestedFrameworks.length > 1;
if (isNoneCombined) fail("--framework none cannot be combined with another framework.");

const isDetecting = requestedFrameworks.length === 0;
const selectedFrameworks = isDetecting
  ? detectFrameworks()
  : requestedFrameworks.filter((name) => name !== "none");

const files = [
  ...coreDocs,
  ...coreSkills,
  ...selectedFrameworks.flatMap((name) => frameworkLayers[name].files),
];

const REPOSITORY_BLOB_URL = "https://github.com/vlkalex/ai-agent-coding-standards/blob/main";
const destinationsBySource = new Map();
for (const file of files) {
  destinationsBySource.set(file.src, [...(destinationsBySource.get(file.src) ?? []), file.dest]);
}

// A skill is installed under each skill root; a link from one copy stays inside its own root.
function findLinkedDestination(linkedSource, fromDestination) {
  const destinations = destinationsBySource.get(linkedSource);
  if (!destinations) return undefined;
  const ownRoot = SKILL_ROOTS.find((root) => fromDestination.startsWith(`${root}/`));
  return destinations.find((dest) => ownRoot && dest.startsWith(`${ownRoot}/`)) ?? destinations[0];
}

// Docs are installed under new names, so relative links between them are
// rewritten to the installed paths, and links to anything not installed
// point at the repository instead.
function rewriteRelativeLinks(markdown, file) {
  return markdown.replace(/\]\(([^)\s#]+)(#[^)\s]*)?\)/g, (link, target, anchor = "") => {
    if (/^[a-z][a-z0-9+.-]*:/i.test(target)) return link;
    const linkedSource = path.posix.join(path.posix.dirname(file.src), target);
    const linkedDestination = findLinkedDestination(linkedSource, file.dest);
    const rewritten = linkedDestination
      ? path.posix.relative(path.posix.dirname(file.dest), linkedDestination)
      : `${REPOSITORY_BLOB_URL}/${linkedSource}`;
    return `](${rewritten}${anchor})`;
  });
}

const missingSources = files.filter(
  (file) => !fs.existsSync(path.join(packageRoot, file.src)),
);

if (missingSources.length > 0) {
  console.error("\n  Installation failed: packaged sources are missing.\n");
  for (const file of missingSources) {
    console.error(`  ✗ Missing: ${file.src}`);
  }
  console.error("\n  Reinstall the package or report the packaging error.\n");
  process.exit(1);
}

console.log("\n  AI Agent Coding Standards\n");
const layerSummary = selectedFrameworks.length > 0 ? selectedFrameworks.join(", ") : "none";
const layerSource = isDetecting ? "detected from package.json" : "requested";
console.log(`  Framework layers: ${layerSummary} (${layerSource})`);
const isNothingDetected = isDetecting && selectedFrameworks.length === 0;
if (isNothingDetected) {
  const hasManifest = fs.existsSync(path.join(targetDir, "package.json"));
  const searched = hasManifest ? "./package.json" : "this directory (no package.json)";
  console.log(`  No framework detected in ${searched}. In a monorepo, run this at the repository`);
  console.log(`  root with --framework <name> (available: ${Object.keys(frameworkLayers).join(", ")}).`);
}
console.log("");
console.log("  Copying standards into your project...\n");

let copied = 0;
let skipped = 0;

for (const file of files) {
  const srcPath = path.join(packageRoot, file.src);
  const destPath = path.join(targetDir, file.dest);

  if (fs.existsSync(destPath) && !FORCE) {
    console.log(`  → Skipped: ${file.dest} (exists, use --force to overwrite)`);
    skipped++;
    continue;
  }

  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  if (file.src.endsWith(".md")) {
    const markdown = fs.readFileSync(srcPath, "utf8");
    fs.writeFileSync(destPath, rewriteRelativeLinks(markdown, file));
  } else {
    fs.copyFileSync(srcPath, destPath);
  }
  console.log(`  ✓ Created: ${file.dest}`);
  copied++;
}

console.log(`\n  Done. ${copied} copied, ${skipped} skipped.\n`);

if (copied > 0) {
  console.log("  Add this to your CLAUDE.md or AGENTS.md:\n");
  console.log("  ## Reuse-first authoring");
  console.log("  Before non-trivial implementation or refactoring, invoke the skill:");
  console.log("  - Codex: `$reuse-first-authoring`");
  console.log("  - Claude Code: `/reuse-first-authoring`");
  console.log("  If project skills are not discovered automatically, read");
  console.log("  `.agents/skills/reuse-first-authoring/SKILL.md` directly.");
  console.log("");
  console.log("  ## Code review");
  console.log("  Before requesting human review, invoke the skill:");
  console.log("  - Codex: `$agent-code-review`");
  console.log("  - Claude Code: `/agent-code-review`");
  console.log("  Load additional project skills only when their task or path trigger matches.\n");
}
