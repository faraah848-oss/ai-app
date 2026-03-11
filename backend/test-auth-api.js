import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';
const testEmail = `test-${Date.now()}@example.com`;
const testPassword = 'password123';

async function runTest() {
    try {
        console.log('--- Testing Registration ---');
        const regRes = await axios.post(`${API_URL}/register`, {
            name: 'Test User',
            email: testEmail,
            password: testPassword
        });
        console.log('Registration Status:', regRes.status);
        console.log('Registration Result:', JSON.stringify(regRes.data, null, 2));

        console.log('\n--- Testing Login ---');
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: testEmail,
            password: testPassword
        });
        console.log('Login Status:', loginRes.status);
        console.log('Login Result:', JSON.stringify(loginRes.data, null, 2));

        if (loginRes.data.token) {
            console.log('\n✅ Registration and Login verified successfully!');
        }
    } catch (error) {
        console.error('\n❌ Test Failed:');
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error message:', error.message);
        }
    }
}

runTest();
