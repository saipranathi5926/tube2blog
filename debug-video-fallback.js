const { Innertube } = require('youtubei.js');

async function testVideo(url) {
    console.log("Testing URL:", url);

    // Extract ID
    let videoId = null;
    try {
        const u = new URL(url);
        if (u.hostname === "youtu.be") videoId = u.pathname.slice(1);
        else if (u.searchParams.get("v")) videoId = u.searchParams.get("v");
    } catch (e) {
        console.log("URL parse error");
    }

    if (!videoId) {
        console.log("Could not extract ID");
        return;
    }
    console.log("Video ID:", videoId);

    // 1. Try youtubei.js
    try {
        console.log("--- Attempting youtubei.js ---");
        const youtube = await Innertube.create();
        const info = await youtube.getInfo(videoId);
        console.log("Title:", info.basic_info.title);
        console.log("Desc length:", info.basic_info.short_description?.length);
    } catch (err) {
        console.log("youtubei.js failed:", err.message);
    }

    // 2. Try direct fetch regex
    try {
        console.log("--- Attempting direct fetch regex ---");
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        const html = await response.text();
        const titleMatch = html.match(/<title>(.*?)<\/title>/);
        if (titleMatch) {
            console.log("Direct Fetch Title:", titleMatch[1]);
        } else {
            console.log("Direct Fetch: No title found in HTML");
        }
    } catch (err) {
        console.log("Direct fetch failed:", err.message);
    }

    // 3. Try oEmbed (Proposed Fix)
    try {
        console.log("--- Attempting oEmbed ---");
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const res = await fetch(oembedUrl);
        if (res.ok) {
            const json = await res.json();
            console.log("oEmbed Title:", json.title);
        } else {
            console.log("oEmbed failed:", res.status);
        }
    } catch (err) {
        console.log("oEmbed error:", err.message);
    }
}

testVideo("https://youtu.be/9H1W3tBBdDo?si=FvNqd_GqcZV9j8G6");
