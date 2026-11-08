import { NOAH_URL } from "@/components/NoahFrame";

// NOAH's admin runs as its own app and asks for its own admin sign-in inside the frame.
export function NoahPanel() {
  return (
    <iframe
      title="NOAH admin"
      src={`${NOAH_URL}/?embed=admin`}
      allow="microphone; fullscreen"
      className="block h-[calc(100dvh-11rem)] min-h-[560px] w-full rounded-2xl border border-border bg-white dark:border-white/10"
    />
  );
}
