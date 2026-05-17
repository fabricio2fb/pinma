import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react';

import styles from './privacidade.module.css';

const sections = [
  {
    title: '1. Objetivo desta politica',
    body: [
      'Esta Politica de Privacidade explica como o AlertLoc coleta, usa, armazena e compartilha dados quando voce acessa o site, cria uma conta, baixa ou usa o aplicativo Android.',
      'O tratamento de dados pessoais e realizado de acordo com a Lei Geral de Protecao de Dados Pessoais (LGPD) e demais normas aplicaveis.',
    ],
  },
  {
    title: '2. Dados que podemos coletar',
    body: [
      'Podemos coletar dados de cadastro, como e-mail, nome, identificador da conta, avatar, plano, preferencias de mapa e status de onboarding.',
      'Tambem podemos tratar dados criados por voce no app, como lembretes, descricoes, categorias, prioridade, raio de alerta, latitude, longitude, lugares salvos, grupos, convites e membros de grupos.',
      'Quando voce usa busca no mapa, podemos tratar consultas digitadas, CEP, enderecos, coordenadas aproximadas, localizacao do ponto pesquisado e resultados de estabelecimentos proximos.',
    ],
  },
  {
    title: '3. Localizacao',
    body: [
      'A localizacao e essencial para o funcionamento do AlertLoc. O app pode solicitar localizacao aproximada, localizacao precisa e localizacao em segundo plano para avisar quando voce chegar perto de um lembrete.',
      'Quando o monitoramento esta ativo, o app pode processar atualizacoes de localizacao no proprio aparelho para comparar sua posicao com lembretes ativos e disparar notificacoes.',
      'O AlertLoc pode armazenar coordenadas dos lembretes e lugares que voce cria. A ultima localizacao conhecida e alguns dados de monitoramento podem ser mantidos localmente no dispositivo para melhorar o funcionamento em segundo plano.',
    ],
  },
  {
    title: '4. Notificacoes e funcionamento em segundo plano',
    body: [
      'O app usa notificacoes locais para avisar quando voce esta perto de um lembrete. Para isso, pode armazenar identificadores de lembretes, prioridade, horario de notificacao e controles de intervalo para evitar alertas repetidos.',
      'No Android, o AlertLoc pode usar servico em primeiro plano e solicitar ajuste de otimizacao de bateria. Essas permissoes ajudam o app a funcionar com a tela bloqueada ou com o app fechado.',
    ],
  },
  {
    title: '5. Dados armazenados localmente',
    body: [
      'O aplicativo pode armazenar informacoes no aparelho usando armazenamento local, incluindo sessao, preferencias, permissoes ja concluídas, cache de lugares proximos, lembretes ativos para monitoramento, ultima localizacao conhecida, status de bateria e historico local de notificacoes recentes.',
      'Esses dados locais podem ser removidos ao limpar os dados do aplicativo, fazer logout, reinstalar o app ou apagar o aplicativo do dispositivo.',
    ],
  },
  {
    title: '6. Como usamos os dados',
    body: [
      'Usamos os dados para autenticar usuarios, manter a conta, sincronizar lembretes, salvar lugares, mostrar mapas, buscar enderecos e estabelecimentos proximos, enviar notificacoes por proximidade, gerenciar grupos e convites, personalizar preferencias e verificar atualizacoes do APK.',
      'Tambem podemos usar dados tecnicos e registros de erro para diagnosticar falhas, melhorar desempenho, prevenir abusos, proteger contas e manter a seguranca do servico.',
    ],
  },
  {
    title: '7. Bases legais',
    body: [
      'Dependendo do caso, o tratamento pode ocorrer para execucao do servico solicitado por voce, cumprimento de obrigacoes legais, exercicio regular de direitos, protecao contra fraude, legitimo interesse ou consentimento, especialmente quando o sistema operacional exige autorizacao para localizacao e notificacoes.',
      'Voce pode revogar permissoes de localizacao e notificacoes nas configuracoes do Android. A revogacao pode limitar ou impedir recursos essenciais do AlertLoc.',
    ],
  },
  {
    title: '8. Compartilhamento com terceiros',
    body: [
      'O AlertLoc utiliza fornecedores e servicos terceiros para operar funcionalidades. Isso pode incluir Supabase para autenticacao e banco de dados, Expo e bibliotecas relacionadas para recursos do app, Geoapify para geocodificacao e busca de lugares, OpenStreetMap/Nominatim, Overpass API, ViaCEP e provedores de mapas/tiles.',
      'Ao usar busca de enderecos, CEP, locais proximos ou mapa, informacoes como consulta, coordenadas e parametros de busca podem ser enviadas a esses servicos para retornar resultados.',
      'Tambem podemos compartilhar dados quando necessario para cumprir lei, ordem de autoridade competente, proteger direitos, investigar abuso ou garantir a seguranca do servico e dos usuarios.',
    ],
  },
  {
    title: '9. Grupos e dados compartilhados entre usuarios',
    body: [
      'Quando voce cria ou participa de grupos, outros membros podem ver informacoes relacionadas ao grupo, como nome, e-mail ou identificacao de perfil, membros, convites e lembretes compartilhados.',
      'Ao convidar alguem por e-mail, o AlertLoc pode buscar perfis cadastrados e registrar o convite. Compartilhe lembretes e locais apenas com pessoas de confianca.',
    ],
  },
  {
    title: '10. Retencao e exclusao',
    body: [
      'Mantemos dados enquanto forem necessarios para prestar o servico, cumprir obrigacoes legais, preservar seguranca, resolver disputas ou enquanto sua conta estiver ativa.',
      'Voce pode solicitar exclusao ou correcao de dados pelo e-mail contato@alertloc.com.br. A exclusao pode nao ser imediata em backups, registros tecnicos, logs de seguranca ou dados que precisem ser mantidos por obrigacao legal.',
    ],
  },
  {
    title: '11. Seguranca',
    body: [
      'Adotamos medidas tecnicas e organizacionais razoaveis para proteger os dados, incluindo autenticacao, controle de acesso e politicas de seguranca no banco de dados.',
      'Nenhum sistema e totalmente imune a falhas. Voce tambem deve proteger sua conta usando senha forte, mantendo seu aparelho seguro e evitando compartilhar credenciais.',
    ],
  },
  {
    title: '12. Seus direitos',
    body: [
      'Nos termos da LGPD, voce pode solicitar confirmacao de tratamento, acesso, correcao, anonimização, bloqueio, eliminacao, portabilidade, informacoes sobre compartilhamento, revisao de decisoes automatizadas quando aplicavel e revogacao de consentimento.',
      'Para exercer direitos, entre em contato pelo e-mail contato@alertloc.com.br. Podemos pedir informacoes adicionais para confirmar sua identidade e proteger sua conta.',
      'Responderemos solicitacoes relacionadas a dados pessoais em ate 15 dias, salvo prazo legal diferente, complexidade excepcional da solicitacao ou necessidade de confirmacao de identidade.',
    ],
  },
  {
    title: '13. Criancas e adolescentes',
    body: [
      'O AlertLoc nao e direcionado a criancas. Caso o servico venha a ser usado por menores de idade, o uso deve ocorrer com autorizacao e supervisao dos responsaveis legais.',
      'Se identificarmos tratamento inadequado de dados de criancas ou adolescentes, poderemos remover informacoes e tomar medidas para limitar o acesso.',
    ],
  },
  {
    title: '14. Transferencia internacional',
    body: [
      'Como usamos provedores de tecnologia e infraestrutura, dados podem ser processados ou armazenados fora do Brasil, conforme a arquitetura desses fornecedores.',
      'Quando isso ocorrer, buscaremos utilizar fornecedores com medidas adequadas de seguranca e protecao de dados.',
    ],
  },
  {
    title: '15. Cookies e site',
    body: [
      'O site do AlertLoc pode usar cookies ou tecnologias semelhantes essenciais para funcionamento, seguranca, manutencao de sessao, prevencao de abuso e melhoria da experiencia.',
      'Se forem adicionadas ferramentas de analytics, publicidade ou mensuracao, como Google Analytics ou similares, esta politica devera informar a finalidade, o fornecedor, os dados coletados e, quando aplicavel, as opcoes de consentimento ou rejeicao.',
    ],
  },
  {
    title: '16. Alteracoes desta politica',
    body: [
      'Podemos atualizar esta Politica de Privacidade para refletir mudancas no aplicativo, no site, em fornecedores, requisitos legais ou praticas de seguranca.',
      'A data no topo indica a versao mais recente. Mudancas relevantes podem ser comunicadas no site, no aplicativo ou por outro meio razoavel.',
    ],
  },
  {
    title: '17. Contato',
    body: [
      'Para duvidas, solicitacoes de privacidade ou exercicio de direitos, entre em contato pelo e-mail contato@alertloc.com.br.',
      'Quando necessario, este canal tambem podera ser usado para encaminhar pedidos ao responsavel pelo tratamento de dados pessoais do AlertLoc.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className={styles.privacyPage}>
      <nav className={styles.privacyNav}>
        <Link href="/" className={styles.privacyLogo}>
          <Image src="/logob.png" alt="AlertLoc" width={42} height={42} priority />
          <span>AlertLoc</span>
        </Link>
        <Link href="/" className={styles.privacyBack}>
          <ArrowLeft size={18} />
          Voltar para o site
        </Link>
      </nav>

      <section className={styles.privacyHero}>
        <div className={styles.privacyHeroIcon}>
          <LockKeyhole size={28} />
        </div>
        <p>Atualizada em 15 de maio de 2026</p>
        <h1>Politica de Privacidade</h1>
        <span>Como o AlertLoc trata dados pessoais no site e no aplicativo Android.</span>
      </section>

      <section className={styles.privacyNotice}>
        <ShieldCheck size={24} />
        <div>
          <strong>Resumo em linguagem simples</strong>
          <p>
            O AlertLoc usa dados de conta, localizacao, lembretes, lugares salvos e grupos para entregar
            alertas por proximidade. Alguns dados ficam no aparelho para o app funcionar em segundo plano,
            e alguns podem ser enviados a fornecedores como Supabase, Geoapify, OpenStreetMap, Overpass e ViaCEP.
          </p>
          <p>
            Voce pode revogar permissoes no Android e solicitar acesso, correcao ou exclusao de dados pelo e-mail contato@alertloc.com.br.
          </p>
        </div>
      </section>

      <article className={styles.privacyContent}>
        {sections.map((section) => (
          <section key={section.title} className={styles.privacySection}>
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>

      <footer className={styles.privacyFooter}>
        <Link href="/" className={styles.privacyLogo}>
          <Image src="/logob.png" alt="AlertLoc" width={36} height={36} />
          <span>AlertLoc</span>
        </Link>
        <div>
          <Link href="/termos">Termos</Link>
          <Link href="/login">Entrar</Link>
          <Link href="/">Site</Link>
        </div>
      </footer>
    </main>
  );
}
