const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const repositoryRoot = path.resolve(__dirname, "..");
const cliPath = path.join(repositoryRoot, "bin/init.js");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const skillRoots = [".agents/skills", ".claude/skills"];
const skillFiles = (skillName, sourceDir, relativePaths) =>
  skillRoots.flatMap((root) =>
    relativePaths.map((relativePath) => [
      `${sourceDir}/${relativePath}`,
      `${root}/${skillName}/${relativePath}`,
    ]),
  );

const coreFiles = [
  ["principles/coding-principles.md", "docs/CODING-PRINCIPLES.md"],
  ["review/quality-gate.md", "docs/QUALITY-GATE.md"],
  ["review/review-casebook.md", "docs/REVIEW-CASEBOOK.md"],
  ["workflow/mining-review-feedback.md", "docs/MINING-REVIEW-FEEDBACK.md"],
  ["agents/claude-md-guide.md", "docs/CLAUDE-MD-GUIDE.md"],
  ["agents/agents-md-guide.md", "docs/AGENTS-MD-GUIDE.md"],
  ["workflow/ticket-structure.md", "docs/TICKET-STRUCTURE.md"],
  ["workflow/project-skill-template.md", "docs/PROJECT-SKILL-TEMPLATE.md"],
  ...skillFiles("reuse-first-authoring", "skills/reuse-first-authoring", ["SKILL.md", "agents/openai.yaml"]),
  ...skillFiles("agent-code-review", "skills/agent-code-review", ["SKILL.md", "agents/openai.yaml"]),
];

const reactFiles = skillFiles("react-standards", "frameworks/react", [
  "SKILL.md",
  "casebook.md",
  "component-guidelines.md",
  "agents/openai.yaml",
]);

const coreAndReactFiles = [...coreFiles, ...reactFiles];

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

const markdownLinkTarget = /\]\(([^)\s]+)\)/g;
const withoutLinkTargets = (markdown) => markdown.replace(markdownLinkTarget, "]()");

function assertLinksResolve(targetRoot, destination, markdown) {
  for (const [, link] of markdown.matchAll(markdownLinkTarget)) {
    const [target] = link.split("#");
    if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
    const resolved = path.join(targetRoot, path.dirname(destination), target);
    const directoryEntries = fs.existsSync(path.dirname(resolved)) ? fs.readdirSync(path.dirname(resolved)) : [];
    // exact-case match: macOS resolves wrong-case names that break on Linux
    assert.ok(directoryEntries.includes(path.basename(resolved)), `${destination} links to missing ${link}`);
  }
}

function writeManifest(targetRoot, dependencies) {
  fs.writeFileSync(path.join(targetRoot, "package.json"), JSON.stringify({ name: "target", dependencies }));
}

function assertNotInstalled(targetRoot, files) {
  for (const [, destination] of files) {
    assert.equal(fs.existsSync(path.join(targetRoot, destination)), false, destination);
  }
}

const doneLine = (copied, skipped) => new RegExp(`Done\\. ${copied} copied, ${skipped} skipped\\.`);

function assertCompleteInstallation(targetRoot, installedFiles) {
  for (const [source, destination] of installedFiles) {
    const expected = fs.readFileSync(path.join(repositoryRoot, source));
    const actual = fs.readFileSync(path.join(targetRoot, destination));
    if (!source.endsWith(".md")) {
      assert.deepEqual(actual, expected, destination);
      continue;
    }
    const installedMarkdown = actual.toString("utf8");
    assert.equal(withoutLinkTargets(installedMarkdown), withoutLinkTargets(expected.toString("utf8")), destination);
    assertLinksResolve(targetRoot, destination, installedMarkdown);
  }
}

test("installer handles fresh, repeated, and forced installation", (t) => {
  const targetRoot = temporaryDirectory("ai-agent-standards-install-");
  t.after(() => fs.rmSync(targetRoot, { recursive: true, force: true }));

  const fresh = run(process.execPath, [cliPath, "init"], targetRoot);
  assertSucceeded(fresh);
  assert.match(fresh.stdout, doneLine(coreFiles.length, 0));
  assertCompleteInstallation(targetRoot, coreFiles);
  assertNotInstalled(targetRoot, reactFiles);

  const repeated = run(process.execPath, [cliPath], targetRoot);
  assertSucceeded(repeated);
  assert.match(repeated.stdout, doneLine(0, coreFiles.length));

  const forced = run(process.execPath, [cliPath, "--force"], targetRoot);
  assertSucceeded(forced);
  assert.match(forced.stdout, doneLine(coreFiles.length, 0));
  assertCompleteInstallation(targetRoot, coreFiles);
});

test("installer adds a framework layer detected from package.json", (t) => {
  for (const dependency of ["react", "next", "react-native"]) {
    const targetRoot = temporaryDirectory("ai-agent-standards-detect-");
    t.after(() => fs.rmSync(targetRoot, { recursive: true, force: true }));
    writeManifest(targetRoot, { [dependency]: "*" });

    const result = run(process.execPath, [cliPath], targetRoot);
    assertSucceeded(result);
    assert.match(result.stdout, /Framework layers: react \(detected from package\.json\)/);
    assertCompleteInstallation(targetRoot, coreAndReactFiles);
  }
});

test("installer leaves framework layers out of non-matching projects", (t) => {
  const targetRoot = temporaryDirectory("ai-agent-standards-angular-");
  t.after(() => fs.rmSync(targetRoot, { recursive: true, force: true }));
  writeManifest(targetRoot, { "@angular/core": "*" });

  const result = run(process.execPath, [cliPath], targetRoot);
  assertSucceeded(result);
  assert.match(result.stdout, /Framework layers: none/);
  assertNotInstalled(targetRoot, reactFiles);
});

test("--framework overrides detection", (t) => {
  const requestedRoot = temporaryDirectory("ai-agent-standards-requested-");
  const noneRoot = temporaryDirectory("ai-agent-standards-none-");
  t.after(() => fs.rmSync(requestedRoot, { recursive: true, force: true }));
  t.after(() => fs.rmSync(noneRoot, { recursive: true, force: true }));

  const requested = run(process.execPath, [cliPath, "--framework", "react"], requestedRoot);
  assertSucceeded(requested);
  assertCompleteInstallation(requestedRoot, coreAndReactFiles);

  writeManifest(noneRoot, { react: "*" });
  const none = run(process.execPath, [cliPath, "--framework=none"], noneRoot);
  assertSucceeded(none);
  assertNotInstalled(noneRoot, reactFiles);
});

test("installer rejects an unknown framework before writing", (t) => {
  const targetRoot = temporaryDirectory("ai-agent-standards-unknown-");
  t.after(() => fs.rmSync(targetRoot, { recursive: true, force: true }));

  const result = run(process.execPath, [cliPath, "--framework", "svelte"], targetRoot);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Unknown framework: svelte/);
  assert.equal(fs.existsSync(path.join(targetRoot, "docs")), false);
});

test("installer rejects bad arguments and unreadable manifests before writing", (t) => {
  const cases = [
    [["--framework"], null, /--framework needs a name/],
    [["--framework", "--force"], null, /--framework needs a name/],
    [["--framework", "none", "--framework", "react"], null, /cannot be combined/],
    [["--framwork", "react"], null, /Unknown option: --framwork/],
    [[], "{bad", /Could not read package\.json/],
    [[], "null", /Could not read package\.json/],
    [[], "[]", /Could not read package\.json/],
    [["--framework", "constructor"], null, /Unknown framework: constructor/],
    [["init", "extra"], null, /Unknown option: extra/],
  ];
  for (const [cliArgs, manifest, message] of cases) {
    const targetRoot = temporaryDirectory("ai-agent-standards-bad-args-");
    t.after(() => fs.rmSync(targetRoot, { recursive: true, force: true }));
    if (manifest !== null) fs.writeFileSync(path.join(targetRoot, "package.json"), manifest);

    const result = run(process.execPath, [cliPath, ...cliArgs], targetRoot);
    assert.notEqual(result.status, 0, cliArgs.join(" "));
    assert.match(result.stderr, message);
    assert.equal(fs.existsSync(path.join(targetRoot, "docs")), false);
  }
});

test("a repeated --framework installs the layer once", (t) => {
  const targetRoot = temporaryDirectory("ai-agent-standards-repeated-");
  t.after(() => fs.rmSync(targetRoot, { recursive: true, force: true }));

  const result = run(process.execPath, [cliPath, "--framework", "react", "--framework=react"], targetRoot);
  assertSucceeded(result);
  assert.match(result.stdout, doneLine(coreAndReactFiles.length, 0));
});

test("links inside a skill copy stay within its own skill root", (t) => {
  const targetRoot = temporaryDirectory("ai-agent-standards-roots-");
  t.after(() => fs.rmSync(targetRoot, { recursive: true, force: true }));

  assertSucceeded(run(process.execPath, [cliPath, "--framework", "react"], targetRoot));
  for (const root of skillRoots) {
    const skill = fs.readFileSync(path.join(targetRoot, root, "react-standards/SKILL.md"), "utf8");
    const otherRoot = skillRoots.find((candidate) => candidate !== root);
    assert.ok(!skill.includes(otherRoot), `${root} copy links into ${otherRoot}`);
  }
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
    ["exec", "--yes", `--package=${archivePath}`, "--", "ai-agent-standards", "init", "--framework", "react"],
    targetRoot,
    { ...process.env, npm_config_cache: cacheRoot },
  );
  assertSucceeded(installed);
  assert.match(installed.stdout, doneLine(coreAndReactFiles.length, 0));
  assertCompleteInstallation(targetRoot, coreAndReactFiles);
});
