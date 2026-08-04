/* ============================================================
   BLCK VOID — components/ui/Logo.tsx
   ============================================================ */

'use client'

import Link from 'next/link'
import { cn } from '@/lib/cn'

interface LogoProps {
  className?: string
  showWordmark?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { mark: 24, text: '12px' },
  md: { mark: 32, text: '14px' },
  lg: { mark: 40, text: '18px' },
}

export function Logo({
  className,
  showWordmark = true,
  size = 'md',
}: LogoProps) {
  const s = sizes[size]

  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center gap-[10px] no-underline group',
        className
      )}
      aria-label="BLCK VOID — Return to homepage"
    >
      <svg
        width={s.mark}
        height={s.mark}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <polygon
          points="2,28 16,2 30,28 24,16 8,16"
          fill="#8052ff"
          className="transition-all duration-200 group-hover:fill-[#9370ff]"
        />
        <polygon
          points="11,24 21,24 16,10"
          fill="#15846e"
          className="transition-all duration-200 group-hover:fill-[#1a9e84]"
        />
        <polygon
          points="13,26 19,26 16,20"
          fill="#000000"
        />
      </svg>

      {showWordmark && (
        <span
          style={{
            fontFamily: 'var(--font-ppneuemontreal)',
            fontSize: s.text,
            fontWeight: 700,
            letterSpacing: '0.35px',
            textTransform: 'uppercase' as const,
            color: '#ffffff',
            lineHeight: 1,
            transition: 'color 200ms ease',
          }}
          className="group-hover:text-[#bdbdbd]"
        >
          BLCK VOID
        </span>
      )}
    </Link>
  )
}
