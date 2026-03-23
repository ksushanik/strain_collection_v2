'use strict';
// CJS mock for ESM-only file-type package (v19+)
// In e2e tests the actual file validation is not exercised
async function fileTypeFromBuffer() {
  return { mime: 'image/jpeg', ext: 'jpg' };
}
module.exports = { fileTypeFromBuffer };
