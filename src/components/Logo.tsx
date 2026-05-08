import Image from "next/image";
import { publicUrl } from "@/lib/publicPath";

type LogoSize = "hero" | "footer";

/**
 * Logo art is now square (1:1) — sized so that the visible illustration
 * fills the same vertical band the previous landscape logo occupied.
 */
const sizeClass: Record<LogoSize, string> = {
  hero:
    "w-[min(78vw,16rem)] sm:w-[min(18rem,80vw)] md:w-[20rem] max-h-[min(34vh,16rem)] object-contain mx-auto",
  footer: "h-16 md:h-20 w-auto object-contain object-left",
};

type LogoProps = {
  size: LogoSize;
  className?: string;
  priority?: boolean;
};

export default function Logo({ size, className = "", priority = false }: LogoProps) {
  return (
    <Image
      src={publicUrl("/tnt-tours-logo.png")}
      alt="TNT Tours & Transportation — Anaheim's premier tours and transportation service"
      width={1254}
      height={1254}
      sizes={size === "hero" ? "(max-width: 640px) 78vw, 320px" : "256px"}
      priority={priority}
      className={`${sizeClass[size]} ${className}`.trim()}
    />
  );
}
