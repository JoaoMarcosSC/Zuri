#!/usr/bin/env node
/**
 * Verifica a renderização no servidor (SSR): compila a documentação com a configuração
 * `ssr-check` (que pré-renderiza todas as rotas em Node) e confere o HTML de cada uma.
 * Falha se alguma rota der erro no servidor (ex.: `window`/`document` indefinidos) ou sair vazia.
 *
 *   npm run check:ssr
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist/docs-ssr/browser');

const LAYOUTS = ['landing', 'dashboard', 'lista-detalhe', 'formulario', 'documentacao', 'autenticacao', 'erro'];
/** rota → trecho que precisa aparecer no HTML renderizado */
const ROUTES = {
  '': 'Um design system',
  instalacao: 'Instalação',
  tokens: 'Design Tokens',
  componentes: 'Componentes',
  layouts: 'Layouts',
  ...Object.fromEntries(LAYOUTS.map((l) => [`demo/${l}`, '<'])),
};

rmSync(join(root, 'dist/docs-ssr'), { recursive: true, force: true });
const build = spawnSync('npx', ['ng', 'build', 'docs', '--configuration', 'ssr-check'], { cwd: root, encoding: 'utf8' });
const log = `${build.stdout}\n${build.stderr}`;

const problems = [];
if (build.status !== 0) problems.push('o build com pré-renderização falhou');
// erros do servidor aparecem no log mesmo quando o build segue
for (const line of log.split('\n')) {
  if (/\bERROR\b|is not defined|NotYetImplemented|NG0\d+/.test(line)) problems.push(line.trim());
}

for (const [route, expected] of Object.entries(ROUTES)) {
  const file = join(out, route, 'index.html');
  if (!existsSync(file)) {
    problems.push(`rota /${route}: não foi pré-renderizada (${file})`);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  if (!html.includes('<docs-root') || html.length < 1500) problems.push(`rota /${route}: HTML vazio ou sem a aplicação`);
  else if (!html.includes(expected)) problems.push(`rota /${route}: não achei "${expected}" no HTML`);
}

if (problems.length) {
  console.error('SSR com problemas:\n- ' + [...new Set(problems)].join('\n- '));
  console.error('\n--- log do build ---\n' + log.split('\n').slice(-40).join('\n'));
  process.exit(1);
}
console.log(`SSR ok: ${Object.keys(ROUTES).length} rotas renderizadas no servidor sem erro.`);
