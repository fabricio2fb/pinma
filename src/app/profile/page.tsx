import { MainLayout } from '@/components/main-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ChevronRight, Bell, Map, Users, Star, LogOut } from 'lucide-react';
import Link from 'next/link';

const StatCard = ({ value, label }: { value: string | number, label: string }) => (
    <div className="glassmorphism rounded-xl p-4 text-center">
        <p className="text-2xl font-bold font-headline">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
    </div>
);

const SettingsItem = ({ icon, label, href }: { icon: React.ElementType, label: string, href: string }) => {
    const Icon = icon;
    return (
        <Link href={href} className="flex items-center p-4 hover:bg-white/5 rounded-lg transition-colors">
            <Icon className="h-5 w-5 mr-4 text-accent" />
            <span className="flex-1 font-medium">{label}</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>
    );
};

export default function ProfilePage() {
    const userAvatar = PlaceHolderImages.find(img => img.id === 'avatar-1');
  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex flex-col items-center text-center mt-8 mb-10">
            <div className="relative mb-4">
                 <Avatar className="h-24 w-24 border-4 border-transparent" style={{
                    borderImage: 'linear-gradient(to bottom right, hsl(var(--primary)), hsl(var(--accent))) 1'
                 }}>
                    {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" />}
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
            </div>
            <h2 className="font-headline text-2xl font-bold">Usuário Teste</h2>
            <p className="text-muted-foreground">usuario@pinlembrete.com</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard value={12} label="Total" />
            <StatCard value={8} label="Concluídos" />
            <StatCard value={3} label="Grupos" />
        </div>

        <Card className="glassmorphism p-2">
            <SettingsItem icon={Bell} label="Notificações" href="#" />
            <SettingsItem icon={Map} label="Preferências de Localização" href="#" />
            <SettingsItem icon={Users} label="Gerenciar Grupos" href="#" />
            <Separator className="my-2 bg-white/10" />
            <SettingsItem icon={Star} label="PinLembrete Premium" href="/premium" />
            <Separator className="my-2 bg-white/10" />
            <Link href="/login" className="flex items-center p-4 hover:bg-destructive/10 rounded-lg transition-colors text-destructive">
                <LogOut className="h-5 w-5 mr-4" />
                <span className="flex-1 font-medium">Sair</span>
            </Link>
        </Card>

      </div>
    </MainLayout>
  );
}
