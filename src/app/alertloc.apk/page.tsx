import Image from 'next/image';
import Link from 'next/link';
import {
  BatteryCharging,
  BellRing,
  Check,
  CheckCircle2,
  Download,
  MapPin,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

import styles from './install.module.css';

type InstallStep = {
  number: string;
  title: string;
  desc: string;
  tip: string;
  mockup: React.ReactNode;
};

const installSteps: InstallStep[] = [
  {
    number: '01',
    title: 'Baixe o APK',
    desc: 'Toque no botão acima para baixar o arquivo .apk do AlertLoc. O arquivo será salvo na sua pasta de Downloads.',
    tip: "Se o navegador perguntar se quer manter o arquivo, confirme clicando em 'Manter' ou 'OK'.",
    mockup: <MockupDownload />,
  },
  {
    number: '02',
    title: 'Permita a instalação',
    desc: "O Android vai perguntar se você quer instalar apps de fontes desconhecidas. Isso é normal para apps fora da Play Store. Toque em 'Configurações' e ative a opção.",
    tip: 'Essa permissão é só para este arquivo. O Android não deixa outros apps instalarem coisas sem você saber.',
    mockup: <MockupInstall />,
  },
  {
    number: '03',
    title: 'Instale e abra',
    desc: "Toque em 'Instalar' na tela de confirmação. Após a instalação, toque em 'Abrir' para iniciar o AlertLoc.",
    tip: 'Se já tiver conta, entre com seu e-mail. Se for novo, crie uma conta gratuita.',
    mockup: <MockupWelcome />,
  },
];

const configSteps: InstallStep[] = [
  {
    number: '04',
    title: 'Ative notificações e localização',
    desc: 'Na primeira vez que abrir o app, ele vai pedir permissão de notificações e localização. Permita os dois para o AlertLoc funcionar.',
    tip: "Quando aparecer a pergunta de localização, escolha 'Permitir o tempo todo' para receber alertas mesmo com o app fechado.",
    mockup: <MockupPermissions />,
  },
  {
    number: '05',
    title: "Escolha 'Permitir o tempo todo'",
    desc: "O Android vai mostrar uma tela de permissões de localização. Selecione 'Permitir o tempo todo' para que o AlertLoc avise mesmo quando você não estiver usando o app.",
    tip: 'Sem essa permissão, o alerta só chega se o app estiver aberto.',
    mockup: <MockupLocation />,
  },
  {
    number: '06',
    title: 'Libere a bateria',
    desc: "Em alguns celulares, o Android pausa apps em segundo plano para economizar bateria. Para o AlertLoc funcionar corretamente, selecione 'Nenhuma restrição' nas configurações de bateria.",
    tip: 'Essa configuração garante que o alerta chegue mesmo com o celular parado por horas.',
    mockup: <MockupBattery />,
  },
];

function LogoMark() {
  return (
    <Link href="/" className={styles.installLogo}>
      <Image src="/logob.png" alt="AlertLoc" width={42} height={42} priority />
      <span>AlertLoc</span>
    </Link>
  );
}

function StatusBar() {
  return (
    <div className={styles.installMockupStatus}>
      <span>9:41</span>
      <span>5G 92%</span>
    </div>
  );
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.installMockup}>
      <div className={styles.installMockupShell}>
        <StatusBar />
        <div className={styles.installMockupScreen}>{children}</div>
      </div>
    </div>
  );
}

function MockupDownload() {
  return (
    <PhoneShell>
      <div className={styles.installBrowserBar}>alertloc.online/alertloc.apk</div>
      <div className={styles.installDownloadCard}>
        <Download size={30} />
        <strong>alertloc.apk</strong>
        <span>Download concluído</span>
        <div className={styles.installProgress}><span /></div>
      </div>
      <div className={styles.installNotification}>
        <Download size={18} />
        <div>
          <strong>Download completo</strong>
          <span>alertloc.apk</span>
        </div>
      </div>
    </PhoneShell>
  );
}

function MockupInstall() {
  return (
    <PhoneShell>
      <div className={styles.installPhoneTitle}>Instalar apps desconhecidos</div>
      <div className={styles.installSettingRow}>
        <div>
          <strong>Permitir desta fonte</strong>
          <span>AlertLoc APK</span>
        </div>
        <span className={styles.installToggle} />
      </div>
      <div className={styles.installDialog}>
        <Image src="/logob.png" alt="" width={40} height={40} />
        <strong>Quer instalar esse app?</strong>
        <span>AlertLoc</span>
        <div>
          <button>CANCELAR</button>
          <button>INSTALAR</button>
        </div>
      </div>
    </PhoneShell>
  );
}

function MockupWelcome() {
  return (
    <PhoneShell>
      <div className={styles.installWelcome}>
        <Image src="/logob.png" alt="" width={72} height={72} />
        <h3>Bem-vindo ao AlertLoc</h3>
        <p>Lembretes que chegam quando você chega perto.</p>
        <button>Entrar</button>
        <button>Criar conta</button>
      </div>
    </PhoneShell>
  );
}

function MockupPermissions() {
  return (
    <PhoneShell>
      <div className={styles.installAppHeader}>
        <BellRing size={24} />
        <strong>Ative seus alertas por localização</strong>
      </div>
      {['Notificações', 'Localização', 'Segundo plano'].map((item) => (
        <div className={styles.installPermissionCard} key={item}>
          <span>{item}</span>
          <em>Aguardando</em>
        </div>
      ))}
      <button className={styles.installPrimaryMini}>Ativar alertas</button>
    </PhoneShell>
  );
}

function MockupLocation() {
  return (
    <PhoneShell>
      <div className={styles.installPhoneTitle}>Permissões de Localização</div>
      <div className={styles.installLocationHead}>
        <Image src="/logob.png" alt="" width={42} height={42} />
        <strong>AlertLoc</strong>
      </div>
      {['Permitir o tempo todo', 'Permitir durante o uso do app', 'Perguntar sempre', 'Não permitir'].map((item, index) => (
        <div className={`${styles.installRadioRow} ${index === 0 ? styles.installRadioSelected : ''}`} key={item}>
          <span />
          <strong>{item}</strong>
        </div>
      ))}
    </PhoneShell>
  );
}

function MockupBattery() {
  return (
    <PhoneShell>
      <div className={styles.installPhoneTitle}>Configurações de segundo plano</div>
      {['Economia de bateria', 'Otimizado', 'Restrição alta', 'Nenhuma restrição'].map((item, index) => (
        <div className={`${styles.installBatteryRow} ${index === 3 ? styles.installBatterySelected : ''}`} key={item}>
          <strong>{item}</strong>
          {index === 3 ? <Check size={18} /> : <span />}
        </div>
      ))}
      <p className={styles.installPhoneNote}>Esta tela pode ter nomes diferentes dependendo do seu celular (Xiaomi, Samsung, Motorola).</p>
    </PhoneShell>
  );
}

function StepBlock({ step, index }: { step: InstallStep; index: number }) {
  return (
    <article className={`${styles.installStep} ${index % 2 === 1 ? styles.installStepReverse : ''}`}>
      <div className={styles.installStepText}>
        <span className={styles.installStepNumber}>{step.number}</span>
        <h3 className={styles.installStepTitle}>{step.title}</h3>
        <p className={styles.installStepDesc}>{step.desc}</p>
        <p className={styles.installTip}><ShieldCheck size={18} /> {step.tip}</p>
      </div>
      {step.mockup}
    </article>
  );
}

export default function AlertLocApkInstallPage() {
  return (
    <main className={styles.installPage}>
      <nav className={styles.installNav}>
        <LogoMark />
        <Link href="/">Voltar para o site</Link>
      </nav>

      <section className={styles.installHero}>
        <LogoMark />
        <h1 className={styles.installHeroTitle}>Instale o AlertLoc no seu Android</h1>
        <p className={styles.installHeroSub}>
          Siga os passos abaixo para instalar e configurar tudo direitinho. Leva menos de 2 minutos.
        </p>
        <a className={styles.installDownloadBtn} href="/api/alertloc/track-download">
          <Download size={24} />
          Baixar AlertLoc APK
        </a>
        <p className={styles.installMeta}>Arquivo .apk · Android 8.0 ou superior · Versão atual</p>
        <div className={styles.installBadges}>
          <span>Gratuito</span>
          <span>Sem Play Store</span>
          <span>Instala em segundos</span>
        </div>
      </section>

      <section className={styles.installSection}>
        <div className={styles.installSectionHeader}>
          <h2 className={styles.installSectionTitle}>Como instalar</h2>
        </div>
        {installSteps.map((step, index) => <StepBlock key={step.number} step={step} index={index} />)}
      </section>

      <section className={styles.installSection}>
        <div className={styles.installSectionHeader}>
          <h2 className={styles.installSectionTitle}>Configure para funcionar direito</h2>
          <p className={styles.installSectionSub}>
            O AlertLoc precisa de algumas permissões para avisar quando você chegar perto de um lembrete. Siga os passos.
          </p>
        </div>
        {configSteps.map((step, index) => <StepBlock key={step.number} step={step} index={index} />)}
      </section>

      <section className={styles.installDone}>
        <CheckCircle2 className={styles.installDoneIcon} />
        <h2>Tudo certo. Agora é só instalar.</h2>
        <p>Depois de baixar, abra o APK no seu celular, instale o AlertLoc e crie sua conta pelo app.</p>
        <a href="/api/alertloc/track-download">Baixar APK agora</a>
        <span>Já baixou? Abra o arquivo na pasta Downloads do seu celular.</span>
      </section>

      <footer className={styles.installFooter}>
        <div>
          <LogoMark />
          <p>Lembra de você quando você chegar lá.</p>
        </div>
        <div>
          <a href="/api/alertloc/track-download"><Smartphone size={18} /> Baixar APK</a>
          <Link href="/termos">Termos</Link>
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/alertloc/pro">Plano Pro</Link>
        </div>
        <small>© 2025 AlertLoc · Todos os direitos reservados</small>
      </footer>
    </main>
  );
}
