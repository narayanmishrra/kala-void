/* ============================================================
   BLCK VOID — components/ui/PillButton.tsx
   ============================================================ */

import Link from 'next/link'
import { cn } from '@/lib/cn'

interface PillButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}

export function PillButton({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  disabled = false,
}: PillButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-1.5 font-[family-name:var(--font-ppneuemontreal)] text-[14px] font-semibold leading-[1.2] tracking-[0.35px] uppercase whitespace-nowrap cursor-pointer no-underline transition-all duration-200'

  const variantStyles = {
    primary: 'bg-[#8052ff] text-white rounded-[24px] border-none hover:bg-[#9370ff] hover:-translate-y-px hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(128,82,255,0.30)] active:scale-[0.98] active:shadow-none focus-visible:outline-2 focus-visible:outline-[#8052ff] focus-visible:outline-offset-2',
    ghost: 'bg-transparent text-[#9a9a9a] rounded-none border-none px-0 py-0 hover:text-white',
    outline: 'bg-transparent text-[#8052ff] rounded-[24px] border border-[rgba(128,82,255,0.2)] hover:border-[rgba(128,82,255,0.6)] hover:bg-[rgba(128,82,255,0.1)]',
  }

  const sizeStyles = {
    sm: 'px-4 py-2.5 text-[12px]',
    md: 'px-7 py-[14.4px] text-[14px]',
    lg: 'px-9 py-4 text-[14px]',
  }

  const classes = cn(baseStyles, variantStyles[variant], sizeStyles[size], className)

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  )
}
