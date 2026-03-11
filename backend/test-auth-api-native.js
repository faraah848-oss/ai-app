import http from 'http';

const testEmail = `test-${Date.now()}@example.com`;
const testPassword = 'password123';

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsedBody = body ? JSON.parse(body) : {};
                    resolve({ status: res.statusCode, data: parsedBody });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTest() {
    try {
        console.log('--- Testing Registration ---');
        const regOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/register',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };

        const regRes = await request(regOptions, {
            name: 'Test User',
            email: testEmail,
            password: testPassword
        });

        console.log('Registration Status:', regRes.status);
        console.log('Registration Result:', JSON.stringify(regRes.data, null, 2));

        if (regRes.status !== 201) {
            console.error('Registration failed, skipping login test.');
            return;
        }

        console.log('\n--- Testing Login ---');
        const loginOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };

        const loginRes = await request(loginOptions, {
            email: testEmail,
            password: testPassword
        });

        console.log('Login Status:', loginRes.status);
        console.log('Login Result:', JSON.stringify(loginRes.data, null, 2));

        if (loginRes.data.token) {
            console.log('\n✅ Registration and Login verified successfully!');
        } else {
            console.log('\n❌ Login failed after successful registration. Checking password hashing issue...');
        }
    } catch (error) {
        console.error('\n❌ Test Failed:');
        console.error(error.message);
    }
}

runTest();
