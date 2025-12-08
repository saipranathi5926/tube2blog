async function testApi() {
    const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Roll (known to fail youtubei.js in previous check)

    console.log("Testing API with URL:", videoUrl);

    try {
        const response = await fetch('http://localhost:3000/api/generate-blog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                youtubeUrl: videoUrl,
                style: 'Professional',
                audience: 'General',
                length: 'Short'
            })
        });

        const text = await response.text();
        console.log("Raw Response:", text.substring(0, 500)); // Log first 500 chars
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse JSON response");
            return;
        }

        console.log("Status:", response.status);
        if (response.ok) {
            console.log("Success! Blog generated with ID:", data.blogId);

            // Fetch the full blog details
            console.log("Fetching blog details...");
            const blogRes = await fetch(`http://localhost:3000/api/blog/${data.blogId}`);
            const blogData = await blogRes.json();

            if (blogRes.ok) {
                console.log("Blog fetched successfully!");
                console.log("Title:", blogData.title);
                console.log("Subtitle:", blogData.subtitle);
                console.log("Sections count:", blogData.sections?.length);
                console.log("Cover Image:", blogData.coverImage);
            } else {
                console.log("Failed to fetch blog details:", blogData.error);
            }

        } else {
            console.log("Error Status:", response.status);
            console.log("Error Details:", JSON.stringify(data, null, 2));
        }

    } catch (e) {
        console.error("Request failed:", e);
    }
}

testApi();
