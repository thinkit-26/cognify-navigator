import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NOAH_URL } from "@/components/NoahFrame";
import { NOAH_VERSION } from "@/lib/noah-version";

// NOAH's admin runs as its own app. When it says it is ready, hand it this admin's
// Supabase session so it can verify it and skip its own sign-in.
export function NoahPanel() {
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const onMessage = async (e: MessageEvent) => {
      if (e.origin !== NOAH_URL || e.source !== frame.current?.contentWindow || e.data?.type !== "noah-ready") return;
      const { data } = await supabase.auth.getSession();
      if (data.session) (e.source as Window).postMessage({ type: "cognify-auth", token: data.session.access_token }, NOAH_URL);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <iframe
      ref={frame}
      title="NOAH admin"
      src={`${NOAH_URL}/?embed=admin&v=${NOAH_VERSION}`}
      allow="microphone; fullscreen"
      className="block h-[calc(100dvh-11rem)] min-h-[560px] w-full rounded-2xl border border-border bg-white dark:border-white/10"
    />
  );
}
