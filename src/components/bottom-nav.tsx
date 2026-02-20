'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, List, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/map', icon: Map, label: 'Mapa' },
  { href: '/list', icon: List, label: 'Lembretes' },
  { href: '/groups', icon: Users, label: 'Grupos' },
  { href: '/profile', icon: User, label: 'Perfil' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav 
      className="
        fixed bottom-6 left-1/2 z-50 flex h-[68px] w-[90%] max-w-[380px] -translate-x-1/2 
        items-center justify-around rounded-[28px] border border-[rgba(245,245,240,0.08)] bg-[rgba(28,31,26,0.75)]
        shadow-[0_8px_32px_rgba(0,0,0,0.18)]
        [backdrop-filter:blur(40px)_saturate(1.8)]
        [-webkit-backdrop-filter:blur(40px)_saturate(1.8)]
      "
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            href={item.href}
            key={item.label}
            className="flex flex-col items-center text-center transition-transform duration-100 ease-out active:scale-90"
          >
            <div className={cn(
              'flex items-center justify-center h-12 w-12 rounded-xl transition-colors duration-150 ease-out',
              'bg-transparent'
            )}>
              <item.icon
                strokeWidth={1.8}
                className={cn(
                  'h-6 w-6',
                  isActive ? 'text-primary' : 'text-[rgba(245,245,240,0.45)]'
                )}
              />
            </div>
            <span className={cn(
                'text-[10px] font-medium leading-none',
                isActive ? 'text-primary font-semibold' : 'text-[rgba(245,245,240,0.45)]'
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
