#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const FORCE = process.argv.includes("--force");
const HELP = process.argv.includes("--help") || process.argv.includes("-h");

if (HELP) {
  console.log(`
  ai-agent-standards init

  Copy AI agent coding standards into your project.
  Files are placed in docs/ and referenced from CLAUDE.md / AGENTS.md.

  Options:
    --force    Overwrite existing files
    --help     Show this message
  `);
  process.exit(0);
}

const packageRoot = path.resolve(__dirname, "..");
const targetDir = process.cwd();
const docsDir = path.join(targetDir, "docs");

const files = [
  {
    src: "react/component-guidelines.md",
    dest: "docs/COMPONENT-GUIDELINES.md",
    label: "Component guidelines (React/RN)",
  },
  {
    src: "principles/coding-principles.md",
    dest: "docs/CODING-PRINCIPLES.md",
    label: "Coding principles",
  },
  {
    src: "agents/claude-md-guide.md",
    dest: "docs/CLAUDE-MD-GUIDE.md",
    label: "CLAUDE.md writing guide",
  },
  {
    src: "agents/agents-md-guide.md",
    dest: "docs/AGENTS-MD-GUIDE.md",
    label: "AGENTS.md writing guide",
  },
  {
    src: "workflow/ticket-structure.md",
    dest: "docs/TICKET-STRUCTURE.md",
    label: "Ticket structure for agents",
  },
];

console.log("\n  AI Agent Coding Standards\n");
console.log("  Copying standards into your project...\n");

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

let copied = 0;
let skipped = 0;

for (const file of files) {
  const srcPath = path.join(packageRoot, file.src);
  const destPath = path.join(targetDir, file.dest);

  if (!fs.existsSync(srcPath)) {
    console.log(`  ⚠ Source not found: ${file.src}`);
    continue;
  }

  if (fs.existsSync(destPath) && !FORCE) {
    console.log(`  → Skipped: ${file.dest} (exists, use --force to overwrite)`);
    skipped++;
    continue;
  }

  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.copyFileSync(srcPath, destPath);
  console.log(`  ✓ Created: ${file.dest}`);
  copied++;
}

console.log(`\n  Done. ${copied} copied, ${skipped} skipped.\n`);

if (copied > 0) {
  console.log("  Add this to your CLAUDE.md or AGENTS.md:\n");
  console.log("  ## Coding Standards");
  console.log("  Before implementing any feature, read:");
  console.log("  - docs/COMPONENT-GUIDELINES.md");
  console.log("  - docs/CODING-PRINCIPLES.md\n");
}
