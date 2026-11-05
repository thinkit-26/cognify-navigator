import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { NoahFrame } from "@/components/NoahFrame";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/noah-admin")({
  component: NoahAdmin,
  head: () => ({ meta: [{ title: "NOAH admin, Cognify" }] }),
});

// Only hides the page: NOAH checks the admin sign-in itself.
function NoahAdmin() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/login" });
  }, [loading, isAdmin, navigate]);

  if (loading || !isAdmin) return null;
  return <NoahFrame role="admin" />;
}
