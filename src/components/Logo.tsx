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

export function LogoWordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-3 leading-none ${className}`}>
      <LogoMark size={42} />
      <div className="flex flex-col justify-center">
        <span className="text-[1.05rem] font-extrabold leading-none tracking-tight text-navy/90">
          COGNIFY
        </span>
        <span className="mt-[5px] flex items-center gap-1 text-[0.6rem] font-bold leading-none tracking-[0.24em] text-orange/90">
          <span className="h-px w-2.5 bg-orange/80" />
          INSTITUTE
          <span className="h-px w-2.5 bg-orange/80" />
        </span>
      </div>
    </div>
  );
}
