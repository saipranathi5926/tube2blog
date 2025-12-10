const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing connection to Blog table...');
        // Attempt to count, which verifies table existence
        const count = await prisma.blog.count();
        console.log(`Success! Blog table exists. Current count: ${count}`);

        // Also try to create one to be sure
        /*
        const blog = await prisma.blog.create({
            data: {
                title: "Test Blog",
                youtubeUrl: "https://youtu.be/test",
                content: "Test content", // Note: schema says sections are separate, but let's check basic
            }
        }); // Schema is complex, plain count is enough for existence check
        */
    } catch (e) {
        console.error('FAILED: ', e.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
