// worker.js — Cloudflare Worker with conversation history + concise replies
export default {
  async fetch(request) {
    return handleRequest(request);
  },
};

async function handleRequest(request) {
  const url = new URL(request.url);

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  // Handle GET (for testing)
  if (request.method === 'GET') {
    const message = url.searchParams.get('message');
    if (!message) {
      return jsonResponse({
        error: 'Add ?message=Your question here to test via GET',
        example: `${url.origin}/?message=Hello, how are you?`,
      });
    }
    return await processAIMessage(message);
  }

  // Handle POST (for chatbot)
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { message, history } = body;

      if (!message) {
        return jsonResponse({ error: 'Message is required' }, 400);
      }

      return await processAIMessage(message, history);
    } catch {
      return jsonResponse({ error: 'Invalid JSON in request body' }, 400);
    }
  }

  // Unsupported methods
  return jsonResponse({ error: 'Method not allowed. Use GET or POST.' }, 405);
}

// --- Helper to call OpenRouter AI API ---
async function processAIMessage(message, history = []) {
  const OPENROUTER_KEY = "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"; // ⚠️ your key

  try {
    const messagesPayload = [
      { role: "system", content: "You are a helpful assistant for the FindMyACLC Lost & Found chatbot. Keep responses short (1–3 sentences), clear, and relevant." },
      ...(Array.isArray(history) ? history : []),
      { role: "user", content: message }
    ];

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "HTTP-Referer": "findmyaclc.firebaseapp.com",
        "X-Title": "FindMyACLC Lost & Found",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messagesPayload,
        max_tokens: 150,
        temperature: 0.6,
      }),
    });

    if (aiResponse.status === 429) {
      return jsonResponse({ error: "Rate limit reached. Please wait and try again later." }, 429);
    }
    if (!aiResponse.ok) {
      const text = await aiResponse.text();
      throw new Error(`AI API responded with status ${aiResponse.status}: ${text}`);
    }

    const aiData = await aiResponse.json();
    const responseContent =
      aiData?.choices?.[0]?.message?.content?.trim() ||
      aiData?.choices?.[0]?.text?.trim() ||
      "No response from AI";

    return jsonResponse({ response: responseContent });
  } catch (err) {
    return jsonResponse({ error: "Internal server error", details: err.message }, 500);
  }
}

// --- Utility functions ---
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
    },
  });
}
