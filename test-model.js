const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testModel() {
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCidN-0gkG0EoC6B4-svFZQdo-V7MydH58';
    const genAI = new GoogleGenerativeAI(apiKey);

    const models = ["gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-pro", "gemini-pro"];

    const fs = require('fs');
    for (const modelName of models) {
        fs.appendFileSync('model-test.log', `Testing model: ${modelName}\n`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            fs.appendFileSync('model-test.log', `Success with ${modelName}: ${response.text()}\n`);
            return; // Exit on first success
        } catch (e) {
            fs.appendFileSync('model-test.log', `Failed with ${modelName}: ${e.message}\n`);
        }
    }
}

testModel();
