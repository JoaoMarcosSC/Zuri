/**
 * Largura do conteúdo dos layouts:
 * - `fluid`: ocupa tudo (dashboards, lista-detalhe);
 * - `wide`: ~1100px centralizado (landing);
 * - `reading`: ~760px (documentação, formulários);
 * - `narrow`: ~440px (autenticação, erro).
 */
export type ZurLayoutWidth = 'fluid' | 'wide' | 'reading' | 'narrow';

/** Estilos compartilhados: mapeia `data-width` para `--zur-layout-max`. */
export const ZUR_LAYOUT_WIDTH_STYLES = `
  :host([data-width='fluid']) { --zur-layout-max: none; }
  :host([data-width='wide']) { --zur-layout-max: 1100px; }
  :host([data-width='reading']) { --zur-layout-max: 760px; }
  :host([data-width='narrow']) { --zur-layout-max: 440px; }
`;
