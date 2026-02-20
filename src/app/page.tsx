import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/icons/logo';

const onboardingSlides = [
  {
    image: PlaceHolderImages.find(img => img.id === 'onboarding-1'),
    title: 'Lembre onde importa',
    subtitle: 'Crie lembretes que disparam automaticamente quando você chegar em qualquer lugar.',
  },
  {
    image: PlaceHolderImages.find(img => img.id === 'onboarding-2'),
    title: 'Compartilhe com quem ama',
    subtitle: 'Crie grupos familiares e divida tarefas por localização.',
  },
  {
    image: PlaceHolderImages.find(img => img.id === 'onboarding-3'),
    title: 'Nunca mais esqueça nada',
    subtitle: 'O app avisa na hora certa, no lugar certo.',
  },
];

export default function OnboardingPage() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#1A1A2E] to-[#0F3460]">
      <div className="flex-shrink-0 pt-16 pb-8 flex justify-center">
        <Logo className="h-12 w-12 text-primary" />
      </div>

      <Carousel className="w-full flex-grow flex flex-col" opts={{ loop: true }}>
        <CarouselContent className="flex-grow">
          {onboardingSlides.map((slide, index) => (
            <CarouselItem key={index} className="flex flex-col items-center justify-center text-center px-8">
              <div className="relative w-64 h-64 mb-12">
                {slide.image && (
                  <Image
                    src={slide.image.imageUrl}
                    alt={slide.image.description}
                    width={256}
                    height={256}
                    data-ai-hint={slide.image.imageHint}
                    className="rounded-full object-cover"
                  />
                )}
              </div>
              <h2 className="font-headline text-3xl font-bold mb-4">{slide.title}</h2>
              <p className="text-muted-foreground max-w-xs mx-auto">{slide.subtitle}</p>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex-shrink-0 pb-6 px-8">
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
      </Carousel>

      <div className="flex-shrink-0 p-8 pt-4">
        <Button asChild className="w-full" size="lg" style={{boxShadow: '0 4px 20px rgba(108,99,255,0.4)'}}>
          <Link href="/login">Começar agora</Link>
        </Button>
      </div>
    </div>
  );
}
