import { createFileRoute } from "@tanstack/react-router";
import { procurementService } from "@/lib/procurementService.server";

export const Route = createFileRoute("/api/procurement/centers")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const centers = procurementService.getCenters();
          return Response.json({
            success: true,
            data: centers,
            centers,
          });
        } catch (error: any) {
          return Response.json(
            {
              success: false,
              message: error?.message || "Failed to fetch procurement centers",
            },
            { status: 500 }
          );
        }
      },
    },
  },
});
