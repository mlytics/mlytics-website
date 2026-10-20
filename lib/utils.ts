import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// The --text-* tokens in app/site-base.css (DESIGN.md §2.8) are font sizes.
// Unregistered, tailwind-merge reads `text-h3` as a text colour and drops it
// next to `text-white`.
const twMerge = extendTailwindMerge({
  extend: { theme: { text: ['display', 'h1', 'h2', 'h3', 'small', 'caption'] } },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
