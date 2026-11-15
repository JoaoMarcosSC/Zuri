import { InjectionToken, Provider } from '@angular/core';

/**
 * Textos que os componentes do Zuri mostram ou anunciam para leitores de tela
 * (rótulos de botões, `aria-label` de regiões etc.). O padrão é português;
 * troque com `provideZuriI18n('en')` ou passe só as chaves que quiser mudar.
 */
export interface ZurI18n {
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
}

export const ZUR_I18N_PT: ZurI18n = {
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
};

export const ZUR_I18N_EN: ZurI18n = {
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
