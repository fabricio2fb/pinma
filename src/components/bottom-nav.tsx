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
    <nav className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto h-[60px] bg-card/95 backdrop-blur-sm border-t z-50">
      <div className="flex justify-around items-center h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.label} className="flex flex-col items-center gap-1 text-muted-foreground/80 hover:text-primary transition-colors w-16">
              <item.icon strokeWidth={isActive ? 2 : 1.5} className={cn('h-6 w-6', isActive && 'text-primary')} />
              <span className={cn('text-xs', isActive && 'text-primary font-semibold')}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
