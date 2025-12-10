
const { Innertube } = require("youtubei.js");
// Mocking fetch for node environment if not available global fetch (node 18+ has it)
// process.env.GEMINI_API_KEY will be used if set

async function testVideoFetch(videoId) {
    console.log(`Testing video ID: ${videoId}`);

    // 1. Test Innertube (youtubei.js)
    try {
        console.log("\n--- Testing Innertube (youtubei.js) ---");
        const youtube = await Innertube.create();
        const info = await youtube.getInfo(videoId);
        console.log("Basic Info Title:", info.basic_info.title);
        try {
            const transcriptData = await info.getTranscript();
            if (transcriptData?.transcript?.content?.body?.initial_segments) {
                console.log("Transcript found!");
            } else {
                console.log("Transcript structure different or missing.");
            }
        } catch (e) {
            console.log("Innertube Transcript Error:", e.message);
        }
    } catch (e) {
        console.log("Innertube General Error:", e.message);
    }

    // 2. Test YouTube Data API (if key exists)
    try {
        console.log("\n--- Testing YouTube Data API ---");
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.log("No GEMINI_API_KEY found in process.env");
        } else {
            console.log("Key found (masked):", apiKey.substring(0, 5) + "...");
            const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`;
            const res = await fetch(apiUrl);
            const data = await res.json();
            if (data.error) {
                console.log("API Error:", data.error.message);
            } else if (data.items && data.items.length > 0) {
                console.log("API Success. Title:", data.items[0].snippet.title);
            } else {
                console.log("API returned no items.");
            }
        }
    } catch (e) {
        console.log("Data API Fetch Error:", e.message);
    }

    // 3. Test oEmbed
    try {
        console.log("\n--- Testing oEmbed ---");
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        console.log("Fetching:", oembedUrl);
        const res = await fetch(oembedUrl);
        if (res.ok) {
            const data = await res.json();
            console.log("oEmbed Success. Title:", data.title);
        } else {
            console.log("oEmbed Failed. Status:", res.status);
            console.log("Response text:", await res.text());
        }
    } catch (e) {
        console.log("oEmbed Error:", e.message);
    }

    // 4. Test Direct Fetch
    try {
        console.log("\n--- Testing Direct Fetch ---");
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        const html = await res.text();
        const titleMatch = html.match(/<title>(.*?)<\/title>/);
        if (titleMatch) {
            console.log("Direct Fetch Title Found:", titleMatch[1]);
        } else {
            console.log("Direct Fetch: No title found in HTML.");
        }
    } catch (e) {
        console.log("Direct Fetch Error:", e.message);
    }
}

const videoId = "GdDKc3JKHvU"; // From user screenshot
testVideoFetch(videoId);
