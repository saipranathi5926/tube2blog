const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCidN-0gkG0EoC6B4-svFZQdo-V7MydH58';
    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // Note: The SDK might not expose listModels directly on the main class in all versions,
        // but let's try the standard way or check the error.
        // Actually, usually it's via a model manager or similar.
        // Let's try to just make a request to the list models endpoint using fetch if SDK fails,
        // but let's try SDK first if possible. 
        // Wait, the error message said "Call ListModels".
        // In the node SDK, it might be `genAI.getGenerativeModel({})....` no.

        // Let's use direct REST call for certainty to list models
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        const fs = require('fs');
        if (data.models) {
            const output = data.models.map(m => `- ${m.name} (${m.supportedGenerationMethods})`).join('\n');
            fs.writeFileSync('models.log', output);
            console.log("Models written to models.log");
        } else {
            console.log("No models found or error:", JSON.stringify(data, null, 2));
        }

    } catch (e) {
        console.error("Error listing models:", e);
    }
}

listModels();
