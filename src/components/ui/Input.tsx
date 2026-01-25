'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'w-full border border-text-color rounded-pill px-4 py-2.5',
          'focus:outline-none focus:ring-2 focus:ring-secondary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-200',
          error && 'border-primary',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
