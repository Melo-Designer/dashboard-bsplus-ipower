'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block mb-2 font-semibold text-text-color',
          className
        )}
        {...props}
      />
    )
  }
)
Label.displayName = 'Label'

export { Label }
