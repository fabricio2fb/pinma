'use client';

import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  BellRing,
  Bookmark,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Filter,
  Home,
  Instagram,
  LocateFixed,
  Mail,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  Star,
  UserRound,
  Users,
  X,
} from 'lucide-react';

import styles from './lp.module.css';

const LpRealMap = dynamic(
  () => import('./lp-real-map').then((mod) => mod.LpRealMap),
  {
    ssr: false,
    loading: () => <div className={styles.mapLoading}>Carregando mapa...</div>,
  }
);

const filters = ['Mercado', 'Farmácia', 'Banco', 'Padaria', 'Hospital/UPA', 'Pet Shop', 'Oficina'];
const demoTabs = ['Lembretes', 'Meus Lugares', 'Grupos', 'Caixa de Entrada', 'Perfil'] as const;
type DemoTab = (typeof demoTabs)[number];
const phoneTabs = ['Mapa', 'Lembretes', 'Lugares', 'Grupos', 'Perfil'] as const;
type PhoneTab = (typeof phoneTabs)[number];

const reminders = [
  { title: 'Comprar manteiga', meta: 'Mercado • 100m', status: 'Urgente' },
  { title: 'Buscar remédio', meta: 'Farmácia • 250m', status: 'Ativo' },
  { title: 'Enviar documento', meta: 'Grupo Família • 180m', status: 'Grupo' },
];

const places = [
  { name: 'Casa', detail: 'Favorito • Rua salva', color: '#19c37d' },
  { name: 'Trabalho', detail: 'Atalho para lembretes', color: '#35d0c0' },
  { name: 'Mercado do bairro', detail: 'Criar lembrete aqui', color: '#d7a900' },
];

const phoneReminders = [
  { title: 'Comprar manteiga', category: 'Mercado', description: 'Leite integral, pão e queijo.', meta: 'Mercado • 100m', radius: '100m', status: 'Urgente' },
  { title: 'Buscar remédio', category: 'Farmácia', description: 'Retirar o remédio antes de voltar para casa.', meta: 'Farmácia • 250m', radius: '250m', status: 'Ativo' },
  { title: 'Enviar documento', category: 'Cartório', description: 'Lembrete compartilhado com a família.', meta: 'Grupo Família • 180m', radius: '180m', status: 'Grupo' },
];

const phonePlaces = [
  { name: 'Casa', category: 'Casa', description: 'Rua salva para lembretes de chegada', detail: 'Favorito • Rua salva', color: '#19c37d' },
  { name: 'Trabalho', category: 'Trabalho', description: 'Criar lembrete quando chegar no escritório', detail: 'Atalho para lembretes', color: '#35d0c0' },
  { name: 'Mercado do bairro', category: 'Mercado', description: 'Lugar usado para compras rápidas', detail: 'Criar lembrete aqui', color: '#d7a900' },
];

const phoneGroups = [
  { name: 'Família', members: '4 membros', description: 'Compras, farmácia e tarefas da casa', badges: ['Compartilhado', 'Dono'] },
  { name: 'Equipe', members: '7 membros', description: 'Pins compartilhados para rotas e visitas', badges: ['Compartilhado'] },
];


function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={styles.logoMark}>
      <Image src="/logob.png" alt="AlertLoc" width={compact ? 36 : 44} height={compact ? 36 : 44} priority />
      <span>AlertLoc</span>
    </Link>
  );
}

function MapScene() {
  return (
    <div className={styles.mapScene}>
      <LpRealMap />
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className={styles.phone}>
      <div className={styles.phoneStatus}><span>9:41</span><span>5G 92%</span></div>
      <div className={styles.phoneHeader}>
        <LogoMark compact />
        <button aria-label="Perfil"><Users size={17} /></button>
      </div>
      <div className={styles.phoneSearch}>
        <Search size={16} />
        <span>Buscar local, endereço ou CEP...</span>
      </div>
      <div className={styles.phoneMap}>
        <LpRealMap compact />
        <div className={styles.phoneBanner}>Clique no mapa para escolher o local</div>
      </div>
      <div className={styles.phoneActions}>
        <button><LocateFixed size={17} /> Minha localização</button>
        <button><Plus size={17} /> Criar no mapa</button>
      </div>
      <div className={styles.phoneCards}>
        {reminders.map((item) => (
          <div key={item.title} className={styles.phoneReminder}>
            <div />
            <span><strong>{item.title}</strong><small>{item.meta}</small></span>
            <em>{item.status}</em>
          </div>
        ))}
      </div>
      <div className={styles.phoneNav}>
        <b>Mapa</b><span>Lembretes</span><span>Grupos</span><span>Perfil</span>
      </div>
    </div>
  );
}

function InteractivePhoneMockup() {
  const [activeTab, setActiveTab] = useState<PhoneTab>('Mapa');

  return (
    <div className={styles.phone}>
      <div className={styles.phoneStatus}><span>9:41</span><span>5G 92%</span></div>
      <div className={styles.phoneHeader}>
        <LogoMark compact />
        <button aria-label="Perfil"><Users size={17} /></button>
      </div>
      <div className={styles.phoneScreen}>
        <PhoneScreen tab={activeTab} />
      </div>
      <div className={styles.phoneNav}>
        {phoneTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? styles.phoneNavActive : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}

function PhoneScreen({ tab }: { tab: PhoneTab }) {
  if (tab === 'Mapa') {
    return (
      <>
        <div className={styles.phoneSearch}>
          <Search size={16} />
          <span>Buscar local, endereço ou CEP...</span>
        </div>
        <div className={styles.phoneFilterRow}>
          <b>Mercado</b><span>Farmácia</span><span>Banco</span><span>Padaria</span>
        </div>
        <div className={styles.phoneMap}>
          <LpRealMap compact />
          <div className={styles.phoneMapPoi} style={{ left: '15%', top: '24%' }}>Mercado</div>
          <div className={styles.phoneMapPoi} style={{ right: '12%', top: '38%' }}>Farmácia</div>
          <div className={styles.phoneMapPin}><MapPin size={20} /></div>
          <div className={styles.phoneBanner}>Clique no mapa para escolher o local</div>
        </div>
        <div className={styles.phoneActions}>
          <button><LocateFixed size={17} /> Minha localização</button>
          <button><Plus size={17} /> Criar no mapa</button>
        </div>
        <div className={styles.phoneMiniSheet}>
          <strong>Lembretes próximos</strong>
          <span>3 pins ativos perto de você</span>
        </div>
      </>
    );
  }

  if (tab === 'Lembretes') {
    return (
      <>
        <PhoneTitle title="Seus Lembretes" subtitle="Gerencie seus pins e notificações" action={<Plus size={20} />} />
        <div className={styles.phoneSearch}><Search size={16} /><span>Buscar lembrete...</span></div>
        <div className={styles.phoneFilterRow}><b>Todos 3</b><span>Ativos 2</span><span>Grupo 1</span></div>
        <div className={styles.phoneCards}>
          {phoneReminders.map((item, index) => (
            <div key={item.title} className={styles.phoneReminderFull}>
              <div className={index === 0 ? styles.phoneUrgentIcon : styles.phoneCardIcon}>
                {index === 2 ? <Users size={19} /> : <MapPin size={19} />}
              </div>
              <section>
                <header><strong>{item.title}</strong><MoreHorizontal size={17} /></header>
                <small>{item.category}</small>
                <p>{item.description}</p>
                <footer>
                  <span>{item.radius}</span>
                  {item.status === 'Grupo' ? <b>Grupo</b> : null}
                  <em>{item.status}</em>
                </footer>
              </section>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (tab === 'Lugares') {
    return (
      <>
        <PhoneTitle title="Meus Lugares" subtitle="Gerencie seus pontos de referência" action={<Plus size={20} />} />
        <div className={styles.phoneFilterRow}><b>Todos</b><span>Favoritos</span><span>Casa</span><span>Mercado</span></div>
        <div className={styles.phoneCards}>
          {phonePlaces.map((place) => (
            <div key={place.name} className={styles.phonePlaceCard}>
              <div style={{ backgroundColor: `${place.color}22`, color: place.color }}>
                {place.category === 'Casa' ? <Home size={20} /> : place.category === 'Trabalho' ? <BriefcaseBusiness size={20} /> : <Bookmark size={20} />}
              </div>
              <section>
                <header><strong>{place.name}</strong>{place.name === 'Casa' ? <b>Favorito</b> : null}</header>
                <small>{place.category}</small>
                <p>{place.description}</p>
                <em>{place.detail}</em>
              </section>
              <MoreHorizontal size={18} />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (tab === 'Grupos') {
    return (
      <>
        <div className={styles.phoneBadge}><Star size={14} /> Espaços compartilhados</div>
        <PhoneTitle title="Meus Grupos" subtitle="Compartilhe pins e lembretes com pessoas próximas" action={<Plus size={20} />} />
        <div className={styles.phoneSearch}><Search size={16} /><span>Buscar grupo...</span></div>
        <div className={styles.phoneCards}>
          {phoneGroups.map((group) => (
            <div key={group.name} className={styles.phoneGroupCard}>
              <div>{group.name.charAt(0)}</div>
              <section>
                <header><strong>{group.name}</strong><Settings2 size={16} /><MoreHorizontal size={17} /></header>
                <p>{group.description}</p>
                <footer>
                  <span>{group.members}</span>
                  {group.badges.map((badge) => <b key={badge}>{badge}</b>)}
                </footer>
              </section>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.phoneProfileTop}>
        <div><UserRound size={30} /></div>
        <strong>Fabricio</strong>
        <span>fabricio@email.com</span>
        <b>Plano free</b>
      </div>
      <div className={styles.phoneStatsGrid}>
        <span><strong>3</strong>Lembretes</span>
        <span><strong>1</strong>Concluído</span>
        <span><strong>2</strong>Grupos</span>
        <span><strong>3</strong>Lugares</span>
      </div>
      <div className={styles.phoneSettingsList}>
        <button><Mail size={17} /> Caixa de Entrada <em>2</em></button>
        <button><Bookmark size={17} /> Meus Lugares</button>
        <button><Settings2 size={17} /> Configurações</button>
        <button><Check size={17} /> Geofencing ativo</button>
        <button><X size={17} /> Sair</button>
      </div>
    </>
  );
}

function PhoneTitle({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <div className={styles.phoneTitleRow}>
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      {action ? <button type="button">{action}</button> : null}
    </div>
  );
}

function DesktopPanel() {
  const [activeTab, setActiveTab] = useState<DemoTab>('Lembretes');

  return (
    <div className={styles.desktopPanel}>
      <aside>
        <LogoMark compact />
        {demoTabs.map((item) => (
          <button
            type="button"
            key={item}
            className={activeTab === item ? styles.navActive : ''}
            onClick={() => setActiveTab(item)}
          >
            {item}
          </button>
        ))}
      </aside>
      <main>
        <div className={styles.panelTop}>
          <div>
            <strong>{activeTab}</strong>
            <span>{getDemoSubtitle(activeTab)}</span>
          </div>
          <button><Plus size={16} /> Novo lembrete</button>
        </div>
        <div className={styles.panelBodyLive}>
          <div className={styles.panelMap}>
            <MapScene />
          </div>
          <div className={styles.livePane}>
            <LivePane tab={activeTab} />
          </div>
        </div>
      </main>
    </div>
  );
}

function getDemoSubtitle(tab: DemoTab) {
  const subtitles: Record<DemoTab, string> = {
    Lembretes: 'Ativos, urgentes, concluídos e de grupo',
    'Meus Lugares': 'Favoritos, atalhos e mini mapa',
    Grupos: 'Membros, convites e pins compartilhados',
    'Caixa de Entrada': 'Convites pendentes com aceitar e recusar',
    Perfil: 'Estatísticas, plano, atalhos e saída',
  };
  return subtitles[tab];
}

function LivePane({ tab }: { tab: DemoTab }) {
  if (tab === 'Lembretes') {
    return (
      <div className={styles.liveContent}>
        <div className={styles.liveSearch}><Search size={15} /> Buscar lembrete...</div>
        <div className={styles.liveChips}><b>Todos 3</b><span>Ativos 2</span><span>Grupo 1</span></div>
        {reminders.map((item, index) => (
          <div key={item.title} className={styles.liveReminderCard}>
            <div className={index === 1 ? styles.redIcon : styles.greenIcon}>
              {index === 2 ? <Users size={18} /> : <MapPin size={18} />}
            </div>
            <div>
              <strong>{item.title}</strong>
              <span>{item.meta}</span>
              <p>{index === 0 ? 'Comprar leite integral, pão e queijo.' : index === 1 ? 'Prioridade urgente perto da farmácia.' : 'Lembrete compartilhado com a família.'}</p>
            </div>
            <em>{item.status}</em>
          </div>
        ))}
      </div>
    );
  }

  if (tab === 'Meus Lugares') {
    return (
      <div className={styles.liveContent}>
        <div className={styles.liveChips}><b>Todos</b><span>Favoritos</span><span>Casa</span><span>Trabalho</span></div>
        {places.map((place) => (
          <div key={place.name} className={styles.livePlaceCard}>
            <div style={{ backgroundColor: `${place.color}22`, color: place.color }}><Bookmark size={19} /></div>
            <section>
              <strong>{place.name}</strong>
              <span>{place.detail}</span>
              <p>{place.name === 'Casa' ? 'Rua salva • favorito' : place.name === 'Trabalho' ? 'Criar lembrete na chegada' : 'Mercado próximo usado no mapa'}</p>
            </section>
            {place.name === 'Casa' ? <b>Favorito</b> : null}
          </div>
        ))}
      </div>
    );
  }

  if (tab === 'Grupos') {
    return (
      <div className={styles.liveContent}>
        {[
          ['Família', '4 membros', 'Compras, farmácia e tarefas da casa'],
          ['Equipe', '7 membros', 'Pins compartilhados para rotas e visitas'],
        ].map(([name, members, desc]) => (
          <div key={name} className={styles.liveGroupCard}>
            <div>{name.slice(0, 1)}</div>
            <section>
              <strong>{name}</strong>
              <span>{desc}</span>
              <p><Users size={14} /> {members}<b>Compartilhado</b><b>Dono</b></p>
            </section>
          </div>
        ))}
      </div>
    );
  }

  if (tab === 'Caixa de Entrada') {
    return (
      <div className={styles.liveContent}>
        <div className={styles.liveInboxCard}>
          <div><Mail size={24} /></div>
          <strong>Convite para Família</strong>
          <span>Fabricio convidou você para participar deste grupo.</span>
          <p>Grupo usado para compras, farmácia e lugares favoritos.</p>
          <section><button>Recusar</button><button>Aceitar</button></section>
        </div>
        <div className={styles.liveEmptyInbox}>
          <CheckCircle2 size={22} />
          Convites aceitos somem da caixa e atualizam o contador.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.liveContent}>
      <div className={styles.liveProfileCard}>
        <div className={styles.liveAvatar}>FA</div>
        <strong>Fabricio</strong>
        <span>fabricio@email.com</span>
        <section>
          <p><b>12</b><small>Pins</small></p>
          <p><b>5</b><small>Feitos</small></p>
          <p><b>3</b><small>Grupos</small></p>
          <p><b>7</b><small>Lugares</small></p>
        </section>
      </div>
      <div className={styles.liveProfileLinks}>
        <p><Mail size={16} /> Caixa de Entrada <b>2</b></p>
        <p><Bookmark size={16} /> Meus Lugares</p>
        <p><Settings2 size={16} /> Configurações</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const sceneRef = useRef<HTMLElement | null>(null);
  const [sceneStarted, setSceneStarted] = useState(false);

  useEffect(() => {
    const section = sceneRef.current;
    if (!section || sceneStarted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSceneStarted(true);
        observer.disconnect();
      },
      { threshold: 0.35 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [sceneStarted]);

  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <LogoMark />
        <div>
          <a href="#mapa">Mapa</a>
          <a href="#fluxo">Como funciona</a>
          <a href="#recursos">Recursos</a>
          <a href="#apk">APK</a>
        </div>
        <Link href="/alertloc.apk" className={styles.navButton} target="_blank" rel="noopener noreferrer">Baixar agora</Link>
      </nav>
      <Link href="/alertloc.apk" className={styles.mobileStickyCta} target="_blank" rel="noopener noreferrer">
        Baixar agora <ChevronRight size={17} />
      </Link>

      <section className={styles.hero}>
        <MapScene />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <span className={styles.kicker}>Lembra de você quando você chegar lá.</span>
          <h1>AlertLoc</h1>
          <p>
            Um app para criar lembretes que fazem sentido no mapa: você salva o local,
            escolhe o raio, organiza por categoria e recebe o alerta quando estiver perto.
          </p>
          <div className={styles.heroActions}>
            <Link href="/alertloc.apk" target="_blank" rel="noopener noreferrer">Baixar agora <ChevronRight size={18} /></Link>
            <a href="#produto">Ver o app por dentro</a>
          </div>
          <div className={styles.heroStats}>
            <span><strong>funciona</strong> com app fechado</span>
            <span><strong>raio</strong> personalizável por lembrete</span>
            <span><strong>grupos</strong> com família e amigos</span>
          </div>
        </div>
        <div className={styles.heroPhone}>
          <PhoneMockup />
        </div>
      </section>

      <section className={styles.identitySection}>
        <div className={styles.identityInner}>
          <div className={styles.identityHeader}>
            <span>Uso real</span>
            <h2>Já aconteceu com você?</h2>
          </div>
          <div className={styles.identityGrid}>
            <article className={styles.identityCard}>
              <strong>01</strong>
              <p>Foi ao mercado e esqueceu o que precisava comprar.</p>
            </article>
            <article className={styles.identityCard}>
              <strong>02</strong>
              <p>Passou em frente à loja e só lembrou depois que chegou em casa.</p>
            </article>
            <article className={styles.identityCard}>
              <strong>03</strong>
              <p>Queria comprar aquela peça mas só lembrava quando estava longe.</p>
            </article>
          </div>
          <p className={styles.identityClosing}>
            O AlertLoc avisa na hora certa, no lugar certo. Sem alarme de horário. Só quando você chegar perto.
          </p>
        </div>
      </section>

      <section id="produto" className={styles.productSection}>
        <div className={styles.sectionHeader}>
          <span>Representação real do AlertLoc</span>
          <h2>O APK é onde o lembrete por localização realmente acontece.</h2>
          <p>
            A experiência principal é mobile: o usuário escolhe o lugar no mapa, define o raio,
            salva o lembrete e o Android avisa quando ele chegar perto, mesmo com o app fechado.
          </p>
        </div>
        <div className={styles.productMobileShowcase}>
          <div className={styles.productPhoneFrame}>
            <InteractivePhoneMockup />
          </div>
          <div className={styles.productMobileCopy}>
            <span>Como aparece no app</span>
            <h3>Mapa, lembretes e alerta no bolso.</h3>
            <p>
              A tela replica o fluxo do APK: busca por local, pins próximos, lembretes ativos,
              lugares salvos e acesso rápido às áreas que a pessoa usa no dia a dia.
            </p>
            <div className={styles.mobileFlowCards}>
              <article>
                <MapPin size={18} />
                <strong>Escolha o local</strong>
                <p>Pesquise um endereço, toque no mapa ou use um estabelecimento próximo.</p>
              </article>
              <article>
                <LocateFixed size={18} />
                <strong>Defina o raio</strong>
                <p>O lembrete fica ligado a uma área, não a um horário fixo.</p>
              </article>
              <article>
                <BellRing size={18} />
                <strong>Receba o aviso</strong>
                <p>O APK monitora a chegada e dispara a notificação no momento certo.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="mapa" className={styles.mapFeatureSection}>
        <div className={styles.mapCopy}>
          <span>Mapa inteligente</span>
          <h2>Busca, filtros e pins no mesmo lugar.</h2>
          <p>
            O AlertLoc usa categorias úteis do dia a dia para mostrar supermercados,
            farmácias, bancos, escolas, pet shops, oficinas e outros locais próximos.
            O usuário pesquisa endereço, centraliza no resultado e cria um lembrete ali.
          </p>
          <div className={styles.filterRack}>
            {filters.map((filter) => <span key={filter}><Filter size={14} /> {filter}</span>)}
          </div>
        </div>
        <div className={styles.mapDetail}>
          <MapScene />
          <div className={styles.popup}>
            <strong>Farmácia Central</strong>
            <span>Farmácia • 230m de distância</span>
            <button>Criar lembrete aqui</button>
          </div>
        </div>
      </section>

      <section id="fluxo" className={styles.flowSection}>
        <div className={styles.sectionHeader}>
          <span>Fluxo do APK</span>
          <h2>Do ponto no mapa ao alerta de proximidade.</h2>
        </div>
        <div className={styles.flowGrid}>
          {[
            ['01', 'Escolha o ponto', 'Use a busca, sua localização, um POI ou o botão Criar no mapa.'],
            ['02', 'Complete o lembrete', 'Título, descrição, categoria, prioridade, raio e categoria Outro personalizada.'],
            ['03', 'Organize', 'Veja em Lembretes, Meus Lugares, Grupos ou Caixa de Entrada.'],
            ['04', 'Receba o alerta', 'No Android, notificações e geofencing cuidam do aviso em segundo plano.'],
          ].map(([step, title, text]) => (
            <div key={step} className={styles.flowCard}>
              <b>{step}</b>
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        ref={sceneRef}
        className={`${styles.sceneSection} ${sceneStarted ? styles.sceneStarted : ''}`}
      >
        <div className={styles.sceneTitle}>
          <h2>Você salva. Esquece. A gente lembra.</h2>
          <p className={styles.sceneSubtitle}>Do pin no mapa até a notificação na tela bloqueada.</p>
        </div>
        <div className={styles.sceneStage}>
          <svg className={styles.sceneMap} viewBox="0 0 1600 700" aria-hidden="true">
            <path d="M-80 168 C210 126 394 218 634 180 C864 144 1050 44 1680 96" />
            <path d="M-70 458 C190 392 365 510 620 468 C888 424 1090 298 1680 352" />
            <path d="M196 -40 C214 162 276 260 244 444 C218 596 260 706 298 754" />
            <path d="M812 -60 C760 124 806 260 872 374 C942 496 928 612 894 764" />
            <path d="M1196 -60 C1120 96 1110 248 1194 404 C1260 526 1296 630 1274 760" />
            <path d="M88 618 L420 420 L690 526 L1030 302 L1488 486" />
          </svg>

          <div className={styles.sceneCopy}>
            <span>Você salva o local.</span>
            <span>O AlertLoc fica de olho.</span>
            <span>Você se aproxima.</span>
            <strong>A notificação chega. Mesmo com o app fechado.</strong>
          </div>

          <div className={styles.sceneRadius} />
          <div className={styles.scenePin}><MapPin size={34} /></div>
          <div className={styles.sceneDot} />
          <div className={styles.sceneNotification}>
            <Image src="/logob.png" alt="AlertLoc" width={30} height={30} />
            <div>
              <strong>AlertLoc</strong>
              <span>Você chegou perto do seu lembrete.</span>
            </div>
            <time>agora</time>
          </div>
        </div>
      </section>

      <section className={styles.apkCardWrap}>
        <div className={styles.apkCardInner}>
          <div className={styles.apkCardLeft}>
            <span className={styles.apkCardTag}><Smartphone size={16} /> APK Android</span>
            <h2 className={styles.apkCardTitle}>Leve o AlertLoc no bolso.</h2>
            <p className={styles.apkCardSub}>
              Instale direto no Android. Sem precisar da Play Store. Funciona mesmo com o app fechado.
            </p>
            <div className={styles.apkCardChecks}>
              <span className={styles.apkCardCheck}><Check size={16} /> Notificações por localização</span>
              <span className={styles.apkCardCheck}><Check size={16} /> Funciona em segundo plano</span>
              <span className={styles.apkCardCheck}><Check size={16} /> Grupos e lembretes compartilhados</span>
            </div>
          </div>
          <div className={styles.apkCardRight}>
            <a className={styles.apkCardBtn} href="/alertloc.apk" target="_blank" rel="noopener noreferrer">
              <Download size={24} />
              <span>
                <small>Baixar para Android</small>
                <strong>AlertLoc APK</strong>
              </span>
            </a>
            <span className={styles.apkCardNote}>Arquivo .apk  Android 8.0 ou superior</span>
            <span className={styles.apkCardComingSoon}>Google Play em breve</span>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <Image src="/logob.png" alt="AlertLoc" width={36} height={36} />
              <strong>AlertLoc</strong>
            </div>
            <p>Lembra de você quando você chegar lá.</p>
            <div className={styles.footerSocials}>
              <a href="#" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" aria-label="TikTok">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M16.75 3c.32 2.55 1.7 4.06 4.25 4.22v3.05a7.5 7.5 0 0 1-4.12-1.24v6.08c0 3.08-2.08 5.65-5.76 5.65-3.2 0-5.38-2.03-5.38-4.98 0-3.18 2.48-5.2 6.13-4.96v3.2c-1.68-.24-2.72.42-2.72 1.66 0 1.02.8 1.7 1.92 1.7 1.32 0 2.2-.76 2.2-2.42V3h3.48Z" />
                </svg>
              </a>
              {/* Espaço reservado para outras redes futuras. */}
            </div>
          </div>

          <div className={styles.footerColumn}>
            <h3>Legal</h3>
            <Link href="/termos">Termos de Uso</Link>
            <Link href="/privacidade">Política de Privacidade</Link>
          </div>

          <div className={styles.footerColumn}>
            <h3>Baixar o app</h3>
            <a className={styles.footerApkButton} href="/alertloc.apk" target="_blank" rel="noopener noreferrer">
              <Smartphone size={22} />
              <span>
                <small>Baixar para</small>
                <strong>Android APK</strong>
              </span>
            </a>
            <p className={styles.footerApkNote}>Instale diretamente no Android · Google Play em breve</p>
          </div>
        </div>

        <div className={styles.footerBottom}>
          © 2025 AlertLoc · Todos os direitos reservados
        </div>
      </footer>
    </main>
  );
}
