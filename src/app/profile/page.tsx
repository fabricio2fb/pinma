'use client';

import { MainLayout } from '@/components/main-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ChevronRight, Bell, Map, Users, Star, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

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
    const [stats, setStats] = useState({ total: 0, completed: 0, groups: 0 });
    const supabase = createClient();
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
                const [remindersRes, groupsRes] = await Promise.all([
                    supabase.from('reminders').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
                    supabase.from('group_members').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
                ]);

                setStats({
                    total: remindersRes.count || 0,
                    completed: 0, // Implement status filter if needed
                    groups: groupsRes.count || 0
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
            <div className="p-6 pb-28">
                <div className="flex flex-col items-center text-center mt-6 mb-8">
                    <Avatar className="h-20 w-20 border-2 border-border mb-4">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="User Avatar" />
                        <AvatarFallback>{profile?.full_name?.substring(0, 2)?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <h2 className="font-bold text-xl">{profile?.full_name ? `@${profile.full_name}` : 'Carregando...'}</h2>
                    <p className="text-muted-foreground text-sm">{user?.email || 'carregando...'}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 my-8 py-4 border-y border-border">
                    <StatCard value={stats.total} label="Total" />
                    <StatCard value={stats.completed} label="Concluídos" />
                    <StatCard value={stats.groups} label="Grupos" />
                </div>

                <div className="px-4">
                    <SettingsSwitchItem icon={Bell} label="Notificações" />
                    <SettingsSwitchItem icon={Map} label="Preferências de Localização" />
                    <SettingsItem icon={Users} label="Gerenciar Grupos" href="/groups" />
                    <Separator className="my-2 bg-border -mx-4 w-auto" />
                    <SettingsItem icon={Star} label="PinLembrete Premium" href="/premium" isPro />
                    <Separator className="my-2 bg-border -mx-4 w-auto" />
                    <button onClick={handleLogout} className="w-full flex items-center p-4 -mx-4 hover:bg-destructive/10 rounded-lg transition-colors text-destructive">
                        <LogOut className="h-5 w-5 mr-4" />
                        <span className="flex-1 text-left font-medium text-sm">Sair</span>
                    </button>
                </div>
            </div>
        </MainLayout>
    );
}
