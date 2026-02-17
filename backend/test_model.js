import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key loaded:', apiKey ? '✅ Yes' : '❌ No');
console.log('Testing models...\n');

const genAI = new GoogleGenerativeAI(apiKey);

const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.5-pro-latest'];

for (const modelName of models) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    console.log(`Testing ${modelName}...`);
    const result = await model.generateContent('Hello');
    console.log(`✅ ${modelName} works!\n`);
  } catch (error) {
    console.log(`❌ ${modelName}: ${error.message}\n`);
  }
}
