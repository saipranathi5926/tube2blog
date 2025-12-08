const { Innertube } = require('youtubei.js');

async function testYoutubeIjs() {
    try {
        console.log("Initializing Innertube...");
        const youtube = await Innertube.create();

        console.log("Fetching video info...");
        const info = await youtube.getInfo('1iRJBHPqrtI');

        console.log("Video title:", info.basic_info.title);

        console.log("Fetching transcript...");
        const transcriptData = await info.getTranscript();

        console.log("Transcript available:", !!transcriptData);

        if (transcriptData && transcriptData.transcript) {
            const text = transcriptData.transcript.content.body.initial_segments
                .map((segment) => segment.snippet.text)
                .join(" ");

            console.log("Transcript length:", text.length);
            console.log("First 200 chars:", text.substring(0, 200));
        }
    } catch (error) {
        console.error("Error:", error.message);
        console.error("Full error:", error);
    }
}

testYoutubeIjs();
