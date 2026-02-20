import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
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
    <div className={`border rounded-lg relative overflow-hidden ${bestValue ? 'border-2 border-primary' : ''}`}>
        {bestValue && <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">MELHOR VALOR</div>}
        <div className="p-6 text-center">
            <h3 className="font-semibold text-base mb-2">{title}</h3>
            <p className="text-3xl font-bold mb-1">{price}</p>
            <p className="text-muted-foreground text-sm mb-6">/{period}</p>
            <Button className={`w-full ${!bestValue && 'bg-card text-primary border-primary hover:bg-muted'}`} variant={bestValue ? 'default' : 'outline'}>{cta}</Button>
        </div>
    </div>
);

export default function PremiumPage() {
  return (
    <MainLayout>
        <div className="h-full flex flex-col bg-card">
            <div className="p-6 text-center pt-12">
                <div className="inline-block bg-primary text-primary-foreground p-3 rounded-full mb-4">
                    <Star className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold mb-2">PinLembrete Pro</h1>
                <p className="text-muted-foreground">Desbloqueie todo o potencial do app.</p>
            </div>
            
            <div className="px-6 flex-1">
                <div className="bg-muted/50 p-6 rounded-lg mb-8">
                    <ul className="space-y-3">
                        {benefits.map(benefit => (
                            <li key={benefit} className="flex items-center">
                                <Check className="h-5 w-5 text-secondary mr-3" />
                                <span className="font-medium text-sm">{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-4">
                    <PlanCard title="Mensal" price="R$ 19,90" period="mês" cta="Assinar agora" />
                    <PlanCard title="Anual" price="R$ 149,90" period="ano" cta="Assinar agora" bestValue />
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
