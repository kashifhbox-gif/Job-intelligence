'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { LayoutDashboard, Briefcase, Plus, Settings, Zap, Users, LogOut, Layers } from 'lucide-react';

const PLATFORMS = [
  { id: 'upwork', label: 'Upwork', color: 'bg-emerald-500', dot: 'bg-emerald-400' },
  { id: 'freelancer', label: 'Freelancer', color: 'bg-blue-500', dot: 'bg-blue-400' },
  { id: 'dice', label: 'Dice', color: 'bg-orange-500', dot: 'bg-orange-400' },
  { id: 'linkedin', label: 'LinkedIn Jobs', color: 'bg-sky-500', dot: 'bg-sky-400' },
];

function PlatformNav() {
  const pathname = usePathname();

  return (
    <div className="space-y-0.5">
      {PLATFORMS.map(({ id, label, dot }) => {
        const platformHref = `/platforms/${id}`;
        const isSelected = pathname.startsWith(platformHref);
        return (
          <Link
            key={id}
            href={platformHref}
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
              isSelected
                ? 'bg-white/[0.08] text-white font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full ${dot}`} />
              <span>{label}</span>
            </div>
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Open</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const mainNavItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/campaigns', label: 'All Campaigns', icon: Briefcase },
    { href: '/campaigns/new', label: 'New Campaign', icon: Plus },
  ];

  const adminNavItems = [
    { href: '/users', label: 'Users', icon: Users },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0a0a0a] border-r border-white/[0.06] flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">HBOX LeadPulse AI</p>
            <p className="text-[10px] text-neutral-500 leading-tight">Staff Augmentation Engine</p>
          </div>
        </div>
      </div>

      {/* Nav Content */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Main Links */}
        <div className="space-y-0.5">
          <p className="px-3 text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-2">Main</p>
          {mainNavItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/' 
              ? pathname === '/' 
              : href === '/campaigns' 
                ? pathname === '/campaigns' 
                : pathname.startsWith(href);
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
        </div>

        {/* Platforms Links */}
        <div>
          <div className="flex items-center gap-1.5 px-3 text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-2">
            <Layers className="w-3 h-3 text-neutral-500" />
            <span>Platforms</span>
          </div>
          <Suspense fallback={<div className="text-xs text-neutral-600 px-3">Loading...</div>}>
            <PlatformNav />
          </Suspense>
        </div>

        {/* Admin Links */}
        {role === 'admin' && (
          <div>
            <p className="px-3 text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-2">Admin System</p>
            <div className="space-y-0.5">
              {adminNavItems.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
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
            </div>
          </div>
        )}
      </div>

      {/* Footer / Account & Logout */}
      <div className="p-3 border-t border-white/[0.06] bg-black/40">
        {session?.user?.email && (
          <div className="px-3 py-1.5 mb-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <p className="text-xs font-medium text-white truncate">{session.user.email}</p>
            <p className="text-[10px] text-neutral-500 capitalize">{role} Account</p>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-150"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
