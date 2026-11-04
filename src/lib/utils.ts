import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPercentage(val: number, decimals = 1): string {
  return `${(val * (val <= 1 ? 100 : 1)).toFixed(decimals)}%`
}

export function formatScore(val: number, decimals = 1): string {
  return val.toFixed(decimals)
}

