'use client';

import { MainLayout } from '@/components/main-layout';
import { Button } from '@/components/ui/button';
import { Check, Star, Zap, Shield, Users, Bell, Smartphone, Headphones } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const benefits = [
    { icon: Zap, label: 'Lembretes ilimitados', desc: 'Sem restrições de quantidade' },
    { icon: Users, label: 'Grupos com até 10 pessoas', desc: 'Colabore com quem você quer' },
    { icon: Smartphone, label: 'Sincronização entre dispositivos', desc: 'Acesse de qualquer lugar' },
    { icon: Bell, label: 'Ícones e sons exclusivos', desc: 'Personalize sua experiência' },
    { icon: Headphones, label: 'Suporte prioritário', desc: 'Atendimento em até 2h' },
];

type Plan = {
    id: string;
    title: string;
    price: string;
    period: string;
    priceNote?: string;
    bestValue?: boolean;
    tier: string;
};

const plans: Plan[] = [
    {
        id: 'monthly',
        title: 'Mensal',
        price: 'R$ 19,90',
        period: 'mês',
        tier: 'premium_monthly',
    },
    {
        id: 'annual',
        title: 'Anual',
        price: 'R$ 149,90',
        period: 'ano',
        priceNote: 'equivale a R$ 12,49/mês',
        bestValue: true,
        tier: 'premium_annual',
    },
];

export default function PremiumPage() {
    const [currentPlan, setCurrentPlan] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<string>('annual');
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('profiles')
                .select('plan_tier')
                .eq('id', user.id)
                .single();

            if (data?.plan_tier) setCurrentPlan(data.plan_tier);
            setIsLoading(false);
        }
        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isPremium = currentPlan && currentPlan !== 'free' && currentPlan !== null;

    return (
        <MainLayout>
            <div className="h-full overflow-y-auto pb-28 lg:pb-0">
                <div className="max-w-2xl mx-auto px-5 lg:px-0 lg:py-12 flex flex-col gap-10">

                    {/* Hero */}
                    <div className="pt-12 lg:pt-0 flex flex-col items-center text-center gap-4">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30">
                                <img src="/logop.png" alt="AlertLoc" style={{ width: 48, height: 48, objectFit: 'contain' }} />
                            </div>
                            <div className="absolute -inset-2 rounded-[28px] border border-primary/20 animate-pulse" />
                        </div>

                        <div>
                            <h1 className="text-4xl font-black tracking-tight mt-2">AlertLoc Pro</h1>
                            <p className="text-muted-foreground mt-2 text-base">
                                Desbloqueie todo o potencial do app.
                            </p>
                        </div>

                        {isPremium && (
                            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm font-semibold px-4 py-2 rounded-full">
                                <Shield size={14} />
                                Plano ativo: <span className="capitalize">{currentPlan}</span>
                            </div>
                        )}
                    </div>

                    {/* Benefits */}
                    <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-[32px] p-6 lg:p-8 flex flex-col gap-4">
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                            O que está incluso
                        </h2>
                        {benefits.map(({ icon: Icon, label, desc }) => (
                            <div key={label} className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Icon size={18} className="text-primary" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-semibold">{label}</span>
                                    <span className="text-xs text-muted-foreground">{desc}</span>
                                </div>
                                <Check size={16} className="text-primary ml-auto shrink-0" />
                            </div>
                        ))}
                    </div>

                    {/* Plans */}
                    <div className="flex flex-col gap-4">
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Escolha seu plano
                        </h2>

                        {plans.map((plan) => {
                            const isSelected = selectedPlan === plan.id;
                            const isCurrentPlan = currentPlan === plan.tier;

                            return (
                                <button
                                    key={plan.id}
                                    onClick={() => setSelectedPlan(plan.id)}
                                    className={`relative w-full text-left rounded-[28px] border-2 p-6 transition-all duration-200 ${isSelected
                                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                        : 'border-border/60 bg-card/40 hover:border-border'
                                        }`}
                                >
                                    {plan.bestValue && (
                                        <div className="absolute -top-3 left-6 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                                            Melhor valor
                                        </div>
                                    )}

                                    {isCurrentPlan && (
                                        <div className="absolute -top-3 right-6 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                                            Plano atual
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-base">{plan.title}</span>
                                            {plan.priceNote && (
                                                <span className="text-xs text-muted-foreground mt-0.5">{plan.priceNote}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-2xl font-black">{plan.price}</span>
                                            <span className="text-xs text-muted-foreground">/{plan.period}</span>
                                        </div>
                                    </div>

                                    <div className={`absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-primary bg-primary' : 'border-border'
                                        }`}>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col gap-3">
                        <Button
                            className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            disabled={isLoading || isPremium as boolean}
                        >
                            {isPremium ? 'Plano já ativo ✓' : 'Assinar agora'}
                        </Button>

                        <p className="text-center text-xs text-muted-foreground">
                            <Link href="/map" className="underline underline-offset-2 hover:text-foreground transition-colors">
                                Voltar ao mapa
                            </Link>
                            {' · '}Cancele quando quiser. Sem surpresas.
                        </p>
                    </div>

                </div>
            </div>
        </MainLayout>
    );
}