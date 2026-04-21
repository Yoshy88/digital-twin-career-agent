'use client';

import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

const navLinks = [
  { label: 'Home', href: '#' },
  { label: 'Services', href: '#' },
  { label: 'About', href: '#' },
  { label: 'Contact', href: '#' },
]

export default function Header() {
  return (
    <header className="w-full bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + Brand */}
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/g1logoupdated.png"
            alt="Digital Twin"
            className="w-12 h-12 rounded-full bg-neutral-900 dark:bg-neutral-800 object-contain flex-shrink-0 p-1"
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-neutral-900 dark:text-white text-base font-semibold tracking-tight">
              Digital Twin
            </span>
            {/* Online status */}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">24/7 Active</span>
            </div>
          </div>
        </div>

        {/* Nav Links + Theme Toggle */}
        <nav className="hidden sm:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        {/* Mobile Theme Toggle */}
        <div className="sm:hidden">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
