import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';

export interface NgAddOptions {
  project?: string;
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
 * `ng add @juau/zuri`: importa os tokens no styles global, aplica o estilo base do
 * body e coloca a fonte Nunito Sans no index.html. Pode rodar mais de uma vez sem
 * duplicar nada.
 */
export function ngAdd(options: NgAddOptions): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(tree);
    const projectName =
      options.project ??
      Array.from(workspace.projects.keys()).find(
        (name) => workspace.projects.get(name)?.extensions['projectType'] === 'application',
      );
    const project = projectName ? workspace.projects.get(projectName) : undefined;
    if (!project) {
      throw new SchematicsException('Nenhuma aplicação encontrada. Use --project <nome>.');
    }
    const buildOptions = (project.targets.get('build')?.options ?? {}) as Record<string, unknown>;
    const root = project.sourceRoot ?? `${project.root ? project.root + '/' : ''}src`;

    // 1) styles global: tokens + estilo base do body
    const styles = (buildOptions['styles'] as (string | { input: string })[] | undefined) ?? [];
    const stylePath =
      styles
        .map((s) => (typeof s === 'string' ? s : s.input))
        .find((s) => /\.(css|scss|sass|less)$/.test(s) && tree.exists(s)) ?? `${root}/styles.css`;
    const current = tree.exists(stylePath) ? tree.readText(stylePath) : '';
    if (current.includes('@juau/zuri/styles/tokens.css')) {
      context.logger.info(`Tokens do Zuri já estavam em ${stylePath}.`);
    } else {
      const body = current.includes('--zur-canvas') ? '' : BODY_RULE;
      const next = `${TOKENS_IMPORT}\n${current.trimStart() ? '\n' + current.trimStart() : ''}${body}`;
      if (tree.exists(stylePath)) tree.overwrite(stylePath, next);
      else tree.create(stylePath, next);
      context.logger.info(`Tokens do Zuri importados em ${stylePath}.`);
    }

    // 2) index.html: fonte Nunito Sans
    const indexOption = buildOptions['index'];
    const indexPath =
      typeof indexOption === 'string'
        ? indexOption
        : (indexOption as { input?: string } | undefined)?.input ?? `${root}/index.html`;
    if (!tree.exists(indexPath)) {
      context.logger.warn(`Não achei ${indexPath}; adicione a fonte Nunito Sans à mão.`);
    } else {
      const html = tree.readText(indexPath);
      if (html.includes('Nunito+Sans')) {
        context.logger.info(`A fonte Nunito Sans já estava em ${indexPath}.`);
      } else if (!html.includes('</head>')) {
        context.logger.warn(`${indexPath} não tem </head>; adicione a fonte à mão.`);
      } else {
        const links = FONT_LINKS.map((l) => `    ${l}`).join('\n');
        tree.overwrite(indexPath, html.replace('</head>', `${links}\n  </head>`));
        context.logger.info(`Fonte Nunito Sans adicionada em ${indexPath}.`);
      }
    }

    context.logger.info(
      "Pronto. Importe os componentes de '@juau/zuri' onde for usar, ex.: imports: [ZurButton].",
    );
  };
}
