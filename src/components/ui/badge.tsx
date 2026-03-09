import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * SIVFlow Badge
 * ─────────────────────────────────────────────────────────────
 * Semantic status badges for SIV workflow states:
 *   success  = demarche validee
 *   warning  = en attente / action requise
 *   error    = rejetee
 *   info     = en cours de traitement
 *   accent   = nouvelle fonctionnalite / promo
 *   highlight = urgence / prioritaire
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline:
          "text-foreground border-border",
        success:
          "border-transparent bg-success-light text-success dark:bg-success/20",
        warning:
          "border-transparent bg-warning-light text-warning dark:bg-warning/20",
        error:
          "border-transparent bg-destructive-light text-destructive dark:bg-destructive/20",
        info:
          "border-transparent bg-info-light text-info dark:bg-info/20",
        accent:
          "border-transparent bg-accent/10 text-accent",
        highlight:
          "border-transparent bg-highlight/15 text-highlight-foreground dark:text-highlight",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
