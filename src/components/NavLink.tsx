'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export function NavLink({
  href,
  className = '',
  activeClassName = '',
  children,
}: {
  href: string
  className?: string
  activeClassName?: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const active = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link href={href} className={`${className} ${active ? activeClassName : ''}`.trim()}>
      {children}
    </Link>
  )
}
