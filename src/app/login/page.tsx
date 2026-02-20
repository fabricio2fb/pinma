'use client';
import { useState } from 'react';
import { Eye, EyeOff, KeyRound, Mail } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PinIcon } from '@/components/icons/logo';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const SocialButton = ({ children, ...props }: React.ComponentProps<typeof Button>) => (
    <Button variant="outline" className="w-full" {...props}>
      {children}
    </Button>
  );

  const Form = ({ isRegister = false }: { isRegister?: boolean }) => (
    <div className="space-y-4">
      <div className="relative">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input type="email" placeholder="E-mail" className="pl-12 bg-muted focus-visible:ring-offset-0" />
      </div>
      <div className="relative">
        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input type={showPassword ? 'text' : 'password'} placeholder="Senha" className="pl-12 pr-12 bg-muted focus-visible:ring-offset-0" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </Button>
      </div>
      {isRegister && (
        <div className="relative">
          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input type={showPassword ? 'text' : 'password'} placeholder="Confirmar Senha" className="pl-12 pr-12 bg-muted focus-visible:ring-offset-0" />
        </div>
      )}
      <Button asChild className="w-full" size="lg">
        <Link href="/map">{isRegister ? 'Cadastrar' : 'Entrar'}</Link>
      </Button>
    </div>
  );

  return (
    <div className="h-dvh w-full flex flex-col justify-center items-center p-6 bg-card">
        <div className="w-full max-w-sm">
            <div className="text-center mb-10">
                <PinIcon className="mx-auto h-8 w-8 text-primary mb-4" />
                <h1 className="font-bold text-2xl">Bem-vindo</h1>
                <p className="text-muted-foreground">Acesse sua conta para continuar</p>
            </div>

            <div>
                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Entrar</TabsTrigger>
                        <TabsTrigger value="register">Cadastrar</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login" className="pt-6">
                        <Form />
                    </TabsContent>
                    <TabsContent value="register" className="pt-6">
                        <Form isRegister />
                    </TabsContent>
                </Tabs>
                <div className="mt-6">
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                ou continue com
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SocialButton>
                            <svg className="mr-2 h-5 w-5" role="img" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.67-4.66 1.67-3.86 0-6.99-3.16-6.99-7.12s3.13-7.12 6.99-7.12c2.18 0 3.54.88 4.61 1.9l-1.71 1.71c-.96-.91-2.18-1.71-4.61-1.71-2.91 0-5.21 2.35-5.21 5.21s2.3 5.21 5.21 5.21c3.22 0 4.51-2.18 4.79-3.21h-4.79v-3.28h7.84c.04.3.06.61.06 1.02 0 2.69-.73 4.92-2.25 6.48-1.52 1.56-3.46 2.3-5.65 2.3-4.82 0-8.72-3.82-8.72-8.5s3.9-8.5 8.72-8.5c2.73 0 4.82 1 6.3 2.4l-1.39 1.39C16.86 5.3 14.95 4.5 12.48 4.5c-3.32 0-6.03 2.73-6.03 6.03s2.71 6.03 6.03 6.03c2.15 0 3.45-.94 4.38-1.87.82-.82 1.25-2.02 1.38-3.31H12.48z"></path></svg>
                            Google
                        </SocialButton>
                        <SocialButton>
                             <svg className="mr-2 h-5 w-5" role="img" viewBox="0 0 24 24" fill="currentColor"><path d="M12.15,2.5a6.5,6.5,0,0,0-5.3,10.29,6.6,6.6,0,0,0,4.8,2.35A6.5,6.5,0,0,0,12.15,2.5ZM12,13a3.89,3.89,0,0,1-2.7-1.2,3.89,3.89,0,0,1,0-5.5,3.89,3.89,0,0,1,5.5,0,3.89,3.89,0,0,1,0,5.5A3.89,3.89,0,0,1,12,13Zm8.32,9.36a9.42,9.42,0,0,1-3.13,1.61,10.22,10.22,0,0,1-1.89.47,4.3,4.3,0,0,1-1.39-.24,4.5,4.5,0,0,1-1.26-.69,1.3,1.3,0,0,0-1.42,0,4.5,4.5,0,0,1-1.26.69,4.3,4.3,0,0,1-1.39.24,10.22,10.22,0,0,1-1.89-.47,9.42,9.42,0,0,1-3.13-1.61A9.7,9.7,0,0,1,2,15.11a10,10,0,0,1,.13-4.13A12.5,12.5,0,0,1,1.5,8.4,10.87,10.87,0,0,1,4.2,4.24a10.87,10.87,0,0,1,4.19-2.73,12.5,12.5,0,0,1,2.58-.6A10,10,0,0,1,15,2.05a9.7,9.7,0,0,1,6.86,7.24,9.42,9.42,0,0,1-.19,3.24,9.7,9.7,0,0,1-1.35,2.83Z"></path></svg>
                            Apple
                        </SocialButton>
                    </div>

                    <div className="text-center mt-8">
                        <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            Esqueceu sua senha?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}
