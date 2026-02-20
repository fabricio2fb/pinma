'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/map', icon: Home, label: 'Mapa' },
  { href: '/list', icon: List, label: 'Lista' },
  { href: '/groups', icon: Users, label: 'Grupos' },
  { href: '/profile', icon: User, label: 'Perfil' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm h-20 bg-card/60 backdrop-blur-lg border-t border-white/10 md:bottom-2.5 md:rounded-3xl md:w-[calc(100%-2rem)]">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.label} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
              <item.icon className={cn('h-6 w-6', isActive && 'text-primary')} />
              <span className={cn('text-xs', isActive && 'text-primary font-bold')}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
