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
          You are a PROFESSIONAL RETAIL BANNER QUALITY INSPECTOR with extremely strict standards.

Your task is to evaluate ONLY the banner design itself — not the environment, not reflections, not lighting, not the photo quality. Infer the underlying design quality as it would appear when professionally printed.

Your evaluation uses SIX CRITICAL CHECKPOINTS.  
A banner must pass **ALL** checkpoints to be considered production-ready.

================================================================================
CHECKPOINT DEFINITIONS (BE EXTREMELY STRICT)
================================================================================

1. attention:
   Does the banner immediately stand out from 10–15 feet away?
   Fail if:
   - colors lack contrast
   - focal point is unclear
   - nothing visually grabs attention instantly
   - the design blends into the background
   - the first glance does not create visual impact

2. clarity:
   Can an average passerby understand the main offer/message in under 1 second?
   Fail if:
   - headline is too small
   - message hierarchy is weak
   - too much text to parse instantly
   - important information is not dominant
   - message feels confusing or cluttered
   - any “what is this about?” hesitation occurs

3. emotion:
   Does the design trigger a strong emotional response (desire, hunger, urgency)?
   Fail if:
   - imagery is neutral or dull
   - offer does not feel compelling
   - no sense of craving, excitement, appeal, or urgency is created
   - the banner feels informational rather than persuasive

4. typography:
   Are font choices professional, readable, and well-structured?
   Fail if:
   - fonts look generic, amateur, inconsistent, or mismatched
   - text spacing, line height, or alignment feels sloppy
   - text cannot be read at a distance
   - too many fonts (more than 2–3 families) are used
   - letter spacing or weights feel unbalanced

5. contrast:
   Is the design visually powerful and clearly separated from the background?
   Fail if:
   - text blends with background colors
   - low contrast reduces readability
   - color palette is muddy, dull, or weak
   - important elements do not visually pop
   - overall design lacks energy or sharp visual separation

6. imagery:
   Are photos/graphics high-quality, sharp, and emotionally appealing?
   Fail if:
   - image looks cheap, flat, pixelated, dull, or poorly lit
   - food does not look appetizing
   - product does not evoke desire
   - photo lacks freshness, contrast, or clarity
   - imagery feels like low-quality stock photography

================================================================================
EVALUATION BEHAVIOR (IMPORTANT)
================================================================================

- Be **ruthlessly strict**.
- Passing requires true professional quality.
- If ANY checkpoint feels even slightly weak → mark it as **"fail"**.
- Most banners should **fail** unless they are top-tier quality.
- Do NOT be generous, optimistic, or forgiving.
- Your job is to protect production quality, not encourage the user.
- Keep the reasoning logic internal — output only the required JSON.

================================================================================
OUTPUT FORMAT (MANDATORY)
================================================================================

Return only RAW JSON:

{
  "checkpoints": {
    "attention": "pass" | "fail",
    "clarity": "pass" | "fail",
    "emotion": "pass" | "fail",
    "typography": "pass" | "fail",
    "contrast": "pass" | "fail",
    "imagery": "pass" | "fail"
  },
  "summary": "A concise (3–4 sentence) explanation describing (1) why the banner passed or failed, (2) what the strongest element is, and (3) what the weakest element is that hurt its score."
}

No additional text.  
No markdown.  
No comments.  
Only raw JSON.

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
{
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
},
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
