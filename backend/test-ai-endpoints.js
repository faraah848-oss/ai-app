import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const TOKEN = 'YOUR_JWT_TOKEN_HERE'; // I'll need to get a token or bypass auth for testing

async function testAI() {
    try {
        console.log('Testing AI Status...');
        const statusRes = await axios.get(`${API_URL}/debug/ai-status`);
        console.log('AI Status:', statusRes.data);

        // Getting a document ID from the database first might be better, 
        // but for now, I'll assume I need to authenticate.
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

// testAI();
