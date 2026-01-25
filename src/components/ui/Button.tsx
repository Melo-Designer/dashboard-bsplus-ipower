'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.AriaAttributes {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  type?: 'button' | 'internal' | 'external'
  link?: string
  onClick?: () => void
  className?: string
  disabled?: boolean
  buttonType?: 'button' | 'submit' | 'reset'
}

export function Button({
  children,
  variant = 'primary',
  type = 'button',
  link,
  onClick,
  className,
  disabled = false,
  buttonType = 'button',
  ...ariaProps
}: ButtonProps) {
  const baseStyles = cn(
    'inline-block border-none rounded-pill px-15 py-3 cursor-pointer',
    'text-center font-highlight text-base font-bold no-underline text-white',
    'transition-all duration-300 ease-in-out hover:opacity-80',
    'focus-visible:outline-2 focus-visible:outline-offset-2',
    variant === 'primary' && 'bg-primary focus-visible:outline-primary',
    variant === 'secondary' && 'bg-secondary focus-visible:outline-secondary',
    disabled && 'opacity-50 cursor-not-allowed',
    className
  )

  // Internal link using Next.js Link
  if (type === 'internal' && link) {
    return (
      <Link
        href={link}
        className={baseStyles}
        aria-disabled={disabled}
        {...ariaProps}
      >
        {children}
      </Link>
    )
  }

  // External link using anchor tag
  if (type === 'external' && link) {
    return (
      <a
        href={link}
        className={baseStyles}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={disabled}
        {...ariaProps}
      >
        {children}
      </a>
    )
  }

  // Default button
  return (
    <button
      type={buttonType}
      onClick={onClick}
      className={baseStyles}
      disabled={disabled}
      aria-disabled={disabled}
      {...ariaProps}
    >
      {children}
    </button>
  )
}
