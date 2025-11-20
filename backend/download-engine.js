const fs = require('fs');
const https = require('https');
const zlib = require('zlib');
const path = require('path');

// Hash from 'npx prisma -v' output
const HASH = '0c19ccc313cf9911a90d99d2ac2eb0280c76c513';
const URL = `https://binaries.prisma.sh/all_commits/${HASH}/windows/query-engine.exe.gz`;
const DEST_DIR = path.join(__dirname, 'node_modules', '@prisma', 'engines');
const DEST_FILE = path.join(DEST_DIR, 'query-engine.exe');

if (!fs.existsSync(DEST_DIR)) {
    console.log(`Creating directory: ${DEST_DIR}`);
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

console.log(`Downloading query-engine from: ${URL}`);
console.log(`Target: ${DEST_FILE}`);

https.get(URL, (response) => {
    if (response.statusCode !== 200) {
        console.error(`Failed to download. Status Code: ${response.statusCode}`);
        process.exit(1);
    }

    const file = fs.createWriteStream(DEST_FILE);
    const unzip = zlib.createGunzip();

    response.pipe(unzip).pipe(file);

    file.on('finish', () => {
        file.close(() => {
            console.log('Success! query-engine.exe downloaded and extracted.');
        });
    });
}).on('error', (err) => {
    console.error(`Download Error: ${err.message}`);
    process.exit(1);
});
