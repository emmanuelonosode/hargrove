import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase",
  {
    variants: {
      variant: {
        sale:             "bg-brand-dark text-white",
        rent:             "bg-brand text-white",
        accent:           "bg-brand text-white",
        available:        "bg-emerald-100 text-emerald-800",
        "under-contract": "bg-amber-100 text-amber-800",
        sold:             "bg-red-100 text-red-700",
        featured:         "bg-brand text-white",
        muted:            "bg-brand-muted text-brand",
        outline:          "border border-current",
      },
    },
    defaultVariants: { variant: "sale" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
