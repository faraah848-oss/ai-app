import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse';

/**
 * Extracts text from a document model instance.
 * Uses stored content if available, falling back to on-the-fly parsing.
 * @param {Object} doc - The Document model instance.
 * @returns {Promise<string>} - The extracted text.
 */
export const getDocumentText = async (doc) => {
    if (!doc) {
        console.warn('⚠️ getDocumentText called without document object');
        return '';
    }

    // If we already have content, use it
    if (doc.content && doc.content.trim().length > 0) {
        return doc.content;
    }

    console.log(`🔍 Attempting text extraction for: ${doc.title} (${doc._id})`);

    // Fallback: extract from file if content is missing or empty
    try {
        let absolutePath = doc.filepath;

        // Handle potential relative paths or URL-like paths
        if (!fs.existsSync(absolutePath)) {
            const basename = path.basename(absolutePath);
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);

            // Derive backend root: current file is in backend/utils/documentUtils.js
            const backendRoot = path.resolve(__dirname, '..');
            const projectRoot = path.resolve(backendRoot, '..');
            const uploadsDir = path.join(backendRoot, 'uploads');

            const possiblePaths = [
                path.resolve(backendRoot, absolutePath.startsWith('/') ? absolutePath.substring(1) : absolutePath),
                path.resolve(projectRoot, absolutePath.startsWith('/') ? absolutePath.substring(1) : absolutePath),
                path.join(uploadsDir, basename),
                path.join(uploadsDir, 'document-' + basename)
            ];

            for (const p of possiblePaths) {
                if (fs.existsSync(p)) {
                    absolutePath = p;
                    console.log(`📍 Found file at alternative path: ${p}`);
                    break;
                }
            }
        }

        if (!fs.existsSync(absolutePath)) {
            console.error(`❌ File not found at path: ${doc.filepath} (tried multiple resolutions)`);
            return doc.summary || '';
        }

        if (doc.mimetype === 'application/pdf') {
            console.log(`📄 Parsing PDF: ${absolutePath}`);
            const dataBuffer = fs.readFileSync(absolutePath);
            const data = await pdf(dataBuffer);

            if (!data.text || data.text.trim().length === 0) {
                console.warn(`⚠️ PDF parsed but no text found. This might be a scanned document.`);
                doc.content = ' '; // Store space to indicate it was processed but empty
            } else {
                doc.content = data.text;
                console.log(`✅ Extracted ${doc.content.length} characters from PDF.`);
            }

            await doc.save();
            return doc.content.trim();
        } else if (doc.mimetype === 'text/plain') {
            const text = fs.readFileSync(absolutePath, 'utf8');
            doc.content = text;
            await doc.save();
            console.log(`✅ Extracted ${text.length} characters from text file.`);
            return text;
        }
    } catch (error) {
        console.error('❌ Text extraction fallback failed:', error);
    }

    return doc.summary || '';
};
