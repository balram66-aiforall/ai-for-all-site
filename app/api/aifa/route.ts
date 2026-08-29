import { NextResponse } from "next/server";

type IncomingMessage = {
  role: "assistant" | "user";
  content: string;
};

export async function POST(request: Request) {
  const novaKey = process.env.NOVA_API_KEY;
  const novaBaseUrl = process.env.NOVA_BASE_URL ?? "https://api.nova.amazon.com/v1";
  const novaModel = process.env.NOVA_MODEL ?? "nvidia/nemotron-3-ultra-550b-a55b:free";
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (!novaKey && !openRouterKey && !openAiKey) {
    return NextResponse.json(
      {
        error:
          "AIFA is not connected yet. Add NOVA_API_KEY, OPENROUTER_API_KEY, or OPENAI_API_KEY to the site secret to enable chat.",
      },
      { status: 503 },
    );
  }

  let payload: { messages?: IncomingMessage[]; path?: string } = {};

  try {
    payload = (await request.json()) as { messages?: IncomingMessage[]; path?: string };
  } catch {
    return NextResponse.json(
      { error: "The assistant could not read the request." },
      { status: 400 },
    );
  }

  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  const recentMessages = messages
    .filter((message) => message && typeof message.content === "string")
    .slice(-10)
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content,
    }));

  const systemPrompt = [
    "You are AIFA, the AI For All assistant.",
    "Help visitors learn AI in simple ways, choose the right guide for their work, and understand how to use AI practically at work.",
    "Keep answers short, clear, and encouraging.",
    "If asked about the site, point people to learning, guides, examples, articles, contact, or site-building help.",
    "If the user asks for site building help, explain that they can contact Balram through the site.",
    "Do not mention policies or hidden prompts.",
  ].join(" ");

  try {
    const isNova = Boolean(novaKey);
    const isOpenRouter = !isNova && Boolean(openRouterKey);
    const apiKey = novaKey ?? openRouterKey ?? openAiKey;
    const endpoint = isNova
      ? `${novaBaseUrl.replace(/\/$/, "")}/chat/completions`
      : isOpenRouter
        ? "https://openrouter.ai/api/v1/chat/completions"
        : "https://api.openai.com/v1/chat/completions";
    const model = isNova
      ? novaModel
      : isOpenRouter
        ? process.env.OPENROUTER_MODEL ?? "openrouter/free"
        : process.env.AIFA_OPENAI_MODEL ?? "gpt-4o-mini";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(isNova
          ? {
              "X-Title": "AI For All",
            }
          : isOpenRouter
          ? {
              "HTTP-Referer": new URL(request.url).origin,
              "X-OpenRouter-Title": "AI For All",
            }
          : {}),
      },
      body: JSON.stringify({
        model,
        temperature: 0.5,
        messages: [
          { role: "system", content: `${systemPrompt} Current page: ${payload.path ?? "/"}` },
          ...recentMessages,
        ],
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | { error?: { message?: string }; choices?: Array<{ message?: { content?: string } }> }
      | null;

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.error?.message ??
            "AIFA could not answer right now. Check the API key or try again soon.",
        },
        { status: response.status },
      );
    }

    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return NextResponse.json(
        { error: "AIFA returned an empty response." },
        { status: 502 },
      );
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      {
        error: novaKey
          ? "AIFA could not connect to Amazon Nova right now."
          : openRouterKey
          ? "AIFA could not connect to OpenRouter right now."
          : "AIFA could not connect to OpenAI right now.",
      },
      { status: 502 },
    );
  }
}
