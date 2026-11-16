/**
 * Conjunto de ícones do Zuri: traço de 2 px, pontas arredondadas, grade de 24 px.
 * Cada ícone é uma constante exportada, então o bundler descarta os que o app não usa.
 * Os marcados com `mirror` apontam para um lado e se espelham em RTL.
 *
 * ```html
 * <zur-icon [icon]="lupa" />   // readonly lupa = zurIconSearch;
 * ```
 */
export interface ZurIconDef {
  /** Nome em kebab-case (para docs e testes). */
  readonly name: string;
  /** Dados do caminho SVG (`d`), em grade 24 × 24. */
  readonly d: string;
  /** Ícone direcional: espelha em páginas da direita para a esquerda. */
  readonly mirror?: boolean;
}

export const zurIconCheck: ZurIconDef = { name: 'check', d: 'M5 12.5l4.5 4.5L19 7.5' };
export const zurIconX: ZurIconDef = { name: 'x', d: 'M6 6l12 12M18 6L6 18' };
export const zurIconPlus: ZurIconDef = { name: 'plus', d: 'M12 5v14M5 12h14' };
export const zurIconMinus: ZurIconDef = { name: 'minus', d: 'M5 12h14' };
export const zurIconChevronUp: ZurIconDef = { name: 'chevron-up', d: 'M6 15l6-6 6 6' };
export const zurIconChevronDown: ZurIconDef = { name: 'chevron-down', d: 'M6 9l6 6 6-6' };
export const zurIconChevronStart: ZurIconDef = { name: 'chevron-start', d: 'M15 6l-6 6 6 6', mirror: true };
export const zurIconChevronEnd: ZurIconDef = { name: 'chevron-end', d: 'M9 6l6 6-6 6', mirror: true };
export const zurIconArrowUp: ZurIconDef = { name: 'arrow-up', d: 'M12 19V5M6 11l6-6 6 6' };
export const zurIconArrowDown: ZurIconDef = { name: 'arrow-down', d: 'M12 5v14M6 13l6 6 6-6' };
export const zurIconSearch: ZurIconDef = { name: 'search', d: 'M11 4a7 7 0 1 0 0 14a7 7 0 0 0 0-14zM20 20l-4-4' };
export const zurIconMenu: ZurIconDef = { name: 'menu', d: 'M4 7h16M4 12h16M4 17h16' };
export const zurIconMoreHorizontal: ZurIconDef = { name: 'more-horizontal', d: 'M5 12h.01M12 12h.01M19 12h.01' };
export const zurIconMoreVertical: ZurIconDef = { name: 'more-vertical', d: 'M12 5h.01M12 12h.01M12 19h.01' };
export const zurIconInfo: ZurIconDef = { name: 'info', d: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM12 11v5M12 7.5h.01' };
export const zurIconAlertTriangle: ZurIconDef = { name: 'alert-triangle', d: 'M12 3L2.5 20h19L12 3zM12 10v4M12 17.5h.01' };
export const zurIconAlertCircle: ZurIconDef = { name: 'alert-circle', d: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM12 7.5v5M12 16h.01' };
export const zurIconCheckCircle: ZurIconDef = { name: 'check-circle', d: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM8.5 12.5l2.5 2.5 4.5-5.5' };
export const zurIconXCircle: ZurIconDef = { name: 'x-circle', d: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM9 9l6 6M15 9l-6 6' };
export const zurIconTrash: ZurIconDef = { name: 'trash', d: 'M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3' };
export const zurIconPencil: ZurIconDef = { name: 'pencil', d: 'M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1zM14 7l3 3' };
export const zurIconCopy: ZurIconDef = { name: 'copy', d: 'M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zM16 9V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3' };
export const zurIconDownload: ZurIconDef = { name: 'download', d: 'M12 4v11M7 11l5 5 5-5M5 20h14' };
export const zurIconUpload: ZurIconDef = { name: 'upload', d: 'M12 16V5M7 9l5-5 5 5M5 20h14' };
export const zurIconLink: ZurIconDef = { name: 'link', d: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1' };
export const zurIconExternalLink: ZurIconDef = { name: 'external-link', d: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5', mirror: true };
export const zurIconEye: ZurIconDef = { name: 'eye', d: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' };
export const zurIconEyeOff: ZurIconDef = { name: 'eye-off', d: 'M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 7.5C3.8 9.3 2 12 2 12s3.5 7 10 7c1.5 0 2.8-.4 4-1M9.9 9.9a3 3 0 0 0 4.2 4.2' };
export const zurIconCalendar: ZurIconDef = { name: 'calendar', d: 'M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 10h16M8 3v4M16 3v4' };
export const zurIconClock: ZurIconDef = { name: 'clock', d: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM12 7v5l3 2' };
export const zurIconUser: ZurIconDef = { name: 'user', d: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 20a8 8 0 0 1 16 0' };
export const zurIconUsers: ZurIconDef = { name: 'users', d: 'M9 5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM2.5 20a6.5 6.5 0 0 1 13 0M16 5.2a3.5 3.5 0 0 1 0 6.6M18 14.2a6.5 6.5 0 0 1 3.5 5.8' };
export const zurIconHome: ZurIconDef = { name: 'home', d: 'M4 11l8-7 8 7M6 10v10h4v-6h4v6h4V10' };
export const zurIconSettings: ZurIconDef = { name: 'settings', d: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4' };
export const zurIconHeart: ZurIconDef = { name: 'heart', d: 'M12 20s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 5.8-8 11-8 11z' };
export const zurIconStar: ZurIconDef = { name: 'star', d: 'M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9 6.8 19.7l1-5.9L3.5 9.7l5.9-.8L12 3.5z' };
export const zurIconFilter: ZurIconDef = { name: 'filter', d: 'M4 5h16l-6 8v6l-4-2v-4L4 5z' };
export const zurIconSort: ZurIconDef = { name: 'sort', d: 'M8 4v16M4 16l4 4 4-4M16 20V4M12 8l4-4 4 4' };
export const zurIconRefresh: ZurIconDef = { name: 'refresh', d: 'M20 11a8 8 0 0 0-14.5-3.5L4 9M4 4v5h5M4 13a8 8 0 0 0 14.5 3.5L20 15M20 20v-5h-5' };
export const zurIconBell: ZurIconDef = { name: 'bell', d: 'M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15L6 17zM10 21h4' };
export const zurIconMail: ZurIconDef = { name: 'mail', d: 'M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM3 7l9 6.5L21 7' };
export const zurIconImage: ZurIconDef = { name: 'image', d: 'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8.5 8a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM4 17l5-5 4 4 3-3 4 4' };
export const zurIconFile: ZurIconDef = { name: 'file', d: 'M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v5h5' };
export const zurIconFolder: ZurIconDef = { name: 'folder', d: 'M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z' };
export const zurIconLock: ZurIconDef = { name: 'lock', d: 'M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1zM8 11V8a4 4 0 0 1 8 0v3' };
export const zurIconUndo: ZurIconDef = { name: 'undo', d: 'M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3', mirror: true };
export const zurIconGrip: ZurIconDef = { name: 'grip', d: 'M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01' };

/** Todos os ícones, para catálogos e testes. Importar este objeto desativa o tree-shaking. */
export const ZUR_ICON_CATALOG: readonly ZurIconDef[] = [
  zurIconCheck,
  zurIconX,
  zurIconPlus,
  zurIconMinus,
  zurIconChevronUp,
  zurIconChevronDown,
  zurIconChevronStart,
  zurIconChevronEnd,
  zurIconArrowUp,
  zurIconArrowDown,
  zurIconSearch,
  zurIconMenu,
  zurIconMoreHorizontal,
  zurIconMoreVertical,
  zurIconInfo,
  zurIconAlertTriangle,
  zurIconAlertCircle,
  zurIconCheckCircle,
  zurIconXCircle,
  zurIconTrash,
  zurIconPencil,
  zurIconCopy,
  zurIconDownload,
  zurIconUpload,
  zurIconLink,
  zurIconExternalLink,
  zurIconEye,
  zurIconEyeOff,
  zurIconCalendar,
  zurIconClock,
  zurIconUser,
  zurIconUsers,
  zurIconHome,
  zurIconSettings,
  zurIconHeart,
  zurIconStar,
  zurIconFilter,
  zurIconSort,
  zurIconRefresh,
  zurIconBell,
  zurIconMail,
  zurIconImage,
  zurIconFile,
  zurIconFolder,
  zurIconLock,
  zurIconUndo,
  zurIconGrip,
];
