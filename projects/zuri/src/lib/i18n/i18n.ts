import { InjectionToken, Provider } from '@angular/core';

/**
 * Textos que os componentes do Zuri mostram ou anunciam para leitores de tela
 * (rótulos de botões, `aria-label` de regiões etc.). O padrão é português;
 * troque com `provideZuriI18n('en')` ou passe só as chaves que quiser mudar.
 */
export interface ZurI18n {
  /** Locale BCP 47 usado para formatar datas e nomes de mês/dia (date picker). */
  locale: string;
  /** Botão de fechar (modal, toast, drawer). */
  close: string;
  /** Botão de voltar (lista e detalhe no mobile). */
  back: string;
  /** Botão do topbar que recolhe a sidebar ou abre a gaveta. */
  toggleNav: string;
  /** Região da sidebar. */
  sideNav: string;
  /** Links do topbar. */
  topNav: string;
  /** Links do rodapé. */
  footerNav: string;
  /** Lista de etapas do formulário/wizard. */
  steps: string;
  /** Painel da lista (lista e detalhe). */
  list: string;
  /** Painel do detalhe (lista e detalhe). */
  detail: string;
  /** Região do breadcrumb. */
  breadcrumb: string;
  /** Botão de tema quando o tema atual é escuro. */
  themeToLight: string;
  /** Botão de tema quando o tema atual é claro. */
  themeToDark: string;
  /** Paginação. */
  pagination: string;
  previousPage: string;
  nextPage: string;
  /** Rótulo de cada página, ex.: "Página 3". */
  page: (n: number) => string;
  /** Rótulo padrão da barra de progresso. */
  progress: string;
  /** Contador de caracteres do textarea, ex.: "12 de 200 caracteres". */
  characterCount: (count: number, max: number) => string;
  /** Combobox e paleta de comandos sem resultado. */
  noResults: string;
  /** Botão que limpa o valor (combobox, chips). */
  clear: string;
  /** Botão que abre o calendário. */
  openCalendar: string;
  previousMonth: string;
  nextMonth: string;
  /** Data selecionada na faixa: início/fim. */
  rangeStart: string;
  rangeEnd: string;
  /** Upload: texto da área de soltar e do botão. */
  dropFiles: string;
  browseFiles: string;
  removeFile: (name: string) => string;
  fileTooLarge: (name: string, maxSize: string) => string;
  fileTypeNotAllowed: (name: string) => string;
  /** Chips. */
  removeChip: (label: string) => string;
  /** Slider de faixa: rótulos dos dois controles. */
  minimum: string;
  maximum: string;
  /** Chat. */
  chatLog: string;
  messagePlaceholder: string;
  sendMessage: string;
  attachFile: string;
  typing: (name: string) => string;
  /** Paleta de comandos. */
  commandPalette: string;
  commandPlaceholder: string;
  /** Central de notificações. */
  notifications: string;
  unreadNotifications: (count: number) => string;
  markAllRead: string;
  noNotifications: string;
  today: string;
  earlier: string;
  /** Kanban (anúncios do arrasto por teclado). */
  kanbanInstructions: string;
  cardGrabbed: (card: string, column: string, position: number) => string;
  cardMoved: (card: string, column: string, position: number) => string;
  cardDropped: (card: string, column: string, position: number) => string;
  cardCancelled: (card: string) => string;
  /** Campo numérico. */
  increase: string;
  decrease: string;
  /** Código de verificação (OTP). */
  otpGroup: string;
  otpDigit: (n: number, total: number) => string;
  /** Avaliação por estrelas. */
  ratingValue: (value: number, max: number) => string;
  ratingStar: (n: number) => string;
  /** Seletor de horário. */
  openTimePicker: string;
  hours: string;
  minutes: string;
  /** Stepper. */
  stepOf: (n: number, total: number) => string;
  stepDone: string;
  stepCurrent: string;
  stepError: string;
  /** Carrossel. */
  carousel: string;
  previousSlide: string;
  nextSlide: string;
  slideOf: (n: number, total: number) => string;
  goToSlide: (n: number) => string;
  pauseCarousel: string;
  playCarousel: string;
  /** Grupo de avatares: "+3". */
  moreAvatars: (count: number) => string;
  /** Diálogo de confirmação. */
  confirm: string;
  cancel: string;
  ok: string;
  /** Menu de contexto. */
  contextMenu: string;
  /** Linha do tempo e árvore. */
  timeline: string;
  tree: string;
  expandNode: (label: string) => string;
  collapseNode: (label: string) => string;
  /** Tabela avançada. */
  selectAllRows: string;
  selectRow: string;
  expandRow: string;
  collapseRow: string;
  filterColumn: (column: string) => string;
  clearFilter: string;
  visibleColumns: string;
  /** Gráficos e indicadores. */
  chartLegend: string;
  chartData: string;
  chartPoint: (series: string, label: string, value: string) => string;
  statUp: string;
  statDown: string;
  statFlat: string;
  statVsPrevious: string;
  /** Botão que alterna a densidade da interface. */
  densityToCompact: string;
  densityToComfortable: string;
}

export const ZUR_I18N_PT: ZurI18n = {
  locale: 'pt-BR',
  close: 'Fechar',
  back: 'Voltar',
  toggleNav: 'Alternar menu lateral',
  sideNav: 'Navegação lateral',
  topNav: 'Navegação principal',
  footerNav: 'Links do rodapé',
  steps: 'Etapas',
  list: 'Lista',
  detail: 'Detalhe',
  breadcrumb: 'Trilha de navegação',
  themeToLight: 'Ativar tema claro',
  themeToDark: 'Ativar tema escuro',
  pagination: 'Paginação',
  previousPage: 'Página anterior',
  nextPage: 'Próxima página',
  page: (n) => `Página ${n}`,
  progress: 'Progresso',
  characterCount: (count, max) => `${count} de ${max} caracteres`,
  noResults: 'Nenhum resultado',
  clear: 'Limpar',
  openCalendar: 'Abrir calendário',
  previousMonth: 'Mês anterior',
  nextMonth: 'Próximo mês',
  rangeStart: 'Início',
  rangeEnd: 'Fim',
  dropFiles: 'Arraste arquivos para cá ou',
  browseFiles: 'escolha no computador',
  removeFile: (name) => `Remover ${name}`,
  fileTooLarge: (name, maxSize) => `${name} passa do limite de ${maxSize}`,
  fileTypeNotAllowed: (name) => `${name} não é de um tipo aceito`,
  removeChip: (label) => `Remover ${label}`,
  minimum: 'Mínimo',
  maximum: 'Máximo',
  chatLog: 'Mensagens',
  messagePlaceholder: 'Escreva uma mensagem…',
  sendMessage: 'Enviar mensagem',
  attachFile: 'Anexar arquivo',
  typing: (name) => `${name} está digitando…`,
  commandPalette: 'Paleta de comandos',
  commandPlaceholder: 'Busque uma página ou ação…',
  notifications: 'Notificações',
  unreadNotifications: (count) =>
    count === 0 ? 'Notificações' : `Notificações, ${count} não ${count === 1 ? 'lida' : 'lidas'}`,
  markAllRead: 'Marcar todas como lidas',
  noNotifications: 'Nada por aqui',
  today: 'Hoje',
  earlier: 'Anteriores',
  kanbanInstructions:
    'Espaço pega o cartão; setas movem entre posições e colunas; Espaço solta; Esc cancela.',
  cardGrabbed: (card, column, position) => `${card} pego. Coluna ${column}, posição ${position}.`,
  cardMoved: (card, column, position) => `${card}: coluna ${column}, posição ${position}.`,
  cardDropped: (card, column, position) => `${card} solto na coluna ${column}, posição ${position}.`,
  cardCancelled: (card) => `Movimento de ${card} cancelado.`,
  increase: 'Aumentar',
  decrease: 'Diminuir',
  otpGroup: 'Código de verificação',
  otpDigit: (n, total) => `Dígito ${n} de ${total}`,
  ratingValue: (value, max) => `${value.toLocaleString('pt-BR')} de ${max}`,
  ratingStar: (n) => `${n} ${n === 1 ? 'estrela' : 'estrelas'}`,
  openTimePicker: 'Escolher horário',
  hours: 'Horas',
  minutes: 'Minutos',
  stepOf: (n, total) => `Etapa ${n} de ${total}`,
  stepDone: 'concluída',
  stepCurrent: 'etapa atual',
  stepError: 'com erro',
  carousel: 'Carrossel',
  previousSlide: 'Slide anterior',
  nextSlide: 'Próximo slide',
  slideOf: (n, total) => `Slide ${n} de ${total}`,
  goToSlide: (n) => `Ir para o slide ${n}`,
  pauseCarousel: 'Pausar rotação automática',
  playCarousel: 'Retomar rotação automática',
  moreAvatars: (count) => `mais ${count} ${count === 1 ? 'pessoa' : 'pessoas'}`,
  confirm: 'Confirmar',
  cancel: 'Cancelar',
  ok: 'OK',
  contextMenu: 'Menu de contexto',
  timeline: 'Linha do tempo',
  tree: 'Árvore',
  expandNode: (label) => `Expandir ${label}`,
  collapseNode: (label) => `Recolher ${label}`,
  selectAllRows: 'Selecionar todas as linhas',
  selectRow: 'Selecionar linha',
  expandRow: 'Expandir linha',
  collapseRow: 'Recolher linha',
  filterColumn: (column) => `Filtrar ${column}`,
  clearFilter: 'Limpar filtro',
  visibleColumns: 'Colunas visíveis',
  chartLegend: 'Legenda',
  chartData: 'Dados do gráfico',
  chartPoint: (series, label, value) => `${series}, ${label}: ${value}`,
  statUp: 'em alta',
  statDown: 'em queda',
  statFlat: 'estável',
  statVsPrevious: 'em relação ao período anterior',
  densityToCompact: 'Usar interface compacta',
  densityToComfortable: 'Usar interface confortável',
};

export const ZUR_I18N_EN: ZurI18n = {
  locale: 'en-US',
  close: 'Close',
  back: 'Back',
  toggleNav: 'Toggle side menu',
  sideNav: 'Side navigation',
  topNav: 'Main navigation',
  footerNav: 'Footer links',
  steps: 'Steps',
  list: 'List',
  detail: 'Detail',
  breadcrumb: 'Breadcrumb',
  themeToLight: 'Switch to light theme',
  themeToDark: 'Switch to dark theme',
  pagination: 'Pagination',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  page: (n) => `Page ${n}`,
  progress: 'Progress',
  characterCount: (count, max) => `${count} of ${max} characters`,
  noResults: 'No results',
  clear: 'Clear',
  openCalendar: 'Open calendar',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  rangeStart: 'Start',
  rangeEnd: 'End',
  dropFiles: 'Drag files here or',
  browseFiles: 'browse your computer',
  removeFile: (name) => `Remove ${name}`,
  fileTooLarge: (name, maxSize) => `${name} is over the ${maxSize} limit`,
  fileTypeNotAllowed: (name) => `${name} is not an accepted file type`,
  removeChip: (label) => `Remove ${label}`,
  minimum: 'Minimum',
  maximum: 'Maximum',
  chatLog: 'Messages',
  messagePlaceholder: 'Write a message…',
  sendMessage: 'Send message',
  attachFile: 'Attach file',
  typing: (name) => `${name} is typing…`,
  commandPalette: 'Command palette',
  commandPlaceholder: 'Search for a page or action…',
  notifications: 'Notifications',
  unreadNotifications: (count) =>
    count === 0 ? 'Notifications' : `Notifications, ${count} unread`,
  markAllRead: 'Mark all as read',
  noNotifications: 'Nothing here',
  today: 'Today',
  earlier: 'Earlier',
  kanbanInstructions:
    'Space picks up the card; arrow keys move it between positions and columns; Space drops it; Esc cancels.',
  cardGrabbed: (card, column, position) => `${card} picked up. Column ${column}, position ${position}.`,
  cardMoved: (card, column, position) => `${card}: column ${column}, position ${position}.`,
  cardDropped: (card, column, position) => `${card} dropped in column ${column}, position ${position}.`,
  cardCancelled: (card) => `Move of ${card} cancelled.`,
  increase: 'Increase',
  decrease: 'Decrease',
  otpGroup: 'Verification code',
  otpDigit: (n, total) => `Digit ${n} of ${total}`,
  ratingValue: (value, max) => `${value} out of ${max}`,
  ratingStar: (n) => `${n} ${n === 1 ? 'star' : 'stars'}`,
  openTimePicker: 'Choose time',
  hours: 'Hours',
  minutes: 'Minutes',
  stepOf: (n, total) => `Step ${n} of ${total}`,
  stepDone: 'completed',
  stepCurrent: 'current step',
  stepError: 'has an error',
  carousel: 'Carousel',
  previousSlide: 'Previous slide',
  nextSlide: 'Next slide',
  slideOf: (n, total) => `Slide ${n} of ${total}`,
  goToSlide: (n) => `Go to slide ${n}`,
  pauseCarousel: 'Pause automatic rotation',
  playCarousel: 'Resume automatic rotation',
  moreAvatars: (count) => `${count} more ${count === 1 ? 'person' : 'people'}`,
  confirm: 'Confirm',
  cancel: 'Cancel',
  ok: 'OK',
  contextMenu: 'Context menu',
  timeline: 'Timeline',
  tree: 'Tree',
  expandNode: (label) => `Expand ${label}`,
  collapseNode: (label) => `Collapse ${label}`,
  selectAllRows: 'Select all rows',
  selectRow: 'Select row',
  expandRow: 'Expand row',
  collapseRow: 'Collapse row',
  filterColumn: (column) => `Filter ${column}`,
  clearFilter: 'Clear filter',
  visibleColumns: 'Visible columns',
  chartLegend: 'Legend',
  chartData: 'Chart data',
  chartPoint: (series, label, value) => `${series}, ${label}: ${value}`,
  statUp: 'up',
  statDown: 'down',
  statFlat: 'flat',
  statVsPrevious: 'versus the previous period',
  densityToCompact: 'Use compact interface',
  densityToComfortable: 'Use comfortable interface',
};

/** Textos usados pelos componentes. Padrão: português. */
export const ZUR_I18N = new InjectionToken<ZurI18n>('ZUR_I18N', {
  providedIn: 'root',
  factory: () => ZUR_I18N_PT,
});

/**
 * Define o idioma dos textos internos dos componentes.
 *
 * ```ts
 * bootstrapApplication(App, { providers: [provideZuriI18n('en')] });
 * // ou só algumas chaves, sobre o português:
 * provideZuriI18n({ close: 'Fechar janela' });
 * // ou sobre o inglês:
 * provideZuriI18n({ ...ZUR_I18N_EN, close: 'Dismiss' });
 * ```
 */
export function provideZuriI18n(config: 'pt' | 'en' | Partial<ZurI18n>): Provider {
  const value =
    config === 'pt'
      ? ZUR_I18N_PT
      : config === 'en'
        ? ZUR_I18N_EN
        : { ...ZUR_I18N_PT, ...config };
  return { provide: ZUR_I18N, useValue: value };
}
