import { createFileRoute } from "@tanstack/react-router";
import { dndeEngine } from "@/lib/dndeEngine.server";

export const Route = createFileRoute("/api/infrastructure/analyze-spec")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({
          status: "healthy",
          engine: "Deterministic Normative Dependency Engine (DNDE)",
          description: "Bureau of Indian Standards (BIS) Infrastructure Procurement Validator",
          supportedStandards: ["IS 456", "IS 383", "IS 1786", "IS 269", "IS 516", "IS 1199", "IS 10262", "IS 800", "IS 2062", "IS 607", "IS 1436"],
        });
      },

      POST: async ({ request }) => {
        try {
          let text = "";

          const contentType = request.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const body = await request.json().catch(() => ({}));
            text = body.text || body.specification || body.spec || body.draft || "";
          } else {
            text = await request.text().catch(() => "");
          }

          if (!text || typeof text !== "string" || text.trim().length === 0) {
            return Response.json(
              {
                success: false,
                message: "A raw text payload or JSON with a 'text' property is required for specification analysis.",
              },
              { status: 400 }
            );
          }

          const analysis = await dndeEngine.analyzeSpecification(text);

          return Response.json({
            success: true,
            originalText: analysis.originalText,
            highlights: analysis.highlights,
            extractedEntities: analysis.extractedEntities,
            dndeGraph: analysis.dndeGraph,
          });
        } catch (error: any) {
          console.error("[API /api/infrastructure/analyze-spec Error]:", error);
          return Response.json(
            {
              success: false,
              message: error?.message || "Internal server error during normative specification analysis.",
            },
            { status: 500 }
          );
        }
      },
    },
  },
});
