import { Rule, SchematicContext, Tree, chain, schematic } from '@angular-devkit/schematics';
import { addRootProvider } from '@schematics/angular/utility';
import { ZuriThemeChoice, appConfigFiles, resolveProject } from '../shared';

export interface NgAddOptions {
  project?: string;
  theme?: ZuriThemeChoice;
  ai?: boolean;
}

const TOKENS_IMPORT = "@import '@juau/zuri/styles/tokens.css';";
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800&display=swap';
const FONT_LINKS = [
  '<link rel="preconnect" href="https://fonts.googleapis.com" />',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
  `<link href="${FONT_HREF}" rel="stylesheet" />`,
];
const BODY_RULE = `
body {
  margin: 0;
  background: var(--zur-canvas);
  color: var(--zur-body);
  font: var(--zur-font-body);
}
`;

/**
 * Tema "ambos": aplica o tema salvo (ou o do sistema) antes da primeira pintura, para a página não
 * piscar no tema errado, inclusive com SSR. Depois o `provideZuriTheme` assume.
 */
export const THEME_BOOT_SCRIPT =
  "<script>/* Zuri: tema salvo ou do sistema antes da primeira pintura */(function(){try{var t=localStorage.getItem('zur-theme');" +
  "if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}" +
  "document.documentElement.setAttribute('data-theme',t)}catch(e){}})()</script>";

const THEME_MODE: Record<ZuriThemeChoice, 'system' | 'light' | 'dark'> = {
  both: 'system',
  light: 'light',
  dark: 'dark',
};

/** index.html: fonte e tema inicial. Exportado para os testes. */
export function updateIndexHtml(html: string, theme: ZuriThemeChoice): { html: string; notes: string[] } {
  const notes: string[] = [];
  let next = html;
  if (!next.includes('</head>')) return { html, notes: ['sem </head>: adicione a fonte Nunito Sans à mão'] };

  if (next.includes('Nunito+Sans')) notes.push('a fonte Nunito Sans já estava lá');
  else {
    next = next.replace('</head>', `${FONT_LINKS.map((l) => `    ${l}`).join('\n')}\n  </head>`);
    notes.push('fonte Nunito Sans adicionada');
  }

  if (theme === 'both') {
    if (next.includes("getItem('zur-theme')")) notes.push('o script de tema já estava lá');
    else {
      next = next.replace('</head>', `    ${THEME_BOOT_SCRIPT}\n  </head>`);
      notes.push('script de tema inicial adicionado (sem piscar)');
    }
  } else if (/<html[^>]*\sdata-theme=/.test(next)) {
    notes.push('o <html> já tinha data-theme');
  } else {
    next = next.replace(/<html(\s|>)/, `<html data-theme="${theme}"$1`);
    notes.push(`<html data-theme="${theme}">`);
  }
  return { html: next, notes };
}

/**
 * `ng add @juau/zuri`: importa os tokens no styles global, aplica o estilo base do body, coloca a
 * fonte Nunito Sans, configura o tema escolhido (`provideZuriTheme`) e, se pedido, instala o modo
 * com IA (`ng g @juau/zuri:ai`). Pode rodar mais de uma vez sem duplicar nada.
 */
export function ngAdd(options: NgAddOptions): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const project = await resolveProject(tree, options.project);
    const { root, buildOptions } = project;
    const theme: ZuriThemeChoice = options.theme ?? 'both';
    const log = context.logger;

    // 1) styles global: tokens + estilo base do body
    const styles = (buildOptions['styles'] as (string | { input: string })[] | undefined) ?? [];
    const stylePath =
      styles
        .map((s) => (typeof s === 'string' ? s : s.input))
        .find((s) => /\.(css|scss|sass|less)$/.test(s) && tree.exists(s)) ?? `${root}/styles.css`;
    const current = tree.exists(stylePath) ? tree.readText(stylePath) : '';
    if (current.includes('@juau/zuri/styles/tokens.css')) {
      log.info(`Tokens do Zuri já estavam em ${stylePath}.`);
    } else {
      const body = current.includes('--zur-canvas') ? '' : BODY_RULE;
      const next = `${TOKENS_IMPORT}\n${current.trimStart() ? '\n' + current.trimStart() : ''}${body}`;
      if (tree.exists(stylePath)) tree.overwrite(stylePath, next);
      else tree.create(stylePath, next);
      log.info(`Tokens do Zuri importados em ${stylePath}.`);
    }

    // 2) index.html: fonte e tema inicial
    const indexOption = buildOptions['index'];
    const indexPath =
      typeof indexOption === 'string'
        ? indexOption
        : (indexOption as { input?: string } | undefined)?.input ?? `${root}/index.html`;
    if (!tree.exists(indexPath)) {
      log.warn(`Não achei ${indexPath}; adicione a fonte Nunito Sans à mão.`);
    } else {
      const { html, notes } = updateIndexHtml(tree.readText(indexPath), theme);
      if (html !== tree.readText(indexPath)) tree.overwrite(indexPath, html);
      log.info(`${indexPath}: ${notes.join('; ')}.`);
    }

    // 3) tema na configuração da aplicação
    const rules: Rule[] = [];
    const mode = THEME_MODE[theme];
    const configured = appConfigFiles(root).some((f) => tree.exists(f) && tree.readText(f).includes('provideZuriTheme'));
    if (configured) {
      log.info('provideZuriTheme já estava configurado; para mudar o tema, edite o mode no app.config.ts.');
    } else {
      rules.push(
        addRootProvider(project.name, ({ code, external }) => code`${external('provideZuriTheme', '@juau/zuri')}({ mode: '${mode}' })`),
      );
      log.info(`Tema: provideZuriTheme({ mode: '${mode}' }) adicionado aos providers.`);
    }
    if (theme === 'both') {
      log.info('Coloque <zur-theme-toggle /> onde a pessoa possa trocar o tema (ex.: na topbar).');
    }

    // 4) modo com IA
    if (options.ai) rules.push(schematic('ai', { project: project.name, theme }));

    log.info("Pronto. Importe os componentes de '@juau/zuri' onde for usar, ex.: imports: [ZurButton].");
    return chain(rules);
  };
}
