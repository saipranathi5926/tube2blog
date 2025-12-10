const fs = require('fs');
const dotenv = require('dotenv');
const { execSync } = require('child_process');

// Load .env.local
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));

// Merge with current process env (so system paths etc are preserved)
const env = { ...process.env, ...envConfig };

console.log("Running prisma db push with .env.local variables...");

try {
    execSync('npx prisma db push', { stdio: 'inherit', env });
    console.log("Prisma db push completed successfully.");
} catch (error) {
    console.error("Prisma db push failed.");
    process.exit(1);
}
