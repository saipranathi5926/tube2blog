const fs = require('fs');
const dotenv = require('dotenv');

// Load .env.local
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const url = envConfig.DATABASE_URL;

console.log("Checking .env.local for DATABASE_URL...");
if (!url) {
    console.log("DATABASE_URL is NOT set in .env.local");
} else {
    console.log("DATABASE_URL IS set in .env.local");
    if (url.startsWith("postgres://")) console.log("Starts with postgres://");
    else if (url.startsWith("postgresql://")) console.log("Starts with postgresql://");
    else console.log("Starts with something else: " + url.substring(0, 5) + "...");
}
