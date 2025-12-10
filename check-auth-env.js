const fs = require('fs');
const dotenv = require('dotenv');

console.log("Checking for Auth Environment Variables in .env.local...");

try {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    const keys = Object.keys(envConfig);

    const requiredKeys = [
        'GOOGLE_ID', 'GOOGLE_SECRET',
        'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET',
        'GITHUB_ID', 'GITHUB_SECRET',
        'NEXTAUTH_URL', 'NEXTAUTH_SECRET'
    ];

    requiredKeys.forEach(key => {
        if (keys.includes(key)) {
            console.log(`[OK] ${key} is present.`);
        } else {
            console.log(`[MISSING] ${key} is NOT present.`);
        }
    });

} catch (e) {
    console.error("Could not check .env.local:", e.message);
}
