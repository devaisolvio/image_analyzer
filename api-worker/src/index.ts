interface ImageRequest{
imageBase64 : string
}
export default {
  async fetch(request, env, ctx): Promise<Response> {
    // ---------- 1. Handle CORS Preflight ----------
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // ---------- 2. Helper to apply CORS ----------
    const withCORS = (response: Response) => {
      const headers = new Headers(response.headers);
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return new Response(response.body, {
        status: response.status,
        headers,
      });
    };

    // ---------- 3. Routing ----------
    const url = new URL(request.url);

    // Health check route
    if (url.pathname === "/api/health") {
      return withCORS(new Response("Working"));
    }

	 if (url.pathname === "/api/gpt-image" && request.method === "POST") {
      try {
        const body = (await request.json()) as ImageRequest;
        const { imageBase64 }= body

        if (!imageBase64) {
          return withCORS(
            new Response(JSON.stringify({ error: "Missing imageBase64" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            })
          );
        }

        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
           body: JSON.stringify({
        model: "gpt-5", // Fixed model name
        messages: [
          {
            role: "system",
             content: `
       You are a PROFESSIONAL RETAIL BANNER QUALITY INSPECTOR.  
IMPORTANT: You must evaluate ONLY the printed banner design itself — 
NOT the photo quality, NOT reflections, NOT glare, NOT cropping, NOT angle, 
NOT background objects, NOT the photographer’s distance.

Ignore all visual noise or distortion in the photo.

A banner must pass the SIX CHECKPOINTS below to be considered “good enough.”
Fail only when the banner's PRINTED DESIGN clearly has an issue.

–––––––––––––––––––––––––––––––––
CHECKPOINTS
–––––––––––––––––––––––––––––––––

1. attention
Does the banner, as designed, have a clear focal point and good visual hierarchy?
Ignore photo blur.  
Fail only if the design itself lacks a focal point or is visually dull.

2. clarity
Is the intended message of the banner easy to understand?
Ignore any glare, reflections, blurriness, or partial cropping caused by the camera.
Fail only if the banner’s printed message is inherently confusing.

3. emotion
Does the design evoke the correct emotional tone?
Examples:
- Food → looks appetizing (in the *printed design*, not the photo)
- Sale → feels exciting or urgent
Fail only if the printed imagery itself is weak or mismatched emotionally.

4. typography
Is the printed text readable and well structured?
Ignore photo distortion.
Fail only if:
- fonts clash
- text is actually too small IN THE DESIGN
- alignment or hierarchy is poorly executed

5. contrast
Do important text and elements stand out in the printed design?
Ignore lighting issues from the photo.
Fail only if the printed banner design has genuinely low color contrast.

6. imagery
Are the graphics/photos used in the banner appealing and appropriate?
Ignore camera blur or reflections.  
Fail only if the actual printed image is:
- low-resolution in design
- poorly composed
- unappetizing (for food imagery)
- visually confusing

–––––––––––––––––––––––––––––––––
FINAL SCORE LOGIC
–––––––––––––––––––––––––––––––––
If ANY checkpoint fails → “good_enough”: "no"  
If ALL checkpoints pass → “good_enough": "yes"

–––––––––––––––––––––––––––––––––
OUTPUT FORMAT (JSON ONLY — NO EXTRA TEXT)
–––––––––––––––––––––––––––––––––

Return ONLY:

{
  "checkpoints": {
    "attention": "pass" | "fail",
    "clarity": "pass" | "fail",
    "emotion": "pass" | "fail",
    "typography": "pass" | "fail",
    "contrast": "pass" | "fail",
    "imagery": "pass" | "fail"
  },
  "good_enough": "yes" | "no",
  "summary": "A concise explanation of why it passed or failed, focusing ONLY on the banner design and not on photo quality."
}


`
          },
          {
            role: "user",
            content: [
		{
  type: "text",
  text: "Here is the image that you have to analyze and check if this is fit for production"
},
{
  type: "image_url", 
  image_url: {
    url: `data:image/jpeg;base64,${imageBase64}`
  }
},
	/* {
  type: "text",
  text: "Here are some reference images of banners that I currently use in production. Keep these as reference for how a banner should look. Focus only on the banner design, not on the surroundings."
},
{
  type: "image_url",
  image_url: {
    url: "https://api-worker.dev-f07.workers.dev/references/reference_1.jpg",
	 detail: "low" 
  }
},
{
  type: "image_url",
  image_url: {
    url: "https://api-worker.dev-f07.workers.dev/references/reference_2.jpg",
	 detail: "low" 
  }
},
{
  type: "image_url",
  image_url: {
    url: "https://api-worker.dev-f07.workers.dev/references/reference_3.jpg",
	 detail: "low" 
  }
}, */
{
  type: "text",
  text: "Now analyze the submitted banner image and provide your assessment in the required JSON format."
}
            ]
          }
        ]
      })
        });

        const data = await openaiRes.json();
        return withCORS(
          new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" },
          })
        );
      } catch (err : any) {
        return withCORS(
          new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          })
        );
      }
    }

    // Default response
    return withCORS(new Response("Hello World!"));
  },
} satisfies ExportedHandler<Env>;
