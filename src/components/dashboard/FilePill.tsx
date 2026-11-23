import { FileCheck2, Upload } from "lucide-react";

export function FilePill({ label, file, onPick }: { label: string; file: File | null; onPick: (f: File | null) => void }) {
  return (
    <div className="min-w-0">
      <span className="mb-2 block text-xs font-bold tracking-[0.2em] text-orange">{label}</span>
      <label className="flex h-12 w-full cursor-pointer items-center gap-3 rounded-full border-2 border-dashed border-navy/30 bg-white px-5 text-sm font-bold text-navy transition hover:border-navy dark:bg-white/5 dark:text-cream">
        {file ? <FileCheck2 className="h-4 w-4 shrink-0 text-orange" /> : <Upload className="h-4 w-4 shrink-0 text-orange" />}
        <span className={`truncate ${file ? "" : "font-semibold text-navy/50 dark:text-cream/50"}`}>{file ? file.name : "Choose a file"}</span>
        <input type="file" accept="application/pdf,image/*" className="sr-only" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
      </label>
    </div>
  );
}
