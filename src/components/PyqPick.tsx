export function PyqPick({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="w-full text-left sm:flex-1">
      <label className="mb-2 block text-xs font-bold tracking-[0.2em] text-orange">{label}</label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-12 w-full cursor-pointer rounded-full border-2 border-navy/30 bg-white px-5 text-sm font-bold text-navy transition hover:border-navy focus:border-navy focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-cream"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
