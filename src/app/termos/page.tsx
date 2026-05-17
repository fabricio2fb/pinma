import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react';

import styles from './termos.module.css';

const sections = [
  {
    title: '1. Aceite dos termos',
    body: [
      'Ao acessar o site, criar uma conta, baixar ou usar o aplicativo AlertLoc, voce declara que leu, entendeu e concorda com estes Termos de Uso.',
      'Se voce nao concordar com estes termos, nao utilize o AlertLoc. O uso continuado do servico apos alteracoes nos termos significa aceite da versao atualizada.',
      'O uso do AlertLoc tambem esta sujeito a nossa Politica de Privacidade, disponivel em /privacidade, que explica como tratamos dados pessoais nos termos da LGPD.',
    ],
  },
  {
    title: '2. O que e o AlertLoc',
    body: [
      'O AlertLoc e um aplicativo de lembretes por localizacao. Ele permite criar lembretes vinculados a pontos no mapa, definir raio de proximidade, salvar lugares, organizar lembretes por categoria e receber notificacoes quando o dispositivo estiver perto do local escolhido.',
      'O servico tambem pode oferecer recursos de conta, grupos, convites, lembretes compartilhados, lugares favoritos, preferencias de mapa e verificacao de atualizacoes do APK Android.',
    ],
  },
  {
    title: '3. Conta e cadastro',
    body: [
      'Para usar parte das funcionalidades, voce precisa criar uma conta com e-mail, senha e, opcionalmente, nome. A autenticacao e o armazenamento principal do aplicativo sao realizados por meio do Supabase.',
      'Voce e responsavel por manter suas credenciais em seguranca e por todas as atividades realizadas na sua conta. Caso perceba uso nao autorizado, interrompa o uso e entre em contato pelo e-mail contato@alertloc.com.br.',
    ],
  },
  {
    title: '4. Dados criados pelo usuario',
    body: [
      'Ao usar o AlertLoc, voce pode criar lembretes, descricoes, categorias, prioridades, raios de alerta, coordenadas de latitude e longitude, lugares salvos, grupos e convites para outros usuarios.',
      'Voce declara que tem direito de inserir, compartilhar e manter esses dados no aplicativo. Nao use o AlertLoc para registrar conteudo ilegal, abusivo, discriminatorio, invasivo, enganoso ou que viole direitos de terceiros.',
    ],
  },
  {
    title: '5. Localizacao, notificacoes e segundo plano',
    body: [
      'O AlertLoc depende de permissoes de localizacao para funcionar corretamente. No Android, o app pode solicitar localizacao aproximada, localizacao precisa, localizacao em segundo plano, servico de localizacao em primeiro plano e notificacoes.',
      'A permissao de localizacao em segundo plano e usada para monitorar lembretes ativos mesmo quando o aplicativo nao esta aberto. O app tambem pode exibir uma notificacao persistente do Android indicando que o monitoramento esta ativo.',
      'Voce pode negar ou revogar permissoes nas configuracoes do sistema. Nesse caso, alguns recursos podem parar de funcionar ou funcionar apenas com o aplicativo aberto.',
    ],
  },
  {
    title: '6. Precisao dos alertas',
    body: [
      'Alertas por localizacao dependem de GPS, rede, sistema operacional, bateria, sinal, permissao concedida e politicas do proprio Android. Por isso, o AlertLoc nao garante que todo alerta sera entregue exatamente no momento, distancia ou local esperados.',
      'O AlertLoc nao deve ser usado como unica ferramenta para situacoes criticas, emergenciais, de saude, seguranca, transporte, obrigações legais, controle de acesso ou qualquer contexto em que atraso ou falha de notificacao possa causar dano relevante.',
    ],
  },
  {
    title: '7. Bateria e configuracoes do aparelho',
    body: [
      'Alguns celulares restringem aplicativos em segundo plano para economizar bateria. O AlertLoc pode orientar voce a permitir funcionamento sem restricao ou a abrir telas do Android relacionadas a otimizacao de bateria.',
      'Essas configuracoes sao controladas pelo sistema operacional e pelo fabricante do aparelho. O AlertLoc nao tem controle total sobre Xiaomi, Samsung, Motorola, outros fabricantes ou versoes especificas do Android.',
    ],
  },
  {
    title: '8. Mapas, busca de locais e servicos de terceiros',
    body: [
      'O AlertLoc pode usar mapas, tiles, geocodificacao, busca de enderecos, busca de estabelecimentos proximos e dados publicos ou comerciais fornecidos por terceiros, incluindo Supabase, Geoapify, OpenStreetMap/Nominatim, Overpass API, ViaCEP, Expo e servicos relacionados.',
      'Esses servicos podem ter disponibilidade, limites, termos e politicas proprias. Resultados de busca, nomes de estabelecimentos, enderecos, distancias e categorias podem estar incompletos, desatualizados ou incorretos.',
      'Ao usar recursos de mapa e busca, dados como consulta digitada, coordenadas aproximadas do ponto pesquisado ou localizacao usada para proximidade podem ser enviados a esses provedores para retornar resultados.',
    ],
  },
  {
    title: '9. Grupos e compartilhamento',
    body: [
      'O AlertLoc permite criar grupos, convidar usuarios por e-mail e compartilhar lembretes com membros do grupo. Ao criar ou aceitar um convite, alguns dados como nome, e-mail, avatar, grupos, membros e lembretes compartilhados podem ficar visiveis aos demais participantes conforme a funcionalidade.',
      'Voce e responsavel por escolher com quem compartilha informacoes. Nao adicione dados pessoais de terceiros ou locais sensiveis sem autorizacao adequada.',
    ],
  },
  {
    title: '10. Plano gratuito, premium e mudancas no servico',
    body: [
      'O AlertLoc pode oferecer recursos gratuitos, premium ou empresariais. Recursos, limites, disponibilidade, precos e formas de pagamento podem ser alterados com aviso razoavel quando aplicavel.',
      'Funcionalidades em desenvolvimento, demonstracao, beta ou marcadas como futuras podem mudar, ser pausadas ou removidas sem garantia de disponibilidade permanente.',
    ],
  },
  {
    title: '11. Atualizacoes e APK Android',
    body: [
      'O aplicativo pode verificar se existe uma versao Android mais recente por meio de configuracoes armazenadas no backend. Atualizacoes podem ser opcionais ou obrigatorias para manter compatibilidade, seguranca ou funcionamento correto.',
      'Quando o APK for instalado fora da Play Store, o usuario e responsavel por baixar o arquivo somente de canais oficiais do AlertLoc e confirmar as permissoes exibidas pelo Android antes da instalacao.',
    ],
  },
  {
    title: '12. Uso aceitavel',
    body: [
      'Voce concorda em nao usar o AlertLoc para perseguicao, vigilancia abusiva, assedio, monitoramento nao autorizado de terceiros, fraude, spam, engenharia reversa indevida, tentativa de invasao, sobrecarga de infraestrutura ou violacao de leis aplicaveis.',
      'Podemos suspender ou encerrar acesso a contas ou conteudos que violem estes termos, coloquem a seguranca do servico em risco ou prejudiquem outros usuarios.',
    ],
  },
  {
    title: '13. Privacidade e armazenamento local',
    body: [
      'O aplicativo pode armazenar dados localmente no aparelho, como sessao, preferencias, cache de lugares proximos, lembretes ativos para monitoramento, ultima localizacao conhecida, status de permissoes, controle de notificacoes recentes e configuracoes de bateria.',
      'Esses dados locais ajudam o app a funcionar mesmo em segundo plano ou com conexao instavel. A remocao do aplicativo, limpeza de dados do sistema ou logout pode apagar parte dessas informacoes.',
      'Estes Termos resumem pontos importantes de privacidade, mas a Politica de Privacidade separada detalha bases legais, finalidade, retencao, compartilhamento, direitos do titular e canais de atendimento.',
    ],
  },
  {
    title: '14. Idade minima',
    body: [
      'O AlertLoc nao e direcionado a criancas. Menores de idade devem usar o servico somente com autorizacao e supervisao dos pais ou responsaveis legais.',
      'Se identificarmos uso inadequado por criancas ou adolescentes, poderemos limitar o acesso, remover dados ou solicitar confirmacao de responsabilidade legal.',
    ],
  },
  {
    title: '15. Exclusao de conta e dados',
    body: [
      'Voce pode parar de usar o AlertLoc a qualquer momento. Quando disponivel, a exclusao de dados deve ser solicitada pelo e-mail contato@alertloc.com.br ou realizada pelas funcoes do proprio aplicativo.',
      'A exclusao pode remover ou anonimizar informacoes associadas a sua conta, observadas obrigacoes legais, registros tecnicos, backups temporarios, prevencao a fraude e dados compartilhados em grupos que precisem manter consistencia do servico.',
    ],
  },
  {
    title: '16. Limitacao de responsabilidade',
    body: [
      'O AlertLoc e fornecido no estado em que se encontra, sujeito a falhas, interrupcoes, atrasos, indisponibilidade de rede, erros de mapa, limitacoes do Android e indisponibilidade de terceiros.',
      'Na maxima extensao permitida pela lei, nao nos responsabilizamos por perdas indiretas, lucros cessantes, danos decorrentes de alertas nao recebidos, decisoes tomadas com base em dados de mapa incorretos ou uso do aplicativo em situacoes para as quais ele nao foi projetado.',
    ],
  },
  {
    title: '17. Propriedade intelectual',
    body: [
      'AlertLoc, marca, identidade visual, layout, textos, codigo, fluxos, telas e demais elementos do servico pertencem aos seus titulares ou licenciadores.',
      'Voce recebe apenas uma licenca limitada, revogavel, nao exclusiva e intransferivel para usar o aplicativo conforme estes termos.',
    ],
  },
  {
    title: '18. Alteracoes dos termos',
    body: [
      'Podemos atualizar estes Termos de Uso para refletir mudancas no aplicativo, requisitos legais, melhorias de seguranca ou novos recursos.',
      'Quando a mudanca for relevante, poderemos avisar pelo site, aplicativo ou outro canal razoavel. A data de atualizacao no topo indica a versao mais recente deste documento.',
    ],
  },
  {
    title: '19. Lei aplicavel, LGPD e contato',
    body: [
      'Estes termos sao regidos pelas leis brasileiras, incluindo a Lei Geral de Protecao de Dados Pessoais (LGPD) quando houver tratamento de dados pessoais.',
      'Para solicitar suporte, esclarecer duvidas, exercer direitos de privacidade ou tratar de assuntos relacionados a estes termos, entre em contato pelo e-mail contato@alertloc.com.br. Responderemos solicitacoes relacionadas a dados pessoais em ate 15 dias, salvo prazo legal diferente ou necessidade de confirmar sua identidade.',
    ],
  },
];

export default function TermsPage() {
  return (
    <main className={styles.termsPage}>
      <nav className={styles.termsNav}>
        <Link href="/" className={styles.termsLogo}>
          <Image src="/logob.png" alt="AlertLoc" width={42} height={42} priority />
          <span>AlertLoc</span>
        </Link>
        <Link href="/" className={styles.termsBack}>
          <ArrowLeft size={18} />
          Voltar para o site
        </Link>
      </nav>

      <section className={styles.termsHero}>
        <div className={styles.termsHeroIcon}>
          <FileText size={28} />
        </div>
        <p>Atualizado em 15 de maio de 2026</p>
        <h1>Termos de Uso</h1>
        <span>Regras para usar o site, o aplicativo Android e os servicos do AlertLoc.</span>
      </section>

      <section className={styles.termsNotice}>
        <ShieldCheck size={24} />
        <div>
          <strong>Resumo em linguagem simples</strong>
          <p>
            O AlertLoc ajuda voce a criar lembretes por localizacao. Para funcionar, ele precisa de conta,
            localizacao, notificacoes e dados dos lembretes que voce cria. Nao use o app para vigiar terceiros
            sem autorizacao, nem dependa dele para situacoes criticas.
          </p>
          <p>
            A forma como tratamos dados pessoais esta explicada na{' '}
            <Link href="/privacidade">Politica de Privacidade</Link>.
          </p>
        </div>
      </section>

      <article className={styles.termsContent}>
        {sections.map((section) => (
          <section key={section.title} className={styles.termsSection}>
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>

      <footer className={styles.termsFooter}>
        <Link href="/" className={styles.termsLogo}>
          <Image src="/logob.png" alt="AlertLoc" width={36} height={36} />
          <span>AlertLoc</span>
        </Link>
        <div>
          <Link href="/login">Entrar</Link>
          <Link href="/alertloc.apk">Instalar APK</Link>
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/">Site</Link>
        </div>
      </footer>
    </main>
  );
}
