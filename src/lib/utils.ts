import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate un prix avec 2 décimales maximum
 * Évite les problèmes de précision des nombres flottants
 */
export function formatPrice(price: number): string {
  return (Math.round(price * 100) / 100).toFixed(2);
}
