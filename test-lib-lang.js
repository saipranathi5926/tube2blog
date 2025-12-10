const { YoutubeTranscript } = require('youtube-transcript');

async function testLib() {
    console.log("--- Testing youtube-transcript for M65hkvZVIW0 ---");

    try {
        console.log("Trying default...");
        const t1 = await YoutubeTranscript.fetchTranscript('M65hkvZVIW0');
        console.log("Default length:", t1.length);
    } catch (e) {
        console.log("Default failed:", e.message);
    }

    try {
        console.log("Trying lang: 'en'...");
        const t2 = await YoutubeTranscript.fetchTranscript('M65hkvZVIW0', { lang: 'en' });
        console.log("EN length:", t2.length);
    } catch (e) {
        console.log("EN failed:", e.message);
    }

    try {
        console.log("Trying lang: 'hi' (Hindi)...");
        const t3 = await YoutubeTranscript.fetchTranscript('M65hkvZVIW0', { lang: 'hi' });
        console.log("HI length:", t3.length);
    } catch (e) {
        console.log("HI failed:", e.message);
    }
}

testLib();
