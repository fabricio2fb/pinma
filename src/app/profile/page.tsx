'use client';

import { MainLayout } from '@/components/main-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ChevronRight, Bell, Users, Star, LogOut, Mail, Bookmark, Settings } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { InboxSheet } from '@/components/inbox-sheet';

const StatCard = ({ value, label }: { value: string | number, label: string }) => (
  <div className="text-center">
    <p className="text-xl font-bold">{value}</p>
    <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
  </div>
);

const SettingsItem = ({ icon, label, href, isPro = false }: { icon: React.ElementType, label: string, href: string, isPro?: boolean }) => {
  const Icon = icon;
  return (
    <Link href={href} className="flex items-center p-4 -mx-4 hover:bg-accent rounded-lg transition-colors">
      <Icon className="h-5 w-5 mr-4 text-muted-foreground" />
      <span className="flex-1 font-medium text-sm">{label}</span>
      {isPro && <Badge variant="default" className="mr-2 text-xs bg-[#0A0A0A] text-primary-foreground hover:bg-[#0A0A0A]/90">PRO</Badge>}
      <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
    </Link>
  );
};

const SettingsSwitchItem = ({ icon, label, defaultChecked = true }: { icon: React.ElementType, label: string, defaultChecked?: boolean }) => {
  const Icon = icon;
  const [isChecked, setIsChecked] = useState(defaultChecked);
  const id = label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex items-center p-4 -mx-4">
      <Icon className="h-5 w-5 mr-4 text-muted-foreground" />
      <label htmlFor={id} className="flex-1 font-medium text-sm cursor-pointer">
        {label}
      </label>
      <Switch
        id={id}
        checked={isChecked}
        onCheckedChange={setIsChecked}
        aria-label={label}
      />
    </div>
  );
};


export default function ProfilePage() {
  const userAvatar = PlaceHolderImages.find(img => img.id === 'avatar-1');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, completed: 0, groups: 0, invites: 0, places: 0 });
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);

        // Fetch Profile
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profileData) {
          setProfile(profileData);
        }

        // Fetch Stats
        const [remindersRes, groupsRes, invitesRes, placesRes] = await Promise.all([
          supabase.from('reminders').select('is_active', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('group_members').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('group_invites').select('*', { count: 'exact', head: true }).eq('invitee_id', user.id).eq('status', 'pending'),
          supabase.from('saved_places').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
        ]);

        setStats({
          total: remindersRes.count || 0,
          completed: remindersRes.data?.filter((item: any) => item.is_active === false).length || 0,
          groups: groupsRes.count || 0,
          invites: invitesRes.count || 0,
          places: placesRes.count || 0
        });
      }
    }
    loadData();
  }, [supabase]);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-full lg:p-12 lg:gap-12">
        {/* PC: Split Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

          {/* Left Column: User Header & Quick Info */}
          <div className="flex flex-col items-center text-center p-6 lg:p-10 lg:w-96 lg:bg-card/40 lg:backdrop-blur-xl lg:border lg:border-border/50 lg:rounded-[48px] lg:shadow-2xl">
            <div className="relative group">
              <Avatar className="h-32 w-32 lg:h-44 lg:w-44 border-4 border-background shadow-2xl transition-transform group-hover:scale-105 duration-500">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="User Avatar" />
                <AvatarFallback className="text-4xl">{profile?.full_name?.substring(0, 2)?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-2 right-2 w-8 h-8 lg:w-10 lg:h-10 bg-primary border-4 border-background rounded-full flex items-center justify-center text-white shadow-lg">
                <Star size={16} className="fill-current" />
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-3xl font-black tracking-tight">{profile?.full_name ? `@${profile.full_name}` : 'Carregando...'}</h2>
              <p className="text-muted-foreground font-medium mt-1 uppercase tracking-[0.2em] text-[10px]">{user?.email || 'carregando...'}</p>
            </div>

            <div className="w-full grid grid-cols-4 gap-2 mt-10">
              <StatCard value={stats.total} label="Pins" />
              <StatCard value={stats.completed} label="Feitos" />
              <StatCard value={stats.groups} label="Grupos" />
              <StatCard value={stats.places} label="Lugares" />
            </div>

            <Button className="w-full mt-10 rounded-2xl h-12 shadow-lg shadow-primary/10" variant="outline" asChild>
              <Link href="/profile/edit">Editar Perfil</Link>
            </Button>
          </div>

          {/* Right Column: Detailed Settings Dashboard */}
          <div className="flex-1 flex flex-col gap-8 order-last lg:order-none px-6 lg:px-0 pb-32 lg:pb-0">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Configurações</h3>
              <p className="text-muted-foreground text-sm mt-1">Personalize sua experiência no AlertLoc</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Account Section */}
              <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-[40px] p-6 lg:p-8 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Aplicativo</h4>
                <InboxSheet>
                  <button className="w-full flex items-center p-4 hover:bg-primary/5 rounded-2xl transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary group-hover:text-white transition-all text-primary">
                      <Mail size={18} />
                    </div>
                    <span className="flex-1 font-semibold text-sm">Caixa de Entrada</span>
                    {stats.invites > 0 && <Badge variant="destructive">{stats.invites}</Badge>}
                  </button>
                </InboxSheet>
                <SettingsSwitchItem icon={Bell} label="Notificações em Tempo Real" />
                <SettingsItem icon={Bookmark} label="Meus Lugares" href="/saved-places" />
                <SettingsItem icon={Settings} label="Configurações" href="/settings" />
              </div>

              {/* Preferences & Subscription */}
              <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-[40px] p-6 lg:p-8 flex flex-col gap-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Assinatura</h4>
                <Link href="/premium" className="w-full flex items-center p-4 bg-gradient-to-br from-primary/10 to-primary/[0.02] border border-primary/20 rounded-2xl transition-all group hover:border-primary/40">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mr-4 shadow-lg shadow-primary/20 text-white">
                    <Star size={18} className="fill-current" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-bold text-sm capitalize">{profile?.plan_tier || 'Gratuito'}</span>
                    <span className="text-[10px] text-muted-foreground">{profile?.plan_tier ? 'Plano ativo' : 'Upgrade disponível'}</span>
                  </div>
                  <Badge className="bg-primary text-white border-none">{profile?.plan_tier ? 'ATIVO' : 'FREE'}</Badge>
                </Link>
                <SettingsItem icon={Users} label="Gerenciar Grupos" href="/groups" />
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center bg-destructive/5 p-6 lg:p-8 rounded-[40px] border border-destructive/10">
              <div className="flex flex-col">
                <p className="font-bold text-destructive">Encerramento</p>
                <p className="text-xs text-muted-foreground">Deseja sair da sua conta?</p>
              </div>
              <Button variant="destructive" className="rounded-2xl h-12 px-8" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
