import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:5001/api';
const UPLOADS_DIR = path.join(__dirname, 'uploads');

const testFiles = {
    small: '1772006656783-607286459.pdf', // ~495 KB
    medium: '1769426757569-816890049.pdf', // ~1.7 MB
    big: '1771918748487-595169050.pdf'    // ~7.3 MB
};

async function getAuthToken() {
    const email = `test-doc-${Date.now()}@example.com`;
    const password = 'password123';

    // Register
    const regRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Doc Tester', email, password })
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);

    return regData.token;
}

async function uploadFile(token, label, filename) {
    console.log(`\n--- Uploading ${label} document: ${filename} ---`);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        return null;
    }

    const stats = fs.statSync(filePath);
    console.log(`File size: ${(stats.size / 1024).toFixed(2)} KB`);

    const formData = new FormData();
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    formData.append('document', blob, filename);
    formData.append('title', `Test ${label} Doc`);

    const res = await fetch(`${API_URL}/documents/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });

    const data = await res.json();
    console.log(`Status: ${res.status}`);
    if (res.ok) {
        console.log(`✅ ${label} upload successful! ID: ${data._id}`);
        console.log(`Extracted content length: ${data.content?.length || 0} chars`);
        return data;
    } else {
        console.error(`❌ ${label} upload failed:`, JSON.stringify(data, null, 2));
        return null;
    }
}

async function runTests() {
    try {
        console.log('Starting Document Handling Verification...');
        const token = await getAuthToken();
        console.log('✅ Auth token obtained.');

        const results = {};
        for (const [label, filename] of Object.entries(testFiles)) {
            results[label] = await uploadFile(token, label, filename);
        }

        console.log('\n--- Verifying Document List ---');
        const listRes = await fetch(`${API_URL}/documents`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const listData = await listRes.json();
        console.log(`Documents in DB: ${listData.length}`);

        if (listData.length >= 3) {
            console.log('\n✅ All document uploads verified successfully!');
        } else {
            console.error('\n❌ Document count mismatch.');
        }

    } catch (error) {
        console.error('\n❌ Test Suite Failed:');
        console.error(error.message);
    }
}

runTests();
