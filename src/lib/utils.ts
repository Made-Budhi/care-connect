import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function dateFormat(date: string) {
  const newDate = new Date(date)

  return new Intl.DateTimeFormat("en-UK", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(newDate)
}

export function dateTimeFormat(date: string) {
  const newDate = new Date(date)

  return new Intl.DateTimeFormat("en-UK", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(newDate)
}
