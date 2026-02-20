import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';
import Link from 'next/link';

const benefits = [
    "Lembretes ilimitados",
    "Grupos com até 10 pessoas",
    "Sincronização entre dispositivos",
    "Ícones e sons exclusivos",
    "Suporte prioritário"
];

const PlanCard = ({ title, price, period, bestValue = false, cta }: { title: string, price: string, period: string, bestValue?: boolean, cta: string }) => (
    <Card className={`glassmorphism relative overflow-hidden ${bestValue ? 'border-2 border-accent' : ''}`}>
        {bestValue && <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">Economize 37%</div>}
        <CardContent className="p-6 text-center">
            <h3 className="font-headline text-xl font-bold mb-2">{title}</h3>
            <p className="text-3xl font-bold mb-1">{price}</p>
            <p className="text-muted-foreground text-sm mb-6">/{period}</p>
            <Button className="w-full" variant={bestValue ? 'default' : 'outline'}>{cta}</Button>
        </CardContent>
    </Card>
);

export default function PremiumPage() {
  return (
    <MainLayout>
        <div className="h-full flex flex-col bg-gradient-to-b from-[#10101A] to-[#0F3460]">
            <div className="p-6 text-center pt-12">
                <div className="inline-block bg-gradient-to-r from-yellow-400 to-amber-500 p-3 rounded-full mb-4">
                    <Star className="h-8 w-8 text-white" fill="white" />
                </div>
                <h1 className="font-headline text-3xl font-bold text-white mb-2">PinLembrete Premium</h1>
                <p className="text-muted-foreground">Desbloqueie todo o potencial do app.</p>
            </div>
            
            <div className="px-6 flex-1">
                <Card className="glassmorphism p-6 mb-8">
                    <ul className="space-y-3">
                        {benefits.map(benefit => (
                            <li key={benefit} className="flex items-center">
                                <Check className="h-5 w-5 text-green-500 mr-3" />
                                <span className="font-medium">{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </Card>

                <div className="space-y-4">
                    <PlanCard title="Mensal" price="R$ 19,90" period="mês" cta="Assinar agora" />
                    <PlanCard title="Anual" price="R$ 149,90" period="ano" cta="Assinar agora" bestValue />
                    <PlanCard title="Família" price="R$ 29,90" period="mês" cta="Assinar agora" />
                </div>
            </div>

            <div className="p-6 text-center">
                 <p className="text-xs text-muted-foreground">
                    <Link href="/map" className="underline">Voltar</Link>
                    . Cancele quando quiser.
                </p>
            </div>
        </div>
    </MainLayout>
  );
}
