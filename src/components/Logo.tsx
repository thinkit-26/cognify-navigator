import logoMark from "@/assets/cognify-logo-new.png.asset.json";

/** Cognify logo, circular maze-C mark. */
export function LogoMark({ className = "", size = 40, white = false }: { className?: string; size?: number; white?: boolean }) {
  return (
    <img
      src={logoMark.url}
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
        src={logoMark.url}
        alt="Cognify"
        className={`${white ? "brightness-0 invert" : ""} h-[90%] w-auto object-contain`}
      />
    </div>
  );
}
