'use client'

import { useContactModal } from '@/context/contact-modal-context'
import { cn } from '@/lib/utils'

interface PocButtonProps {
  children?: React.ReactNode
  className?: string
  variant?: 'primary' | 'outline' | 'dark'
}

export function PocButton({ children = 'Start POC Discussion', className, variant = 'primary' }: PocButtonProps) {
  const { open } = useContactModal()
  return (
    <button
      onClick={open}
      className={cn(
        'inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all active:scale-[0.97]',
        variant === 'primary' && 'bg-[#225D59] text-white hover:bg-[#1A3D3A]',
        variant === 'outline' && 'border-2 border-[#225D59] text-[#225D59] hover:bg-[#225D59] hover:text-white',
        variant === 'dark' && 'bg-white text-[#225D59] hover:bg-gray-100',
        className
      )}
    >
      {children}
    </button>
  )
}
