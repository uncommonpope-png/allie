const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VERSION = '1.0.0';
const DIST_DIR = path.join(ROOT, 'dist');
const PKG_NAME = `allie-v${VERSION}`;
const PKG_DIR = path.join(DIST_DIR, PKG_NAME);

function main() {
  console.log(`Packaging Allie v${VERSION}...`);
  if (fs.existsSync(DIST_DIR)) fs.rmSync(DIST_DIR, { recursive: true, force: true });
  copyDir(ROOT, PKG_DIR, ['dist', 'node_modules', '.git', 'test', '.watermark.json']);
  const zipPath = path.join(DIST_DIR, `${PKG_NAME}.zip`);
  try {
    const dirArg = PKG_DIR.replace(/\\/g, '\\\\');
    const zipArg = zipPath.replace(/\\/g, '\\\\');
    require('child_process').execSync(
      `powershell -Command "& { Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${dirArg}', '${zipArg}') }"`,
      { stdio: 'pipe' }
    );
  } catch {
    require('child_process').execSync(`tar -a -c -f "${zipPath}" -C "${DIST_DIR}" "${PKG_NAME}"`, { stdio: 'pipe' });
  }
  const sizeKB = (fs.statSync(zipPath).size / 1024).toFixed(0);
  console.log(`Created: ${zipPath} (${sizeKB} KB)`);
  console.log(`\nTo use: unzip and run:\n  node allie/bin/allie.js --help`);
  fs.rmSync(PKG_DIR, { recursive: true, force: true });
}

function copyDir(src, dest, exclude) {
  exclude = exclude || [];
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (exclude.includes(entry.name)) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d, exclude);
    else if (entry.isFile()) fs.copyFileSync(s, d);
  }
}

main();
