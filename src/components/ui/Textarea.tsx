'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'w-full min-h-20 border border-text-color rounded-2xl px-4 py-2.5',
          'focus:outline-none focus:ring-2 focus:ring-secondary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-y transition-all duration-200',
          error && 'border-primary',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
