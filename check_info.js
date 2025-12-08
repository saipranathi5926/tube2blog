const { Innertube } = require('youtubei.js');

async function checkInfo() {
    const videoId = 'dQw4w9WgXcQ'; // Rick Roll
    try {
        const youtube = await Innertube.create();
        const info = await youtube.getInfo(videoId);

        console.log("Title:", info.basic_info.title);
        console.log("Description:", info.basic_info.short_description);
        console.log("Description (full?):", info.basic_info.description); // Check if this exists

        // Check if we can get transcript
        try {
            const transcriptData = await info.getTranscript();
            console.log("Transcript found:", !!transcriptData);
        } catch (e) {
            console.log("Transcript fetch failed:", e.message);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

checkInfo();
