import Anthropic from "@anthropic-ai/sdk";
import { anthropic, MODEL } from "@/lib/ai";
import { DEFAULT_CONTEXT } from "@/lib/default-context";
import { createClient } from "@/lib/supabase/server";
import { getTool } from "@/lib/tools";

// Long scripts can take a few minutes to write.
export const maxDuration = 300;

type Body = { tool: string; inputs: Record<string, string>; videoId?: string | null };

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "ANTHROPIC_API_KEY isn't set. Add it in Vercel → Settings → Environment Variables." }, { status: 500 });
  }

  const body = (await request.json()) as Body;
  const tool = getTool(body.tool);
  if (!tool) return Response.json({ error: "Unknown tool" }, { status: 400 });

  const { data: settings } = await supabase.from("channel_settings").select("context").maybeSingle();
  const system = (settings?.context || DEFAULT_CONTEXT).trim();
  const prompt = tool.build(body.inputs ?? {});

  const stream = anthropic().beta.messages.stream({
    model: MODEL,
    max_tokens: 64000,
    output_config: { effort: "medium" },
    // On a policy decline, the API re-runs the request on Anthropic's recommended fallback model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: `You are the production assistant for this YouTube channel. Channel context:\n\n${system}\n\nFormat answers in Markdown. Be specific and practical; no filler.`,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
  let output = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            output += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          const note = "\n\n> The model declined this request. Try rephrasing the inputs.";
          output += note;
          controller.enqueue(encoder.encode(note));
        } else if (final.stop_reason === "max_tokens") {
          const note = "\n\n> Output hit the length limit and was cut short.";
          output += note;
          controller.enqueue(encoder.encode(note));
        }
        if (output.trim()) {
          await supabase.from("generations").insert({
            tool: tool.id,
            input: body.inputs ?? {},
            output,
            video_id: body.videoId ?? null,
          });
        }
      } catch (error) {
        const message =
          error instanceof Anthropic.AuthenticationError
            ? "Anthropic API key is invalid."
            : error instanceof Anthropic.RateLimitError
              ? "Rate limited by the Anthropic API. Wait a minute and try again."
              : error instanceof Anthropic.APIError
                ? `Anthropic API error ${error.status}: ${error.message}`
                : "Generation failed.";
        controller.enqueue(encoder.encode(`\n\n> ⚠️ ${message}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
