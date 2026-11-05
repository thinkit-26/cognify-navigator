import { createFileRoute } from "@tanstack/react-router";
import { NoahFrame } from "@/components/NoahFrame";

export const Route = createFileRoute("/noah")({
  component: () => <NoahFrame role="student" />,
  head: () => ({ meta: [{ title: "NOAH, Cognify" }] }),
});
