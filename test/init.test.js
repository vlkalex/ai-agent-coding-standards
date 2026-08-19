const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const repositoryRoot = path.resolve(__dirname, "..");
const cliPath = path.join(repositoryRoot, "bin/init.js");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const installedFiles = [
  ["react/component-guidelines.md", "docs/COMPONENT-GUIDELINES.md"],
  ["principles/coding-principles.md", "docs/CODING-PRINCIPLES.md"],
  ["review/quality-gate.md", "docs/QUALITY-GATE.md"],
  ["agents/claude-md-guide.md", "docs/CLAUDE-MD-GUIDE.md"],
  ["agents/agents-md-guide.md", "docs/AGENTS-MD-GUIDE.md"],
  ["workflow/ticket-structure.md", "docs/TICKET-STRUCTURE.md"],
  ["workflow/project-skill-template.md", "docs/PROJECT-SKILL-TEMPLATE.md"],
  [
    "skills/reuse-first-authoring/SKILL.md",
    ".agents/skills/reuse-first-authoring/SKILL.md",
  ],
  [
    "skills/reuse-first-authoring/agents/openai.yaml",
    ".agents/skills/reuse-first-authoring/agents/openai.yaml",
  ],
  [
    "skills/reuse-first-authoring/SKILL.md",
    ".claude/skills/reuse-first-authoring/SKILL.md",
  ],
  [
    "skills/reuse-first-authoring/agents/openai.yaml",
    ".claude/skills/reuse-first-authoring/agents/openai.yaml",
  ],
];

function temporaryDirectory(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function run(command, args, cwd, env = process.env) {
  return spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env,
    timeout: 30_000,
  });
}

function assertSucceeded(result) {
  assert.equal(
    result.status,
    0,
    `command failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
}

function assertCompleteInstallation(targetRoot) {
  for (const [source, destination] of installedFiles) {
    const expected = fs.readFileSync(path.join(repositoryRoot, source));
    const actual = fs.readFileSync(path.join(targetRoot, destination));
    assert.deepEqual(actual, expected, destination);
  }
}

test("installer handles fresh, repeated, and forced installation", (t) => {
  const targetRoot = temporaryDirectory("ai-agent-standards-install-");
  t.after(() => fs.rmSync(targetRoot, { recursive: true, force: true }));

  const fresh = run(process.execPath, [cliPath], targetRoot);
  assertSucceeded(fresh);
  assert.match(fresh.stdout, /Done\. 11 copied, 0 skipped\./);
  assertCompleteInstallation(targetRoot);

  const repeated = run(process.execPath, [cliPath], targetRoot);
  assertSucceeded(repeated);
  assert.match(repeated.stdout, /Done\. 0 copied, 11 skipped\./);

  const forced = run(process.execPath, [cliPath, "--force"], targetRoot);
  assertSucceeded(forced);
  assert.match(forced.stdout, /Done\. 11 copied, 0 skipped\./);
  assertCompleteInstallation(targetRoot);
});

test("installer fails before writing when a packaged source is missing", (t) => {
  const fakePackageRoot = temporaryDirectory("ai-agent-standards-incomplete-");
  const targetRoot = temporaryDirectory("ai-agent-standards-target-");
  t.after(() => fs.rmSync(fakePackageRoot, { recursive: true, force: true }));
  t.after(() => fs.rmSync(targetRoot, { recursive: true, force: true }));

  const fakeBin = path.join(fakePackageRoot, "bin");
  fs.mkdirSync(fakeBin, { recursive: true });
  const fakeCli = path.join(fakeBin, "init.js");
  fs.copyFileSync(cliPath, fakeCli);

  const result = run(process.execPath, [fakeCli], targetRoot);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Installation failed: packaged sources are missing/);
  assert.equal(fs.existsSync(path.join(targetRoot, "docs")), false);
});

test("packed npm artifact installs both skill discovery layouts", (t) => {
  const packRoot = temporaryDirectory("ai-agent-standards-pack-");
  const targetRoot = temporaryDirectory("ai-agent-standards-packed-target-");
  const cacheRoot = temporaryDirectory("ai-agent-standards-npm-cache-");
  t.after(() => fs.rmSync(packRoot, { recursive: true, force: true }));
  t.after(() => fs.rmSync(targetRoot, { recursive: true, force: true }));
  t.after(() => fs.rmSync(cacheRoot, { recursive: true, force: true }));

  const packed = run(
    npmCommand,
    ["pack", "--silent", "--pack-destination", packRoot],
    repositoryRoot,
  );
  assertSucceeded(packed);

  const archiveName = packed.stdout.trim().split(/\r?\n/).at(-1);
  assert.ok(archiveName?.endsWith(".tgz"), packed.stdout);
  const archivePath = path.join(packRoot, archiveName);

  const installed = run(
    npmCommand,
    ["exec", "--yes", `--package=${archivePath}`, "--", "ai-agent-standards"],
    targetRoot,
    { ...process.env, npm_config_cache: cacheRoot },
  );
  assertSucceeded(installed);
  assert.match(installed.stdout, /Done\. 11 copied, 0 skipped\./);
  assertCompleteInstallation(targetRoot);
});
