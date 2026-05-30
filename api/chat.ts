declare const process: { env: { GROQ_API_KEY?: string } };

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "GROQ_API_KEY is not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const body = await req.text();

  const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body
  });

  return new Response(groqResponse.body, {
    status: groqResponse.status,
    headers: {
      "Content-Type": groqResponse.headers.get("Content-Type") ?? "application/json",
      "Cache-Control": "no-cache"
    }
  });
}
