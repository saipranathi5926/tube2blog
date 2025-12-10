const fs = require('fs');
const dotenv = require('dotenv');
// Load .env.local
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
let url = envConfig.DATABASE_URL;

if (url && !url.includes('sslmode')) {
    url += (url.includes('?') ? '&' : '?') + 'sslmode=require';
    console.log("Appended sslmode=require");
}

process.env.DATABASE_URL = url;

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing connection with SSL...');
        const count = await prisma.blog.count();
        console.log(`Success! Blog table exists. Count: ${count}`);
    } catch (e) {
        console.log('FAILED with SSL: ', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
