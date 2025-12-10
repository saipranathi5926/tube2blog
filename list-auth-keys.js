const fs = require('fs');
const dotenv = require('dotenv');

try {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    const keys = Object.keys(envConfig);

    console.log("Found keys in .env.local:");
    keys.forEach(key => {
        if (key.includes('GOOGLE') || key.includes('GITHUB') || key.includes('NEXTAUTH') || key.includes('SECRET')) {
            console.log(`- ${key}`);
        }
    });

} catch (e) {
    console.error("Error:", e.message);
}
