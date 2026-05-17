'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Map, List, Users, User, Settings, Bookmark, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/map', icon: Map, label: 'Mapa' },
  { href: '/list', icon: List, label: 'Lembretes' },
  { href: '/saved-places', icon: Bookmark, label: 'Meus Lugares' },
  { href: '/groups', icon: Users, label: 'Grupos' },
  { href: '/profile?inbox=1', icon: Mail, label: 'Caixa de Entrada' },
  { href: '/profile', icon: User, label: 'Perfil' },
  { href: '/settings', icon: Settings, label: 'Configurações' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<{
    full_name: string;
    email: string;
    plan_tier: string;
  } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, plan_tier')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({ ...data, email: user.email || '' });
      }
    }

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-full w-72 bg-card/40 backdrop-blur-3xl border-r border-border/50 flex flex-col p-6 gap-8">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2">
        <Image
          src="/logob.png"
          alt="AlertLoc"
          width={40}
          height={40}
          style={{ objectFit: 'contain' }}
        />
        <h1 className="text-2xl font-bold tracking-tight">AlertLoc</h1>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href.startsWith('/profile?') && pathname === '/profile');
          return (
            <Link
              href={item.href}
              key={item.label}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/10'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon
                size={22}
                className={cn(
                  'transition-transform group-hover:scale-110',
                  isActive ? 'text-white' : 'text-muted-foreground'
                )}
              />
              <span className="font-semibold">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Nav & User */}
      <div className="flex flex-col gap-6 border-t border-border/50 pt-6 mt-auto">


        {/* User Card */}
        <div className="bg-muted/40 p-4 rounded-3xl border border-border/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary/60 border-2 border-background shadow-md flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
            {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold truncate">
              {profile?.full_name || '...'}
            </span>
            <span className="text-[10px] text-muted-foreground truncate capitalize">
              {profile?.plan_tier || 'Gratuito'}
            </span>
          </div>
          <div className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse shrink-0" />
        </div>
      </div>
    </div>
  );
}
