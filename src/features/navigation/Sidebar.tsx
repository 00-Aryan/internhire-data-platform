'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export interface SidebarItem {
  label: string;
  href?: string;               // optional for actions like logout
  match?: 'exact' | 'startsWith';
  action?: () => void;         // for buttons like logout
  variant?: 'danger';          // styling hint
}

interface SidebarProps {
  items: SidebarItem[];
}

export default function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (item: SidebarItem) => {
    if (!item.href) return false;
    if (item.match === 'startsWith') {
      return pathname.startsWith(item.href);
    }
    return pathname === item.href;
  };

  return (
    <aside className="w-54 bg-[#E5E7EB] hidden md:flex flex-col pt-6 px-4 min-h-screen">
      <nav className="space-y-2 text-base font-medium">
        {items.map((item) => {
          // Logout / action item
          if (item.action) {
            return (
              <button
                key={item.label}
                onClick={item.action}
                className={`w-full text-left px-4 py-3 rounded-lg transition
                  ${
                    item.variant === 'danger'
                      ? 'text-red-600 hover:bg-red-100'
                      : 'hover:bg-[#D1D5DB]'
                  }`}
              >
                {item.label}
              </button>
            );
          }

          // Normal link
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`block px-4 py-3 rounded-lg transition hover:bg-[#D1D5DB] ${
                isActive(item) ? 'bg-[#D1D5DB]' : ''
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
