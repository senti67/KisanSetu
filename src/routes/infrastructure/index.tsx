import { createFileRoute } from "@tanstack/react-router";
import ProcurementLinter from "@/components/infrastructure/ProcurementLinter";

export const Route = createFileRoute("/infrastructure/")({
  head: () => ({
    meta: [
      { title: "KisanSetu Infrastructure — Procurement Linter & DNDE" },
      {
        name: "description",
        content:
          "Deterministic Normative Dependency Engine (DNDE) for validating Indian Standards in civil and mandi infrastructure procurement specifications.",
      },
      { property: "og:title", content: "KisanSetu Infrastructure — Procurement Linter & DNDE" },
      {
        property: "og:description",
        content:
          "Official Bureau of Indian Standards (BIS) tender specification linter and normative dependency engine.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: InfrastructurePage,
});

function InfrastructurePage() {
  return <ProcurementLinter />;
}
