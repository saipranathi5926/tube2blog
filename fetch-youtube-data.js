require('dotenv').config();
const axios = require('axios');

async function fetchVideoDetails(videoUrl) {
    try {
        // 1. Extract videoId
        let videoId = null;
        try {
            const u = new URL(videoUrl);
            if (u.hostname === "youtu.be") videoId = u.pathname.slice(1);
            else if (u.searchParams.get("v")) videoId = u.searchParams.get("v");
            else if (u.pathname.includes("/shorts/")) videoId = u.pathname.split("/shorts/")[1].split("/")[0];
        } catch (e) {
            console.error("Invalid URL");
            return;
        }

        if (!videoId) {
            console.error("Could not extract video ID");
            return;
        }

        console.log(`Fetching details for Video ID: ${videoId}`);

        // 2. Use correct endpoint and parameters
        const apiKey = process.env.GEMINI_API_KEY; // Using the provided key (assuming it works for YouTube too)
        if (!apiKey) {
            throw new Error("API Key not found in .env");
        }

        const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                part: 'snippet,statistics',
                id: videoId,
                key: apiKey
            }
        });

        if (response.data.items.length === 0) {
            console.log("Video not found.");
            return;
        }

        const video = response.data.items[0];
        console.log("Title:", video.snippet.title);
        console.log("Description:", video.snippet.description.substring(0, 100) + "...");
        console.log("Channel:", video.snippet.channelTitle);
        console.log("Views:", video.statistics.viewCount);

    } catch (err) {
        // 3. Log full API error
        if (err.response) {
            console.error("API Error Status:", err.response.status);
            console.error("API Error Data:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.error("Error:", err.message);
        }
    }
}

// Test with a video
const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
fetchVideoDetails(testUrl);
