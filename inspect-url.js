const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const urlStr = envConfig.DATABASE_URL;

if (!urlStr) {
    console.log("No DATABASE_URL found.");
} else {
    try {
        const url = new URL(urlStr);
        console.log("Protocol:", url.protocol);
        console.log("Hostname:", url.hostname);
        console.log("Port:", url.port);
        console.log("Pathname:", url.pathname);
        // Do not print username/password
        console.log("Params:", url.search);
    } catch (e) {
        console.log("Could not parse URL:", e.message);
    }
}
