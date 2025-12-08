const { YoutubeTranscript } = require('youtube-transcript');
const fs = require('fs');

async function testFetch() {
    const videoId = 'jNQXAC9IVRw';

    try {
        const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            }
        });
        const html = await response.text();

        const splittedHtml = html.split('"captionTracks":');
        if (splittedHtml.length <= 1) return;

        const captionsJson = JSON.parse(splittedHtml[1].split(']')[0] + ']');
        const track = captionsJson.find((t) => t.languageCode === 'en') || captionsJson[0];

        const url = track.baseUrl + '&fmt=json3';
        console.log("Fetching URL:", url);

        const transcriptResponse = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            }
        });

        const text = await transcriptResponse.text();
        console.log("Response length:", text.length);
        if (text.length > 0) {
            console.log("Snippet:", text.substring(0, 200));
        }

    } catch (e) {
        console.error("Custom fetcher failed:", e);
    }
}

testFetch();
