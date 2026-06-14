const path = require('path');
const fs = require('fs');

const WATERMARK = (function() {
  const metaPath = path.join(__dirname, '..', '.watermark.json');
  try {
    return JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch {
    return { licensee: 'Unlicensed' };
  }
})();

function label() {
  return `Licensed to ${WATERMARK.licensee}`;
}

function getLicensee() {
  return WATERMARK.licensee;
}

module.exports = { label, getLicensee };
