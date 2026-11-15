import logoMark from "@/assets/cognify-logo.png";

/** Cognify logo: the maze-C mark with the wordmark, from a local file (the old remote asset 404s). */
export function LogoMark({ className = "", size = 40, white = false }: { className?: string; size?: number; white?: boolean }) {
  return (
    <img
      src={logoMark}
      alt="Cognify Institute"
      className={`${className} ${white ? "brightness-0 invert" : ""} pointer-events-none select-none object-contain`}
      style={{ width: size, height: size }}
    />
  );
}

export function LogoFull({ className = "", white = false }: { className?: string; white?: boolean }) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <img
        src={logoMark}
        alt="Cognify"
        className={`${white ? "brightness-0 invert" : ""} h-[90%] w-auto object-contain`}
      />
    </div>
  );
}
