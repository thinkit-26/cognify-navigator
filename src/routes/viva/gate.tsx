import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, KeyRound } from "lucide-react";
import { verifyVivaCode } from "@/lib/viva/gate.functions";

export const Route = createFileRoute("/viva/gate")({
  head: () => ({ meta: [{ title: "Viva Access, Cognify Institute" }] }),
  component: VivaGate,
});

function VivaGate() {
  const navigate = useNavigate();
  const verify = useServerFn(verifyVivaCode);

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code.trim()) {
      setError("Please enter the access code.");
      return;
    }
    setChecking(true);
    try {
      const { token } = await verify({ data: { code } });
      sessionStorage.setItem("cognify_viva_token", token);
      navigate({ to: "/viva/select" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify code.");
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center p-6 pt-32 md:pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl max-w-md w-full"
        >
          <div className="mx-auto w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 mb-6">
            <ShieldCheck size={32} />
          </div>

          <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">
            AI Oral Viva
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Enter the access code shared by your teacher to begin your oral viva.
            Codes are verified securely on the server.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <KeyRound className="text-orange-500 shrink-0" size={20} />
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
                autoComplete="off"
                placeholder="Enter access code"
                className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={checking}
              className="w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:pointer-events-none"
            >
              {checking ? "Checking..." : "Start Viva"}
              <ArrowRight size={20} />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have a code?{" "}
            <Link to="/contact" className="text-orange-500 font-medium hover:underline">
              Contact Cognify Institute
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
