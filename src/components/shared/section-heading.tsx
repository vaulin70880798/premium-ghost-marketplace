import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("space-y-3", align === "center" && "mx-auto max-w-2xl text-center")}>
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">{eyebrow}</p> : null}
      <h2 className="text-balance text-3xl font-semibold tracking-tight text-zinc-950 md:text-4xl">{title}</h2>
      {description ? <p className="text-pretty text-sm text-zinc-600 md:text-base">{description}</p> : null}
    </div>
  );
}
