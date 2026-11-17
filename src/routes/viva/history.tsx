import { createFileRoute, Link } from "@tanstack/react-router";
import { requireVivaAccess } from "@/lib/viva/guard";
import { VivaReportDashboard } from "@/components/viva-report/VivaReportDashboard";
import { VivaShell } from "@/components/viva/Shell";

export const Route = createFileRoute("/viva/history")({
  ssr: false, // needs the browser's Supabase session
  beforeLoad: requireVivaAccess,
  head: () => ({ meta: [{ title: "My results, AI Oral Viva" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <VivaShell
      actions={
        <Link to="/viva/select" className="text-orange hover:underline">
          Start a new viva
        </Link>
      }
    >
      <VivaReportDashboard mode="student" />
    </VivaShell>
  );
}
