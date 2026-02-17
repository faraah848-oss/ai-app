import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key loaded:', apiKey ? '✅ Yes' : '❌ No');
console.log('Testing latest models...\n');

const genAI = new GoogleGenerativeAI(apiKey);

const models = ['gemini-2.0-flash', 'gemini-2.0-flash-exp', 'gemini-2.0-pro', 'gemini-exp-1206'];

for (const modelName of models) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    console.log(`Testing ${modelName}...`);
    const result = await model.generateContent('Hello');
    console.log(`✅ ${modelName} WORKS!\n`);
  } catch (error) {
    console.log(`❌ ${modelName}: ${error.message}\n`);
  }
}
