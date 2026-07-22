'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Plus, Settings, Zap } from 'lucide-react';

const SOURCE_COLORS: Record<string, string> = {
  dice: 'bg-orange-500',
  upwork: 'bg-emerald-500',
  freelancer: 'bg-blue-500',
  linkedin: 'bg-sky-500',
};

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/campaigns', label: 'Campaigns', icon: Briefcase },
  { href: '/campaigns/new', label: 'New Campaign', icon: Plus },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0a0a0a] border-r border-white/[0.06] flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">Job Intelligence</p>
            <p className="text-[10px] text-neutral-500 leading-tight">AI Job Scraper</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-white/[0.08] text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Source legend */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <p className="text-[10px] text-neutral-600 uppercase tracking-widest mb-2">Sources</p>
        {Object.entries(SOURCE_COLORS).map(([src, color]) => (
          <div key={src} className="flex items-center gap-2 py-0.5">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-xs text-neutral-400 capitalize">{src === 'linkedin' ? 'LinkedIn Jobs' : src.charAt(0).toUpperCase() + src.slice(1)}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
