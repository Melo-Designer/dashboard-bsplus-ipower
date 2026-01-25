'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-white',
        primary: 'bg-primary text-white',
        secondary: 'bg-secondary/10 text-secondary',
        success: 'bg-success text-success-text',
        warning: 'bg-warning text-warning-text',
        destructive: 'bg-primary/10 text-primary',
        outline: 'border border-text-color/20 text-text-color',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
