import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  createLovableAiGatewayProvider,
  getLovableAiGatewayRunId,
  getLovableAiGatewayResponseHeaders,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are "Kisan Mitra", the friendly farmer assistant of the KisanSetu portal (Mandi Gate Pass & MSP portal, Dept. of Agriculture, Govt. of India).

Help farmers with:
- Booking a mandi gate pass (choose mandi, date, time slot, quantity in quintals)
- MSP rates 2025-26 and payment calculation (payment reaches the DBT bank account in 48-72 hours after weighing)
- Moisture limit: grain must be below 17% moisture, otherwise the price is cut. Advise drying 2-3 hours in the sun on mandi drying yards.
- Documents needed at gate entry: original Aadhaar card, bank passbook (DBT), land record/Khasra, and the gate pass token.
- Helpline: 1800-180-1551 (Kisan toll-free).

Rules:
- Reply in the same language the farmer writes in (Hindi, Hinglish, Punjabi or English).
- Use very simple words, short sentences, and small numbered steps. Farmers may have low literacy.
- Keep answers under 90 words unless the farmer asks for details.
- Never invent government rules. If unsure, tell them to call 1800-180-1551.`;

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const initialRunId = getLovableAiGatewayRunId(request);
        const gateway = createLovableAiGatewayProvider(key, initialRunId);

        const result = streamText({
          model: gateway("google/gemini-3.7-flash"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        const response = result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
          headers: getLovableAiGatewayResponseHeaders(undefined, {
            ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
          }),
        });

        return withLovableAiGatewayRunIdHeader(response, gateway);
      },
    },
  },
});
