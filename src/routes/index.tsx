import { createFileRoute } from "@tanstack/react-router";
import KisanSetuApp from "@/components/KisanSetuApp";
import KisanMitraChat from "@/components/KisanMitraChat";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KisanSetu — Mandi Gate Pass & MSP Portal" },
      {
        name: "description",
        content:
          "Book a mandi gate pass, check MSP rates 2025-26, calculate payment and get farmer help from the Kisan Mitra AI assistant.",
      },
      { property: "og:title", content: "KisanSetu — Mandi Gate Pass & MSP Portal" },
      {
        property: "og:description",
        content:
          "Gate pass booking, live mandi queues, MSP rates and an AI assistant for farmers in Hindi, Punjabi and English.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen flex-col bg-ksbg text-slate-900 antialiased">
      <KisanSetuApp />
      <KisanMitraChat />
    </div>
  );
}
