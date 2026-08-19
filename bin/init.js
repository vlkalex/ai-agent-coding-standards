#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const FORCE = process.argv.includes("--force");
const HELP = process.argv.includes("--help") || process.argv.includes("-h");

if (HELP) {
  console.log(`
  ai-agent-standards init

  Copy AI agent coding standards and the reuse-first authoring skill into your project.
  Standards are placed in docs/. The skill is placed in .agents/skills/ and .claude/skills/.

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
    src: "review/quality-gate.md",
    dest: "docs/QUALITY-GATE.md",
    label: "Quality gate",
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
  {
    src: "workflow/project-skill-template.md",
    dest: "docs/PROJECT-SKILL-TEMPLATE.md",
    label: "Project skill template",
  },
  {
    src: "skills/reuse-first-authoring/SKILL.md",
    dest: ".agents/skills/reuse-first-authoring/SKILL.md",
    label: "Reuse-first authoring skill",
  },
  {
    src: "skills/reuse-first-authoring/agents/openai.yaml",
    dest: ".agents/skills/reuse-first-authoring/agents/openai.yaml",
    label: "Reuse-first authoring skill metadata",
  },
  {
    src: "skills/reuse-first-authoring/SKILL.md",
    dest: ".claude/skills/reuse-first-authoring/SKILL.md",
    label: "Reuse-first authoring skill for Claude Code",
  },
  {
    src: "skills/reuse-first-authoring/agents/openai.yaml",
    dest: ".claude/skills/reuse-first-authoring/agents/openai.yaml",
    label: "Reuse-first authoring skill metadata for Claude Code",
  },
];

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
console.log("  Copying standards into your project...\n");

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

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
  console.log("  ## Reuse-first authoring");
  console.log("  Before non-trivial implementation or refactoring, invoke the skill:");
  console.log("  - Codex: `$reuse-first-authoring`");
  console.log("  - Claude Code: `/reuse-first-authoring`");
  console.log("  If project skills are not discovered automatically, read");
  console.log("  `.agents/skills/reuse-first-authoring/SKILL.md` directly.");
  console.log("  Load additional project skills only when their task or path trigger matches.\n");
}
