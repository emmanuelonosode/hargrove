"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "btn-base inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-medium tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-dark text-white hover:bg-brand focus-visible:ring-brand-dark",
        accent:
          "bg-brand text-white hover:bg-brand-hover focus-visible:ring-brand",
        outline:
          "border border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white focus-visible:ring-brand-dark",
        "outline-white":
          "border border-white text-white hover:bg-white hover:text-brand-dark focus-visible:ring-white",
        "outline-blue":
          "border border-brand text-brand hover:bg-brand hover:text-white focus-visible:ring-brand",
        ghost:
          "text-brand-dark hover:bg-brand-light focus-visible:ring-brand-dark",
        link: "text-brand underline-offset-4 hover:underline p-0 h-auto active:scale-100",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-base",
        xl: "h-15 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
