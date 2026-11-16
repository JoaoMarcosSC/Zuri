// Testes do material de IA empacotado em dist/zuri/ai (rode depois do build:lib).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicFiles, selectorsInCatalog } from './build-ai-catalog.mjs';
import { parseFrontmatter } from './build-ai.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const AI = join(ROOT, 'dist/zuri/ai');
const require = createRequire(import.meta.url);
const schematicAi = require(join(ROOT, 'dist/zuri/schematics/ai/index.js'));

test('o material de IA existe no pacote', () => {
  for (const f of ['catalogo.md', 'regras.md', 'layouts.md', 'migracao.md', 'README.md', 'VERSION']) {
    assert.ok(existsSync(join(AI, f)), `falta ai/${f}`);
  }
  const version = JSON.parse(readFileSync(join(ROOT, 'projects/zuri/package.json'), 'utf8')).version;
  assert.equal(readFileSync(join(AI, 'VERSION'), 'utf8').trim(), version);
});

test('o catálogo lista todo seletor exportado pela API pública', () => {
  const exported = new Set();
  for (const { file } of publicFiles()) {
    for (const m of readFileSync(file, 'utf8').matchAll(/selector:\s*'([^']+)'/g)) exported.add(m[1]);
  }
  const inCatalog = new Set(selectorsInCatalog(readFileSync(join(AI, 'catalogo.md'), 'utf8')));
  const missing = [...exported].filter((s) => !inCatalog.has(s));
  assert.deepEqual(missing, []);
  assert.ok(exported.size > 90);
});

test('o catálogo traz a API real de um componente (entradas, tipo, formulário)', () => {
  const md = readFileSync(join(AI, 'catalogo.md'), 'utf8');
  const combobox = md.slice(md.indexOf('### `zur-combobox`'), md.indexOf('### ', md.indexOf('### `zur-combobox`') + 5));
  assert.match(combobox, /\| entrada \| multiple \| boolean \| false \|/);
  assert.match(combobox, /Controle de formulário: valor `string \| string\[\] \| null`/);
  assert.match(md, /`zurIconSearch` \(search\)/);
});

test('o layouts.md não aponta para caminhos que só existem no repositório do Zuri', () => {
  assert.doesNotMatch(readFileSync(join(AI, 'layouts.md'), 'utf8'), /projects\/zuri\/src/);
});

const skills = readdirSync(join(AI, 'skills'));
test('há as cinco skills', () => {
  assert.deepEqual(skills.sort(), ['zuri-backend', 'zuri-iniciar', 'zuri-layout', 'zuri-migrar', 'zuri-tela']);
});

for (const skill of skills) {
  test(`skill ${skill}: frontmatter portátil (Claude Code e Codex)`, () => {
    const md = readFileSync(join(AI, 'skills', skill, 'SKILL.md'), 'utf8');
    assert.ok(md.startsWith('---\n'), 'o frontmatter precisa estar na primeira linha');
    const { data, body } = parseFrontmatter(md);
    assert.equal(data.name, skill, 'name igual ao nome da pasta');
    assert.ok(data.description && data.description.length >= 60 && data.description.length <= 1024);
    assert.deepEqual(Object.keys(data).sort(), ['description', 'name'], 'só name e description (portável)');
    assert.ok(body.includes('@juau/zuri') || body.includes('Zuri'));
    // marcador de geração entra depois do frontmatter, sem quebrá-lo
    const marked = schematicAi.withMdMarker(md, '9.9.9');
    assert.ok(marked.startsWith('---\n'));
    assert.equal(parseFrontmatter(marked).data.name, skill);
    assert.match(marked, /<!-- zuri:gerado v9\.9\.9/);
  });
}

for (const file of readdirSync(join(AI, 'agents'))) {
  const name = file.replace(/\.md$/, '');
  test(`agent ${name}: Claude Code (.md) e Codex (.toml) válidos`, () => {
    const { data } = parseFrontmatter(readFileSync(join(AI, 'agents', file), 'utf8'));
    assert.equal(data.name, name);
    assert.ok(data.description);
    assert.equal(data.tools, 'Read, Grep, Glob', 'agents do Zuri são só de leitura');
    const toml = schematicAi.withTomlMarker(readFileSync(join(AI, 'codex/agents', `${name}.toml`), 'utf8'), '9.9.9');
    let parsed;
    try {
      parsed = JSON.parse(
        execFileSync('python3', ['-c', 'import sys,json,tomllib;print(json.dumps(tomllib.loads(sys.stdin.read())))'], { input: toml }).toString(),
      );
    } catch (e) {
      if (String(e).includes('ENOENT')) return; // sem python3: pula a validação de TOML
      throw e;
    }
    assert.equal(parsed.name, name);
    assert.equal(parsed.description, data.description);
    assert.ok(parsed.developer_instructions.length > 200);
  });
}

test('receitas: todo bloco de código diz o arquivo e exporta uma classe', () => {
  const dir = join(AI, 'receitas');
  for (const f of readdirSync(dir)) {
    const md = readFileSync(join(dir, f), 'utf8');
    const blocks = [...md.matchAll(/```ts\n([\s\S]*?)```/g)].map((m) => m[1]);
    assert.ok(blocks.length > 0, `${f} sem código`);
    for (const b of blocks) {
      assert.match(b, /^\/\/ arquivo: src\/app\/[\w/.-]+\.ts$/m, `${f}: bloco sem "// arquivo:"`);
      assert.match(b, /export class \w+/);
      assert.match(b, /from '@juau\/zuri'|@Injectable/);
    }
  }
});
