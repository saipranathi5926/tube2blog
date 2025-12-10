const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const mode = process.argv[2]; // 'local' or 'prod'

if (!mode || (mode !== 'local' && mode !== 'prod')) {
    console.error('Usage: node scripts/db-switch.js [local|prod]');
    process.exit(1);
}

let content = fs.readFileSync(schemaPath, 'utf8');

if (mode === 'local') {
    console.log('Switching to LOCAL (SQLite)...');
    content = content.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
    content = content.replace(/url\s*=\s*env\("DATABASE_URL"\)/g, 'url      = "file:./dev.db"');
} else if (mode === 'prod') {
    console.log('Switching to PROD (PostgreSQL)...');
    content = content.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
    content = content.replace(/url\s*=\s*"file:\.\/dev\.db"/g, 'url      = env("DATABASE_URL")');
}

fs.writeFileSync(schemaPath, content);
console.log('Done!');
