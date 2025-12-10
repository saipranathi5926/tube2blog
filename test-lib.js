const { YoutubeTranscript } = require('youtube-transcript');

async function testLib() {
    try {
        console.log("Testing youtube-transcript for M65hkvZVIW0");
        const transcript = await YoutubeTranscript.fetchTranscript('M65hkvZVIW0');
        console.log("Success!");
        console.log("Length:", transcript ? transcript.length : 0);
        if (transcript && transcript.length > 0) {
            console.log("First line:", transcript[0].text);
            console.log("Language:", transcript[0].lang); // Library doesn't always return lang, but let's see
        }
    } catch (e) {
        console.log("Library Error:", e.message);
    }
}

testLib();
