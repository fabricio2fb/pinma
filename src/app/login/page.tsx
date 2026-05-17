'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  BellRing,
  Eye,
  EyeOff,
  KeyRound,
  LocateFixed,
  Mail,
  MapPin,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';

type Tab = 'login' | 'register';

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('login');

  return (
    <>
      <style>{`
        .authPage {
          min-height: 100dvh;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(390px, 480px);
          background: #0b0f0b;
          color: #f5f5f0;
          overflow-x: hidden;
        }

        .authVisual {
          position: relative;
          height: 100dvh;
          min-height: 720px;
          padding: 28px;
          display: grid;
          grid-template-rows: auto minmax(280px, 1fr) auto;
          gap: 22px;
          overflow: hidden;
          background:
            radial-gradient(circle at 72% 30%, rgba(25, 195, 125, 0.18), transparent 32%),
            radial-gradient(circle at 18% 16%, rgba(53, 208, 192, 0.12), transparent 28%),
            #0b0f0b;
        }

        .authVisual::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.12;
          background-image:
            linear-gradient(rgba(255,255,255,0.11) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.11) 1px, transparent 1px);
          background-size: 54px 54px;
        }

        .authBrand {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: inherit;
          text-decoration: none;
          font-weight: 950;
          font-size: 20px;
        }

        .authBrand img {
          object-fit: contain;
        }

        .authMapCard {
          position: relative;
          z-index: 2;
          min-height: 0;
          height: 100%;
          max-height: 470px;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 32px;
          overflow: hidden;
          background:
            linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02)),
            rgba(18, 23, 18, 0.84);
          box-shadow: 0 34px 100px rgba(0,0,0,0.38);
        }

        .authMapSvg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .authMapSvg path {
          fill: none;
          stroke: rgba(25,195,125,0.16);
          stroke-width: 16;
          stroke-linecap: round;
        }

        .authMapSvg path:nth-child(even) {
          stroke: rgba(244,241,234,0.08);
          stroke-width: 10;
        }

        .authPin,
        .authPlace,
        .authRadius,
        .authRouteDot,
        .authNotification {
          position: absolute;
          z-index: 3;
        }

        .authRadius {
          left: 48%;
          top: 34%;
          width: 200px;
          height: 200px;
          margin-left: -100px;
          margin-top: -100px;
          border: 1px solid rgba(25,195,125,0.42);
          border-radius: 999px;
          background: rgba(25,195,125,0.08);
          animation: radiusPulse 2.8s ease-in-out infinite;
        }

        .authPin {
          left: 48%;
          top: 34%;
          width: 56px;
          height: 56px;
          margin-left: -28px;
          margin-top: -28px;
          border-radius: 20px;
          display: grid;
          place-items: center;
          color: #11140f;
          background: #19c37d;
          box-shadow: 0 18px 42px rgba(25,195,125,0.34);
          animation: pinFloat 3.2s ease-in-out infinite;
        }

        .authRouteDot {
          left: 23%;
          top: 64%;
          width: 22px;
          height: 22px;
          border: 4px solid rgba(244,241,234,0.85);
          border-radius: 999px;
          background: #35d0c0;
          box-shadow: 0 14px 30px rgba(53,208,192,0.28);
        }

        .authPlace {
          min-height: 36px;
          padding: 9px 13px 0;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 999px;
          color: #f5f5f0;
          background: rgba(11,15,11,0.84);
          font-size: 12px;
          font-weight: 850;
          box-shadow: 0 14px 32px rgba(0,0,0,0.22);
        }

        .authPlace.market { left: 14%; top: 24%; }
        .authPlace.pharmacy { right: 12%; top: 46%; }
        .authPlace.home { left: 58%; bottom: 17%; }

        .authNotification {
          left: 34px;
          right: 34px;
          bottom: 24px;
          min-height: 74px;
          padding: 12px;
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 24px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 12px;
          align-items: center;
          background: rgba(18,23,18,0.9);
          backdrop-filter: blur(16px);
          box-shadow: 0 20px 54px rgba(0,0,0,0.34);
        }

        .authNotification img {
          object-fit: contain;
        }

        .authNotification strong,
        .authNotification span {
          display: block;
        }

        .authNotification strong {
          font-size: 14px;
          font-weight: 950;
        }

        .authNotification span,
        .authNotification time {
          color: #a4a79f;
          font-size: 12px;
          font-weight: 750;
        }

        .authHeroCopy {
          position: relative;
          z-index: 2;
          max-width: 660px;
        }

        .authKicker {
          width: max-content;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #19c37d;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .authHeroCopy h1 {
          margin: 14px 0 0;
          max-width: 660px;
          color: #f5f5f0;
          font-size: clamp(38px, 5vw, 64px);
          line-height: 1;
          font-weight: 950;
          letter-spacing: 0;
        }

        .authHeroCopy p {
          max-width: 560px;
          margin: 16px 0 0;
          color: #a4a79f;
          font-size: 16px;
          line-height: 1.55;
          font-weight: 650;
        }

        .authStats {
          margin-top: 18px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .authStats span {
          min-height: 38px;
          padding: 0 12px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #f5f5f0;
          background: rgba(255,255,255,0.045);
          font-size: 13px;
          font-weight: 850;
        }

        .authPanel {
          min-height: 100dvh;
          padding: 28px;
          display: grid;
          place-items: center;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0)),
            #11160f;
          border-left: 1px solid rgba(255,255,255,0.08);
          overflow-y: auto;
        }

        .authCard {
          width: min(100%, 430px);
          padding: 26px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 30px;
          background: rgba(23,28,22,0.78);
          box-shadow: 0 24px 70px rgba(0,0,0,0.28);
        }

        .authMobileLogo {
          display: none;
        }

        .authCard h2 {
          margin: 0;
          color: #f5f5f0;
          font-size: 32px;
          line-height: 1.05;
          font-weight: 950;
        }

        .authCard > p {
          margin: 10px 0 0;
          color: #a4a79f;
          font-size: 14px;
          line-height: 1.55;
          font-weight: 650;
        }

        .authTabs {
          margin-top: 24px;
          padding: 5px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px;
          background: rgba(255,255,255,0.045);
        }

        .authTab {
          min-height: 42px;
          border: 0;
          border-radius: 15px;
          color: #a4a79f;
          background: transparent;
          font-size: 13px;
          font-weight: 900;
          cursor: pointer;
        }

        .authTab.active {
          color: #11140f;
          background: #19c37d;
        }

        .authInputWrap {
          position: relative;
        }

        .authInputIcon {
          position: absolute;
          left: 14px;
          top: 50%;
          width: 17px;
          height: 17px;
          color: #a4a79f;
          pointer-events: none;
          transform: translateY(-50%);
        }

        .authInput {
          width: 100%;
          min-height: 52px;
          padding: 0 14px 0 44px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 17px;
          outline: none;
          color: #f5f5f0;
          background: rgba(255,255,255,0.055);
          font-size: 14px;
          font-weight: 650;
          transition: border-color 160ms ease, background 160ms ease;
        }

        .authInput::placeholder {
          color: rgba(164,167,159,0.78);
        }

        .authInput:focus {
          border-color: rgba(25,195,125,0.48);
          background: rgba(255,255,255,0.075);
        }

        .authInput:-webkit-autofill,
        .authInput:-webkit-autofill:hover,
        .authInput:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 40px #171c16 inset !important;
          -webkit-text-fill-color: #f5f5f0 !important;
        }

        .authEye {
          position: absolute;
          right: 10px;
          top: 50%;
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 12px;
          display: grid;
          place-items: center;
          color: #a4a79f;
          background: transparent;
          cursor: pointer;
          transform: translateY(-50%);
        }

        .authEye:hover {
          color: #f5f5f0;
          background: rgba(255,255,255,0.06);
        }

        .authSubmit {
          width: 100%;
          min-height: 54px;
          margin-top: 4px;
          border: 0;
          border-radius: 18px;
          color: #11140f;
          background: #19c37d;
          font-size: 15px;
          font-weight: 950;
          cursor: pointer;
          box-shadow: 0 18px 42px rgba(25,195,125,0.24);
        }

        .authSubmit:hover {
          filter: brightness(1.06);
        }

        .authSubmit:disabled {
          opacity: 0.58;
          cursor: not-allowed;
          box-shadow: none;
        }

        .authError {
          padding: 12px 14px;
          border: 1px solid rgba(239,68,68,0.34);
          border-radius: 16px;
          color: #fecaca;
          background: rgba(239,68,68,0.12);
          font-size: 13px;
          font-weight: 750;
        }

        .authForgot {
          display: inline-flex;
          margin-top: 18px;
          color: #a4a79f;
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
        }

        .authForgot:hover {
          color: #19c37d;
        }

        .authFootnote {
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid rgba(255,255,255,0.08);
          color: #a4a79f;
          font-size: 12px;
          line-height: 1.5;
          font-weight: 650;
        }

        @keyframes pinFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes radiusPulse {
          0%, 100% { opacity: 0.32; transform: scale(1); }
          50% { opacity: 0.56; transform: scale(1.08); }
        }

        @media (max-width: 1040px) {
          .authPage {
            grid-template-columns: 1fr;
            min-height: 100dvh;
            overflow-y: auto;
          }

          .authVisual {
            display: none;
          }

          .authPanel {
            min-height: 100dvh;
            padding: 18px;
            border-left: 0;
          }

          .authMobileLogo {
            margin-bottom: 18px;
            display: flex;
            align-items: center;
            gap: 10px;
            color: #f5f5f0;
            text-decoration: none;
            font-weight: 950;
            font-size: 18px;
          }

          .authCard {
            padding: 22px;
            border-radius: 28px;
          }
        }

        @media (max-height: 760px) and (min-width: 1041px) {
          .authVisual {
            min-height: 640px;
            padding: 22px;
            gap: 16px;
          }

          .authBrand img {
            width: 34px;
            height: 34px;
          }

          .authMapCard {
            max-height: 330px;
            border-radius: 26px;
          }

          .authHeroCopy h1 {
            font-size: clamp(32px, 4vw, 48px);
          }

          .authHeroCopy p {
            max-width: 520px;
            font-size: 14px;
          }

          .authStats span {
            min-height: 34px;
            font-size: 12px;
          }

          .authPanel {
            align-items: start;
            padding: 18px 28px;
          }

          .authCard {
            padding: 22px;
            border-radius: 26px;
          }

          .authCard h2 {
            font-size: 28px;
          }

          .authFootnote {
            margin-top: 16px;
            padding-top: 14px;
          }
        }
      `}</style>

      <main className="authPage">
        <section className="authVisual" aria-label="AlertLoc">
          <Link href="/lp" className="authBrand">
            <Image src="/logob.png" alt="AlertLoc" width={42} height={42} priority />
            <span>AlertLoc</span>
          </Link>

          <div className="authMapCard" aria-hidden="true">
            <svg className="authMapSvg" viewBox="0 0 1200 720">
              <path d="M-70 156 C180 102 352 218 548 176 C782 126 914 70 1280 106" />
              <path d="M-60 486 C190 386 374 536 628 470 C864 408 1002 322 1280 360" />
              <path d="M174 -40 C214 148 282 270 238 450 C204 586 250 680 300 780" />
              <path d="M684 -42 C628 130 690 254 760 386 C836 526 804 632 770 780" />
              <path d="M1008 -44 C942 118 928 264 1004 418 C1070 548 1108 648 1080 780" />
              <path d="M70 626 L350 430 L598 522 L828 326 L1168 492" />
            </svg>
            <div className="authRadius" />
            <div className="authPin"><MapPin size={30} /></div>
            <div className="authRouteDot" />
            <span className="authPlace market">Mercado</span>
            <span className="authPlace pharmacy">Farmácia</span>
            <span className="authPlace home">Casa</span>
            <div className="authNotification">
              <Image src="/logob.png" alt="" width={30} height={30} />
              <div>
                <strong>Comprar manteiga</strong>
                <span>Você chegou perto do mercado.</span>
              </div>
              <time>agora</time>
            </div>
          </div>

          <div className="authHeroCopy">
            <span className="authKicker"><LocateFixed size={16} /> Lembra quando você chegar lá</span>
            <h1>Entre no painel que conecta seus lembretes ao mapa.</h1>
            <p>
              Gerencie lugares, grupos e lembretes no desktop. O APK cuida dos alertas por localização
              quando você estiver na rua.
            </p>
            <div className="authStats">
              <span><BellRing size={15} /> Funciona com app fechado</span>
              <span><ShieldCheck size={15} /> Alertas por raio</span>
              <span><Users size={15} /> Grupos compartilhados</span>
            </div>
          </div>
        </section>

        <section className="authPanel">
          <div className="authCard">
            <Link href="/lp" className="authMobileLogo">
              <Image src="/logob.png" alt="AlertLoc" width={36} height={36} priority />
              <span>AlertLoc</span>
            </Link>
            <h2>{tab === 'login' ? 'Acesse o AlertLoc' : 'Crie sua conta'}</h2>
            <p>
              {tab === 'login'
                ? 'Continue para ver seus lembretes, lugares salvos, grupos e convites.'
                : 'Cadastre-se para começar a organizar lembretes por localização.'}
            </p>

            <div className="authTabs">
              {(['login', 'register'] as Tab[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`authTab${tab === item ? ' active' : ''}`}
                  onClick={() => setTab(item)}
                >
                  {item === 'login' ? 'Entrar' : 'Cadastrar'}
                </button>
              ))}
            </div>

            {tab === 'login'
              ? <AuthForm key="login" isRegister={false} />
              : <AuthForm key="register" isRegister />
            }

            <Link href="#" className="authForgot">Esqueceu sua senha?</Link>
            <p className="authFootnote">
              O monitoramento em segundo plano acontece no APK Android. No desktop você organiza tudo com mais espaço.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

function AuthForm({ isRegister = false }: { isRegister?: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);

    try {
      const auth = await import('@/app/actions/auth');
      const res = isRegister ? await auth.signup(formData) : await auth.login(formData);
      if (res?.error) setErrorMsg(res.error);
    } catch (err: any) {
      if (err.message?.includes('NEXT_REDIRECT')) throw err;
      setErrorMsg('Ocorreu um erro no servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 22 }}>
      {errorMsg ? <div className="authError">{errorMsg}</div> : null}

      {isRegister ? (
        <div className="authInputWrap">
          <User className="authInputIcon" />
          <input name="username" type="text" placeholder="Nome de usuário (@seunome)" className="authInput" required />
        </div>
      ) : null}

      <div className="authInputWrap">
        {isRegister ? <Mail className="authInputIcon" /> : <User className="authInputIcon" />}
        <input
          name={isRegister ? 'email' : 'login'}
          type={isRegister ? 'email' : 'text'}
          placeholder={isRegister ? 'E-mail' : 'E-mail ou username (@)'}
          className="authInput"
          required
        />
      </div>

      <div className="authInputWrap">
        <KeyRound className="authInputIcon" />
        <input
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Senha"
          className="authInput"
          style={{ paddingRight: 48 }}
          required
        />
        <button type="button" className="authEye" onClick={() => setShowPassword((value) => !value)} aria-label="Mostrar senha">
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>

      {isRegister ? (
        <div className="authInputWrap">
          <KeyRound className="authInputIcon" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirmar senha"
            className="authInput"
            style={{ paddingRight: 48 }}
            required
          />
        </div>
      ) : null}

      <button type="submit" disabled={isLoading} className="authSubmit">
        {isLoading ? 'Aguarde...' : isRegister ? 'Criar conta' : 'Entrar'}
      </button>
    </form>
  );
}
