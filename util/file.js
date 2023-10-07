import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// const fs = require('fs');
// const path = require('path');

const deleteFile = (filePath) => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => {
        if (err) {
        const error = new Error("File not delete.");
        error.statusCode = 500;
        throw error;
        }
    })
}

export default deleteFile;

// exports.deleteFile = deleteFile;