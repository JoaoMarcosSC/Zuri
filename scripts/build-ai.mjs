// Monta o material de IA do pacote em dist/zuri/ai:
//   - copia projects/zuri/ai (regras, receitas, migração, skills, agents);
//   - layouts.md a partir do LAYOUTS.md do repositório;
//   - catalogo.md gerado da API pública (build-ai-catalog.mjs);
//   - codex/agents/<nome>.toml: os agents no formato do Codex, gerados dos .md do Claude Code.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCatalog, selectorsInCatalog } from './build-ai-catalog.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'projects/zuri/ai');

/** Separa o frontmatter (`key: value` por linha) do corpo de um Markdown. */
export function parseFrontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: md };
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2].trim();
  }
  return { data, body: m[2] };
}

/** String TOML: literal multilinha quando possível (legível), senão básica com escapes (JSON é compatível). */
function tomlString(value, multiline = false) {
  if (multiline && !value.includes("'''")) return `'''\n${value.replace(/\s+$/, '')}\n'''`;
  return JSON.stringify(value);
}

/** Agent do Claude Code (.md com frontmatter) → agent do Codex (.toml). */
export function agentToCodexToml(md) {
  const { data, body } = parseFrontmatter(md);
  if (!data.name || !data.description) throw new Error('agent sem name/description no frontmatter');
  return [
    `name = ${tomlString(data.name)}`,
    `description = ${tomlString(data.description)}`,
    `developer_instructions = ${tomlString(body.trim(), true)}`,
    '',
  ].join('\n');
}

export function buildAi(outDir = join(ROOT, 'dist/zuri/ai')) {
  const version = JSON.parse(readFileSync(join(ROOT, 'projects/zuri/package.json'), 'utf8')).version;
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  cpSync(SRC, outDir, { recursive: true });

  const layouts = readFileSync(join(ROOT, 'LAYOUTS.md'), 'utf8').replace(
    /\(`projects\/zuri\/src\/lib\/layout`\)/,
    '(a API exata de cada um está na seção "Layouts de página" do `catalogo.md`)',
  );
  writeFileSync(join(outDir, 'layouts.md'), layouts);

  const catalog = renderCatalog(version);
  writeFileSync(join(outDir, 'catalogo.md'), catalog);

  const codexDir = join(outDir, 'codex/agents');
  mkdirSync(codexDir, { recursive: true });
  for (const file of readdirSync(join(SRC, 'agents')).filter((f) => f.endsWith('.md'))) {
    const toml = agentToCodexToml(readFileSync(join(SRC, 'agents', file), 'utf8'));
    writeFileSync(join(codexDir, file.replace(/\.md$/, '.toml')), toml);
  }
  writeFileSync(join(outDir, 'VERSION'), version + '\n');
  return { version, components: selectorsInCatalog(catalog).length, catalogKiB: catalog.length / 1024 };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!existsSync(join(ROOT, 'dist/zuri/package.json'))) {
    console.error('Rode o build da biblioteca antes (dist/zuri não existe).');
    process.exit(1);
  }
  const r = buildAi();
  console.log(`Material de IA ${r.version} em dist/zuri/ai: ${r.components} componentes no catálogo (${r.catalogKiB.toFixed(1)} KiB), skills, agents e receitas.`);
}
