import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

export function Checkbox({ checked, onChange, label, className }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn("inline-flex items-center gap-2 text-sm text-zinc-700", className)}
    >
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-md border border-zinc-300 bg-white transition",
          checked && "border-indigo-500 bg-indigo-500 text-white",
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" />}
      </span>
      {label}
    </button>
  );
}
