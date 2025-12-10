import { NextRequest, NextResponse } from "next/server";
import { Innertube } from "youtubei.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    // handle shorts
    if (u.pathname.includes("/shorts/")) {
      return u.pathname.split("/shorts/")[1].split("/")[0];
    }
    // handle live
    if (u.pathname.includes("/live/")) {
      return u.pathname.split("/live/")[1].split("/")[0];
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { youtubeUrl, style, audience, length } = await req.json();

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: "Could not extract video ID from URL" },
        { status: 400 }
      );
    }

    const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // 1. Fetch transcript or fallback to metadata
    let transcriptText = "";
    let videoTitle = "";
    let videoDescription = "";
    let isTranscriptAvailable = false;

    try {
      console.log("Fetching transcript for video ID:", videoId);

      const youtube = await Innertube.create();
      const info = await youtube.getInfo(videoId);

      // Try to get basic info
      videoTitle = info.basic_info.title || "";
      videoDescription = info.basic_info.short_description || "";

      try {
        const transcriptData = await info.getTranscript();
        if (transcriptData?.transcript?.content?.body?.initial_segments) {
          transcriptText = transcriptData.transcript.content.body.initial_segments
            .map((segment: any) => segment.snippet.text)
            .join(" ");
          isTranscriptAvailable = true;
          console.log("Transcript fetched successfully via youtubei.js, length:", transcriptText.length);
        }
      } catch (transcriptErr) {
        console.log("youtubei.js transcript failed:", transcriptErr);

        // Secondary Fallback: youtube-transcript library
        try {
          console.log("Attempting fallback with youtube-transcript...");
          // Dynamically import to avoid top-level issues if any
          const { YoutubeTranscript } = require('youtube-transcript');
          const ytTranscript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });

          if (ytTranscript && ytTranscript.length > 0) {
            transcriptText = ytTranscript.map((item: any) => item.text).join(' ');
            isTranscriptAvailable = true;
            console.log("Transcript fetched via youtube-transcript, length:", transcriptText.length);
          } else {
            console.log("youtube-transcript returned empty.");
          }
        } catch (ytErr) {
          console.log("youtube-transcript fallback failed:", ytErr);
        }
      }

    } catch (err: any) {
      console.error("Youtubei.js error:", err);

      // Try YouTube Data API v3 (Official)
      try {
        console.log("Attempting to fetch metadata via YouTube Data API v3...");
        const apiKey = process.env.GEMINI_API_KEY;

        if (apiKey) {
          const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`;
          const apiRes = await fetch(apiUrl);
          const apiData = await apiRes.json();

          if (apiData.items && apiData.items.length > 0) {
            const video = apiData.items[0];
            videoTitle = video.snippet.title;
            videoDescription = video.snippet.description;
            console.log("Metadata fetched via YouTube Data API");
          } else {
            console.log("Video not found via YouTube Data API (or API disabled)");
            if (apiData.error) console.error("YouTube API Error:", apiData.error.message);
          }
        }
      } catch (apiErr) {
        console.error("YouTube Data API failed:", apiErr);
      }

      // Try oEmbed (Official public endpoint, no key needed)
      try {
        if (!videoTitle) { // Only if previous methods failed
          console.log("Attempting oEmbed fetch...");
          // Use cleanUrl here as it is more reliable
          const oembedUrl = `https://www.youtube.com/oembed?url=${cleanUrl}&format=json`;
          const oembedRes = await fetch(oembedUrl);
          if (oembedRes.ok) {
            const oembedData = await oembedRes.json();
            videoTitle = oembedData.title || "";
            // oEmbed doesn't give description, but title is enough to proceed
            console.log("Metadata fetched via oEmbed");
          }
        }
      } catch (oembedErr) {
        console.error("oEmbed failed:", oembedErr);
      }

      // Fallback: Fetch page directly if youtubei.js failed completely
      try {
        if (!videoTitle) {
          console.log("Attempting direct page fetch fallback...");
          console.log("Fetching URL:", cleanUrl);
          const response = await fetch(cleanUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
          });
          const html = await response.text();

          // Simple regex extract (robust enough for fallback)
          const titleMatch = html.match(/<title>(.*?)<\/title>/);
          if (titleMatch) videoTitle = titleMatch[1].replace(" - YouTube", "");

          const descMatch = html.match(/<meta name="description" content="(.*?)">/);
          if (descMatch) videoDescription = descMatch[1];
        }

      } catch (fetchErr) {
        console.error("Direct fetch fallback failed:", fetchErr);
      }
    }

    if (!isTranscriptAvailable && !videoTitle) {
      return NextResponse.json(
        { error: "Failed to fetch video information. Please check the URL." },
        { status: 400 }
      );
    }

    // 2. Call Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not set");
      return NextResponse.json(
        { error: "API key is not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `
You are an autonomous blog-generation engine.

ABSOLUTE RULE:
The blog title will be rendered separately as a cover.
DO NOT repeat the title or any part of it inside the blog content.

INPUT:
You generate structured English blog content from any source or language.

OUTPUT RULES:
1. The title must appear ONLY in the "title" field.
2. The first section must start directly with meaningful content.
3. Do NOT repeat, paraphrase, or continue the title in:
   - section headings
   - first paragraph
   - introduction
4. Assume the cover already displays:
   - title
   - date
   - reading time
   - cover image
5. Handle non-English input by translating to fluent English internally.
6. Generate high-quality AI image prompts for the cover and each section.

STRUCTURE (STRICT JSON):

{
  "title": "Complete blog title",
  "subtitle": "Engaging Subtitle",
  "coverImagePrompt": "Descriptive prompt for the cover image only (NO text in image)",
  "sections": [
    {
      "heading": "First section heading (not similar to title)",
      "content": "Blog content that does NOT restate the title",
      "imagePrompt": "Image relevant to this section (NO text in image)"
    }
  ],
  "conclusion": "Clear closing without restating the title",
  "tags": ["tag1", "tag2"]
}

IMPORTANT:
- Do not start the blog with the title.
- Do not reference the cover.
- Do not repeat words from the title in the first heading.
- Output valid JSON only.
- No markdown formatting.
`.trim();

    let userContent = "";
    if (isTranscriptAvailable) {
      userContent = `
TRANSCRIPT (Primary Source):
${transcriptText}

CONTEXT (Title/Description):
Title: ${videoTitle}
Description: ${videoDescription}

Specifications:
- Style: ${style}
- Audience: ${audience}
- Length: ${length}
        `.trim();
    } else {
      userContent = `
NO TRANSCRIPT AVAILABLE.
Generate blog based on Metadata ONLY.

Metadata:
Title: ${videoTitle}
Description: ${videoDescription}

Specifications:
- Style: ${style}
- Audience: ${audience}
- Length: ${length}
        `.trim();
    }

    const result = await model.generateContent([systemPrompt, userContent]);
    const response = await result.response;
    const text = response.text();

    console.log("AI Response length:", text.length);

    // Parse JSON
    let blog;
    try {
      // Clean potential markdown code blocks
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

      const first = cleanText.indexOf("{");
      const last = cleanText.lastIndexOf("}");
      if (first !== -1 && last !== -1) {
        const jsonStr = cleanText.slice(first, last + 1);
        blog = JSON.parse(jsonStr);
      } else {
        throw new Error("No JSON object found in response");
      }
    } catch (err) {
      console.error("JSON parse error:", err);
      console.log("Raw text:", text);
      return NextResponse.json(
        { error: "Failed to generate valid blog content. Please try again." },
        { status: 500 }
      );
    }

    // 3. Persist to Database with Dynamic Images
    const generateImageUrl = (prompt: string) => {
      // Use Pollinations.ai with the specific AI-generated prompt
      const encodedPrompt = encodeURIComponent(prompt.substring(0, 500)); // Limit length slightly for URL safety
      return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1600&height=900&nologo=true&model=flux`;
    };

    const coverImageUrl = generateImageUrl(blog.coverImagePrompt || blog.title + " blog cover");

    const savedBlog = await prisma.blog.create({
      data: {
        title: blog.title,
        subtitle: blog.subtitle || "",
        conclusion: blog.conclusion || "",
        youtubeUrl: youtubeUrl,
        coverImage: coverImageUrl,
        sections: {
          create: blog.sections.map((section: any, index: number) => ({
            heading: section.heading,
            content: section.content,
            order: index,
            imageUrl: generateImageUrl(section.imagePrompt || section.heading + " illustration")
          }))
        }
      }
    });

    return NextResponse.json({ blogId: savedBlog.id });
  } catch (err: any) {
    console.error("API Error:", err);
    const fs = require('fs');
    fs.appendFileSync('error.log', `API Error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}\n`);
    return NextResponse.json(
      { error: err.message || "Server error, please try again later." },
      { status: 500 }
    );
  }
}
