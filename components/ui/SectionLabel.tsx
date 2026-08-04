/* ============================================================
   BLCK VOID — components/ui/SectionLabel.tsx
   ============================================================ */

import { cn } from '@/lib/cn'

interface SectionLabelProps {
  text: string
  className?: string
}

export function SectionLabel({ text, className }: SectionLabelProps) {
  return (
    <span
      className={cn('type-eyebrow', className)}
    >
      {text}
    </span>
  )
}
