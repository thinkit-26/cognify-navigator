import { createFileRoute, Link } from "@tanstack/react-router";
import { requireVivaAccess } from "@/lib/viva/guard";
import { VivaReportDashboard } from "@/components/viva-report/VivaReportDashboard";
import { VivaShell, vivaPill } from "@/components/viva/Shell";

export const Route = createFileRoute("/viva/history")({
  ssr: false, // needs the browser's Supabase session
  beforeLoad: requireVivaAccess,
  head: () => ({ meta: [{ title: "Dashboard, AI Oral Viva" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <VivaShell
      full
      back={{ to: "/viva/select" }}
      actions={
        <Link to="/viva/select" className={vivaPill}>
          Start a new viva
        </Link>
      }
    >
      <VivaReportDashboard mode="student" />
    </VivaShell>
  );
}
