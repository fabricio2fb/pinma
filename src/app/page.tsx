import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PinIcon } from '@/components/icons/logo';

export default function OnboardingPage() {
  return (
    <div className="flex flex-col h-dvh justify-between text-center p-8 bg-card">
      <div className="flex-grow flex flex-col items-center justify-center">
        <PinIcon className="h-10 w-10 text-primary mb-6" />
        <h1 className="text-3xl font-bold mb-2">Lembre onde importa</h1>
        <p className="text-muted-foreground max-w-xs mx-auto text-base">
          Crie lembretes que disparam automaticamente quando você chegar em qualquer lugar.
        </p>
      </div>

      <div className="flex-shrink-0">
        <Button asChild className="w-full" size="lg">
          <Link href="/login">Começar agora</Link>
        </Button>
      </div>
    </div>
  );
}
