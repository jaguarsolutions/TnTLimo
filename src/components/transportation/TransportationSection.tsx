import { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function SectionHeading({ eyebrow, title, description, children }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="inline-flex items-center gap-2.5 mb-4">
        <hr className="gold-rule" aria-hidden="true" />
        <span className="font-sans text-xs font-semibold tracking-[0.18em] text-gold uppercase">
          {eyebrow}
        </span>
        <hr className="gold-rule" aria-hidden="true" />
      </div>
      <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-tight">
        {title}
      </h2>
      <p className="mt-5 font-sans text-muted text-base sm:text-lg leading-relaxed">
        {description}
      </p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
