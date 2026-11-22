import { AdminGate } from "@/components/dashboard/AdminGate";
import { VivaReportDashboard } from "@/components/viva-report/VivaReportDashboard";

// Every student's viva report. Other students' rows only come back to a real Supabase admin session
// (row level security), which AdminGate makes sure of.
export function VivaResultsPanel() {
  return (
    <AdminGate reason="see viva results">
      <VivaReportDashboard mode="admin" />
    </AdminGate>
  );
}
