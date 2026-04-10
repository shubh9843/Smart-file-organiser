const crypto = require('crypto');
const fs = require('fs');
const File = require('../models/File');

/**
 * Generates SHA-256 hash of a file
 * @param {string} filePath 
 * @returns {Promise<string>}
 */
const generateFileHash = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);

        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', (err) => reject(err));
    });
};

/**
 * Checks if a file with the same hash exists
 * @param {string} fileHash 
 * @returns {Promise<Object|null>} Existing file metadata or null
 */
const findDuplicate = async (fileHash) => {
    return await File.findOne({ fileHash });
};

module.exports = { generateFileHash, findDuplicate };
