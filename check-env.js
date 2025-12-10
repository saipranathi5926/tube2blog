require('dotenv').config();

const url = process.env.DATABASE_URL;
console.log("Checking DATABASE_URL...");
if (!url) {
    console.log("DATABASE_URL is NOT set.");
} else {
    console.log("DATABASE_URL is set.");
    console.log("Length:", url.length);
    if (url.startsWith("postgres://")) console.log("Starts with postgres://");
    else if (url.startsWith("postgresql://")) console.log("Starts with postgresql://");
    else console.log("Starts with something else: " + url.substring(0, 5) + "...");
}
