import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = __dirname;

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir(backendDir, (filePath) => {
    if (filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('../models/')) {
            console.log(`Updating: ${filePath}`);
            // In both routes/ and controllers/, the new path from backend/models/ is ../models/
            let newContent = content.replace(/\.\.\/\.\.\/frontend\/models\//g, '../models/');
            fs.writeFileSync(filePath, newContent);
        }
    }
});
