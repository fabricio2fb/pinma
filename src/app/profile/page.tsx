import { MainLayout } from '@/components/main-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ChevronRight, Bell, Map, Users, Star, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

const StatCard = ({ value, label }: { value: string | number, label: string }) => (
    <div className="text-center">
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
);

const SettingsItem = ({ icon, label, href, isPro = false }: { icon: React.ElementType, label: string, href: string, isPro?: boolean }) => {
    const Icon = icon;
    return (
        <Link href={href} className="flex items-center p-4 -mx-4 hover:bg-muted rounded-lg transition-colors">
            <Icon className="h-5 w-5 mr-4 text-muted-foreground" />
            <span className="flex-1 font-medium text-sm">{label}</span>
            {isPro && <Badge variant="default" className="mr-2 text-xs bg-[#0A0A0A] text-primary-foreground hover:bg-[#0A0A0A]/90">PRO</Badge>}
            <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
        </Link>
    );
};

export default function ProfilePage() {
    const userAvatar = PlaceHolderImages.find(img => img.id === 'avatar-1');
  return (
    <MainLayout>
      <div className="p-6 pb-28">
        <div className="flex flex-col items-center text-center mt-6 mb-8">
            <Avatar className="h-20 w-20 border-2 mb-4">
                {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" />}
                <AvatarFallback>UT</AvatarFallback>
            </Avatar>
            <h2 className="font-bold text-xl">Usuário Teste</h2>
            <p className="text-muted-foreground text-sm">usuario@pinlembrete.com</p>
        </div>

        <div className="grid grid-cols-3 gap-4 my-8 py-4 border-y">
            <StatCard value={12} label="Total" />
            <StatCard value={8} label="Concluídos" />
            <StatCard value={3} label="Grupos" />
        </div>

        <div className="px-4">
            <SettingsItem icon={Bell} label="Notificações" href="#" />
            <SettingsItem icon={Map} label="Preferências de Localização" href="#" />
            <SettingsItem icon={Users} label="Gerenciar Grupos" href="#" />
            <Separator className="my-2 bg-border -mx-4 w-auto" />
            <SettingsItem icon={Star} label="PinLembrete Premium" href="/premium" isPro />
            <Separator className="my-2 bg-border -mx-4 w-auto" />
            <Link href="/login" className="flex items-center p-4 -mx-4 hover:bg-destructive/10 rounded-lg transition-colors text-destructive">
                <LogOut className="h-5 w-5 mr-4" />
                <span className="flex-1 font-medium text-sm">Sair</span>
            </Link>
        </div>
      </div>
    </MainLayout>
  );
}
