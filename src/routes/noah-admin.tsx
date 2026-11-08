import { createFileRoute, redirect } from "@tanstack/react-router";

// NOAH's admin now lives in the NOAH Papers tab of /admin.
export const Route = createFileRoute("/noah-admin")({
  beforeLoad: () => {
    throw redirect({ to: "/admin" });
  },
});
