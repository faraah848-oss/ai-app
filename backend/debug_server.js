
async function debugServer() {
    console.log('🔍 Probing Server Endpoints...');

    // 1. Test Register
    try {
        console.log('\nTesting /api/auth/register...');
        const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Debug User',
                email: `debug_${Date.now()}@test.com`,
                password: 'password123'
            })
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.log('Register Request Failed:', e.message);
    }

    // 2. Test Login (with a likely non-existent user to see if it hits DB)
    try {
        console.log('\nTesting /api/auth/login...');
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'nonexistent@test.com',
                password: 'password123'
            })
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.log('Login Request Failed:', e.message);
    }
}

debugServer();
