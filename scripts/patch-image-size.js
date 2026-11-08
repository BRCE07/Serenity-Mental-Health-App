const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

// Patch Metro's bundled image-size to use our fixed version
const metroImgSize = path.join(__dirname, '../node_modules/@react-native/community-cli-plugin/node_modules/image-size');
const fixedImgSize = path.join(__dirname, '../node_modules/image-size');

if (fs.existsSync(metroImgSize)) {
  fs.rmSync(metroImgSize, { recursive: true, force: true });
  copyDir(fixedImgSize, metroImgSize);
  const ver = JSON.parse(fs.readFileSync(fixedImgSize + '/package.json', 'utf8')).version;
  console.log(`Patched Metro image-size -> v${ver}`);
} else {
  console.log('Metro image-size already patched');
}
