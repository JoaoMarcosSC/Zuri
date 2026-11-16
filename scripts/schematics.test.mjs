// Testes dos schematics (ng add e ai) contra um workspace Angular criado em memória.
// Rode depois do build:lib: usa o schematic compilado em dist/zuri/schematics.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { SchematicTestRunner } = require('@angular-devkit/schematics/testing');

const runner = new SchematicTestRunner('@juau/zuri', join(ROOT, 'dist/zuri/schematics/collection.json'));

async function app() {
  let tree = await runner.runExternalSchematic('@schematics/angular', 'workspace', {
    name: 'ws', newProjectRoot: 'projects', version: '22.0.0',
  });
  tree = await runner.runExternalSchematic('@schematics/angular', 'application', {
    name: 'loja', standalone: true, style: 'css', skipTests: true, ssr: false,
  }, tree);
  return tree;
}

const read = (tree, p) => tree.readText(p);
const SRC = 'projects/loja/src';

test('tema "ambos" (padrão): script sem piscar no index, provideZuriTheme system, nada de IA', async () => {
  const tree = await runner.runSchematic('ng-add', { project: 'loja' }, await app());
  const html = read(tree, `${SRC}/index.html`);
  assert.match(html, /Nunito\+Sans/);
  assert.match(html, /getItem\('zur-theme'\)/);
  assert.doesNotMatch(html, /data-theme="/);
  const config = read(tree, `${SRC}/app/app.config.ts`);
  assert.match(config, /import \{ provideZuriTheme \} from '@juau\/zuri'/);
  assert.match(config, /provideZuriTheme\(\{ mode: 'system' \}\)/);
  assert.match(read(tree, `${SRC}/styles.css`), /@juau\/zuri\/styles\/tokens\.css/);
  for (const p of ['AGENTS.md', 'CLAUDE.md', '.claude/skills/zuri-iniciar/SKILL.md']) assert.equal(tree.exists(p), false, p);
});

for (const theme of ['light', 'dark']) {
  test(`tema "${theme}": data-theme fixo no <html> e provideZuriTheme ${theme}, sem script`, async () => {
    const tree = await runner.runSchematic('ng-add', { project: 'loja', theme }, await app());
    const html = read(tree, `${SRC}/index.html`);
    assert.match(html, new RegExp(`<html data-theme="${theme}"`));
    assert.doesNotMatch(html, /getItem\('zur-theme'\)/);
    assert.match(read(tree, `${SRC}/app/app.config.ts`), new RegExp(`provideZuriTheme\\(\\{ mode: '${theme}' \\}\\)`));
  });
}

test('rodar duas vezes não duplica nada', async () => {
  let tree = await runner.runSchematic('ng-add', { project: 'loja', ai: true }, await app());
  const snapshot = (t) => ['index.html', 'styles.css', 'app/app.config.ts'].map((f) => read(t, `${SRC}/${f}`)).join('|') + read(t, 'AGENTS.md') + read(t, 'CLAUDE.md');
  const before = snapshot(tree);
  tree = await runner.runSchematic('ng-add', { project: 'loja', ai: true }, tree);
  assert.equal(snapshot(tree), before);
  assert.equal((read(tree, `${SRC}/app/app.config.ts`).match(/provideZuriTheme\(/g) ?? []).length, 1);
});

test('modo com IA: skills nas pastas do Claude Code e do Codex, agents nos dois formatos, regras e import', async () => {
  const tree = await runner.runSchematic('ng-add', { project: 'loja', theme: 'dark', ai: true }, await app());
  for (const s of ['zuri-iniciar', 'zuri-layout', 'zuri-tela', 'zuri-backend', 'zuri-migrar']) {
    for (const base of ['.claude/skills', '.agents/skills']) {
      const md = read(tree, `${base}/${s}/SKILL.md`);
      assert.ok(md.startsWith(`---\nname: ${s}\n`), `${base}/${s}`);
      assert.match(md, /<!-- zuri:gerado v/);
    }
  }
  for (const a of ['zuri-inventario', 'zuri-revisor']) {
    assert.match(read(tree, `.claude/agents/${a}.md`), new RegExp(`name: ${a}`));
    assert.match(read(tree, `.codex/agents/${a}.toml`), new RegExp(`^# zuri:gerado[\\s\\S]*name = "${a}"`));
  }
  const agents = read(tree, 'AGENTS.md');
  assert.match(agents, /<!-- zuri:inicio -->[\s\S]*<!-- zuri:fim -->/);
  assert.match(agents, /\*\*Tema:\*\* só escuro/);
  assert.match(agents, /node_modules\/@juau\/zuri\/ai\/catalogo\.md/);
  assert.equal(read(tree, 'CLAUDE.md'), '@AGENTS.md\n');
});

test('AGENTS.md e CLAUDE.md que já existem são preservados; só o bloco do Zuri muda', async () => {
  const base = await app();
  base.create('AGENTS.md', '# Meu projeto\n\nUse pnpm.\n');
  base.create('CLAUDE.md', '# Notas\n\nRode os testes antes do commit.\n');
  let tree = await runner.runSchematic('ai', { project: 'loja', theme: 'light' }, base);
  let agents = read(tree, 'AGENTS.md');
  assert.ok(agents.startsWith('# Meu projeto\n\nUse pnpm.\n'));
  assert.match(agents, /só claro/);
  assert.equal(read(tree, 'CLAUDE.md'), '# Notas\n\nRode os testes antes do commit.\n\n@AGENTS.md\n');
  // trocar o tema troca só o bloco
  tree = await runner.runSchematic('ai', { project: 'loja', theme: 'both' }, tree);
  agents = read(tree, 'AGENTS.md');
  assert.ok(agents.startsWith('# Meu projeto\n\nUse pnpm.\n'));
  assert.doesNotMatch(agents, /só claro/);
  assert.match(agents, /claro e escuro/);
  assert.equal((agents.match(/zuri:inicio/g) ?? []).length, 1);
  assert.equal((read(tree, 'CLAUDE.md').match(/@AGENTS\.md/g) ?? []).length, 1);
});

test('arquivo personalizado pela pessoa (sem o marcador) não é sobrescrito; o original é atualizado', async () => {
  let tree = await runner.runSchematic('ai', { project: 'loja' }, await app());
  tree.overwrite('.claude/skills/zuri-tela/SKILL.md', '---\nname: zuri-tela\ndescription: minha versão\n---\nMinhas regras.\n');
  const original = read(tree, '.agents/skills/zuri-tela/SKILL.md');
  tree.overwrite('.agents/skills/zuri-tela/SKILL.md', original.replace('# Criar uma tela', '# Versão antiga'));
  tree = await runner.runSchematic('ai', { project: 'loja' }, tree);
  assert.equal(read(tree, '.claude/skills/zuri-tela/SKILL.md'), '---\nname: zuri-tela\ndescription: minha versão\n---\nMinhas regras.\n');
  assert.equal(read(tree, '.agents/skills/zuri-tela/SKILL.md'), original);
});

test('ng g @juau/zuri:ai sem --theme lê o tema do provideZuriTheme do projeto', async () => {
  let tree = await runner.runSchematic('ng-add', { project: 'loja', theme: 'light' }, await app());
  tree = await runner.runSchematic('ai', { project: 'loja' }, tree);
  assert.match(read(tree, 'AGENTS.md'), /só claro/);
});
