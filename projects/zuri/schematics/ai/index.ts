import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ZuriThemeChoice, detectTheme, resolveProject } from '../shared';

export interface AiOptions {
  project?: string;
  theme?: ZuriThemeChoice;
}

const BLOCK_START = '<!-- zuri:inicio -->';
const BLOCK_END = '<!-- zuri:fim -->';
const MD_MARKER = '<!-- zuri:gerado';
const TOML_MARKER = '# zuri:gerado';

/** Pasta `ai/` do pacote instalado (dist/zuri/ai). */
function packageAiDir(): string {
  const dir = join(__dirname, '..', '..', 'ai');
  if (!existsSync(join(dir, 'skills'))) {
    throw new SchematicsException('Material de IA do Zuri não encontrado no pacote (pasta ai/).');
  }
  return dir;
}

function markerNote(version: string): string {
  return `zuri:gerado v${version}. Atualizado por "ng g @juau/zuri:ai". Para personalizar e manter suas mudanças, apague esta linha.`;
}

/** Marca o Markdown logo depois do frontmatter (o frontmatter precisa continuar na primeira linha). */
export function withMdMarker(md: string, version: string): string {
  const note = `<!-- ${markerNote(version)} -->`;
  const m = md.match(/^(---\n[\s\S]*?\n---\n)([\s\S]*)$/);
  return m ? `${m[1]}${note}\n${m[2]}` : `${note}\n${md}`;
}

export function withTomlMarker(toml: string, version: string): string {
  return `# ${markerNote(version)}\n${toml}`;
}

type WriteResult = 'criado' | 'atualizado' | 'igual' | 'mantido';

/** Escreve um arquivo do Zuri sem nunca sobrescrever o que a pessoa personalizou (sem o marcador). */
function writeOwned(tree: Tree, path: string, content: string, marker: string): WriteResult {
  if (!tree.exists(path)) {
    tree.create(path, content);
    return 'criado';
  }
  const current = tree.readText(path);
  if (!current.includes(marker)) return 'mantido';
  if (current === content) return 'igual';
  tree.overwrite(path, content);
  return 'atualizado';
}

const THEME_TEXT: Record<ZuriThemeChoice, string> = {
  both: 'claro e escuro: segue o sistema e a pessoa troca no `<zur-theme-toggle />` (`provideZuriTheme({ mode: \'system\' })`). Teste as telas nos dois temas.',
  light: 'só claro (`provideZuriTheme({ mode: \'light\' })`). Não use `zur-theme-toggle`.',
  dark: 'só escuro (`provideZuriTheme({ mode: \'dark\' })`). Não use `zur-theme-toggle`.',
};

/** Bloco do Zuri no AGENTS.md: curto, aponta para o material completo dentro do pacote. */
export function agentsBlock(version: string, theme: ZuriThemeChoice): string {
  return [
    BLOCK_START,
    '## Interface com o Zuri',
    '',
    `Este projeto usa o design system **Zuri** (\`@juau/zuri\` ${version}, Angular). Ao criar ou alterar interface:`,
    '',
    '- **Use os componentes do Zuri** em vez de criar os seus. A API real (seletores, entradas, saídas) está em',
    '  `node_modules/@juau/zuri/ai/catalogo.md`. Não invente entradas.',
    '- **Leia as regras antes de mexer na interface:** `node_modules/@juau/zuri/ai/regras.md`. Em resumo: só tokens',
    '  `--zur-*` (nada de cores, sombras ou raios fixos), menta só em ação ou estado ativo, uma única sombra e só em',
    '  elementos flutuantes, componentes standalone com `OnPush`, Signal Forms nos formulários, acessibilidade sempre.',
    `- **Tema:** ${THEME_TEXT[theme]}`,
    '- **Telas prontas para adaptar:** `node_modules/@juau/zuri/ai/receitas/`. **Escolha de layout:**',
    '  `node_modules/@juau/zuri/ai/layouts.md`. **Migração** de outras bibliotecas: `node_modules/@juau/zuri/ai/migracao.md`.',
    '- **Fluxos guiados** (Claude Code: `/nome`; Codex: `$nome`): `zuri-iniciar` (por onde começar), `zuri-layout`,',
    '  `zuri-tela`, `zuri-backend` (frontend a partir da API) e `zuri-migrar` (frontend existente). Agents:',
    '  `zuri-inventario` e `zuri-revisor`.',
    '',
    BLOCK_END,
  ].join('\n');
}

/** Cria o AGENTS.md ou troca só o bloco do Zuri, preservando o resto. */
export function upsertAgentsMd(current: string | null, block: string): string {
  if (current === null) return `# Instruções para agentes de IA\n\n${block}\n`;
  const start = current.indexOf(BLOCK_START);
  const end = current.indexOf(BLOCK_END);
  if (start >= 0 && end > start) {
    return current.slice(0, start) + block + current.slice(end + BLOCK_END.length);
  }
  return `${current.replace(/\s*$/, '')}\n\n${block}\n`;
}

/** CLAUDE.md importa o AGENTS.md, para as regras valerem no Claude Code também. */
export function ensureClaudeImport(current: string | null): string | null {
  if (current === null) return '@AGENTS.md\n';
  if (/^@AGENTS\.md\s*$/m.test(current)) return null;
  return `${current.replace(/\s*$/, '')}\n\n@AGENTS.md\n`;
}

/**
 * `ng g @juau/zuri:ai`: instala (ou atualiza) as skills e os agents do Zuri para Claude Code
 * (`.claude/`) e Codex (`.agents/skills`, `.codex/agents`), o bloco de regras no `AGENTS.md` e o
 * import no `CLAUDE.md`. Arquivos que a pessoa personalizou (sem o marcador) não são tocados.
 */
export function ai(options: AiOptions): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const dir = packageAiDir();
    const version = readFileSync(join(dir, 'VERSION'), 'utf8').trim();
    let theme = options.theme;
    if (!theme) {
      try {
        const project = await resolveProject(tree, options.project);
        theme = detectTheme(tree, project.root) ?? 'both';
      } catch {
        theme = 'both';
      }
    }

    const results: Record<WriteResult, string[]> = { criado: [], atualizado: [], igual: [], mantido: [] };
    const record = (path: string, r: WriteResult) => results[r].push(path);

    for (const skill of readdirSync(join(dir, 'skills'))) {
      const src = join(dir, 'skills', skill, 'SKILL.md');
      if (!existsSync(src)) continue;
      const content = withMdMarker(readFileSync(src, 'utf8'), version);
      for (const base of ['.claude/skills', '.agents/skills']) {
        const path = `${base}/${skill}/SKILL.md`;
        record(path, writeOwned(tree, path, content, MD_MARKER));
      }
    }

    for (const file of readdirSync(join(dir, 'agents')).filter((f) => f.endsWith('.md'))) {
      const name = file.replace(/\.md$/, '');
      const md = withMdMarker(readFileSync(join(dir, 'agents', file), 'utf8'), version);
      record(`.claude/agents/${file}`, writeOwned(tree, `.claude/agents/${file}`, md, MD_MARKER));
      const tomlSrc = join(dir, 'codex', 'agents', `${name}.toml`);
      if (existsSync(tomlSrc)) {
        const toml = withTomlMarker(readFileSync(tomlSrc, 'utf8'), version);
        record(`.codex/agents/${name}.toml`, writeOwned(tree, `.codex/agents/${name}.toml`, toml, TOML_MARKER));
      }
    }

    const agentsCurrent = tree.exists('AGENTS.md') ? tree.readText('AGENTS.md') : null;
    const agentsNext = upsertAgentsMd(agentsCurrent, agentsBlock(version, theme));
    if (agentsCurrent === null) tree.create('AGENTS.md', agentsNext);
    else if (agentsNext !== agentsCurrent) tree.overwrite('AGENTS.md', agentsNext);

    const claudeCurrent = tree.exists('CLAUDE.md') ? tree.readText('CLAUDE.md') : null;
    const claudeNext = ensureClaudeImport(claudeCurrent);
    if (claudeNext !== null) {
      if (claudeCurrent === null) tree.create('CLAUDE.md', claudeNext);
      else tree.overwrite('CLAUDE.md', claudeNext);
    }

    const log = context.logger;
    if (results.criado.length) log.info(`Modo com IA: ${results.criado.length} arquivo(s) criado(s) em .claude/, .agents/ e .codex/.`);
    if (results.atualizado.length) log.info(`Modo com IA: ${results.atualizado.length} arquivo(s) atualizado(s) para a v${version}.`);
    for (const path of results.mantido) {
      log.warn(`${path} foi personalizado (sem o marcador zuri:gerado) e não foi alterado.`);
    }
    log.info('Regras do Zuri no AGENTS.md (lido pelo Codex, Cursor, Copilot e outros) e importadas no CLAUDE.md.');
    log.info('Para começar: no Claude Code digite /zuri-iniciar; no Codex, $zuri-iniciar.');
  };
}
