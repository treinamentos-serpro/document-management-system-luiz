const path = require('node:path');
const { mkdirSync } = require('node:fs');

const storageDirectory = path.resolve(__dirname, '../../storage');
mkdirSync(storageDirectory, { recursive: true });

module.exports = { storageDirectory };
