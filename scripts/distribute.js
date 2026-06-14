const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VERSION = '1.0.0';
const DIST_DIR = path.join(ROOT, 'dist');
const EXCLUDE = ['dist', 'node_modules', '.git', 'test', '.watermark.json'];

function build(email) {
  if (!email) { console.error('Usage: node scripts/distribute.js <email>'); process.exit(1); }
  const safeEmail = email.replace(/[^a-zA-Z0-9@._-]/g, '_');
  const pkgName = `allie-v${VERSION}-${safeEmail}`;
  const buildDir = path.join(DIST_DIR, pkgName);
  const zipPath = path.join(DIST_DIR, `${pkgName}.zip`);
  if (fs.existsSync(buildDir)) fs.rmSync(buildDir, { recursive: true, force: true });
  fs.mkdirSync(buildDir, { recursive: true });
  copyDir(ROOT, buildDir, EXCLUDE);
  fs.writeFileSync(path.join(buildDir, '.watermark.json'), JSON.stringify({
    licensee: email, product: 'allie', version: VERSION, built: new Date().toISOString()
  }, null, 2) + '\n', 'utf8');
  try {
    const dirArg = buildDir.replace(/\\/g, '\\\\');
    const zipArg = zipPath.replace(/\\/g, '\\\\');
    require('child_process').execSync(
      `powershell -Command "& { Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${dirArg}', '${zipArg}') }"`,
      { stdio: 'pipe' }
    );
  } catch { require('child_process').execSync(`tar -a -c -f "${zipPath}" -C "${DIST_DIR}" "${pkgName}"`, { stdio: 'pipe' }); }
  const sizeKB = (fs.statSync(zipPath).size / 1024).toFixed(0);
  console.log(`Customer: ${email}\nZip: ${zipPath} (${sizeKB} KB)\nFile: ${pkgName}.zip`);
  console.log(`\nIf leaked, run 'allie --version' to see the watermark.`);
  fs.rmSync(buildDir, { recursive: true, force: true });
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

build(process.argv[2]);
