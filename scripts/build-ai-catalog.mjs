// Gera o catálogo de componentes que as skills de IA leem (`node_modules/@juau/zuri/ai/catalogo.md`).
// Lê a API pública com o compilador TypeScript, então o catálogo sempre bate com o código da versão.
//
// Uso: node scripts/build-ai-catalog.mjs [saída]   (padrão: dist/zuri/ai/catalogo.md)
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'projects/zuri/src');
const PUBLIC_API = join(SRC, 'public-api.ts');

/** Arquivos exportados pela API pública, na ordem, com a seção (comentário `// Seção`) de cada um. */
export function publicFiles() {
  const out = [];
  let section = 'Outros';
  const visit = (file, sec) => {
    const text = readFileSync(file, 'utf8');
    for (const line of text.split('\n')) {
      const header = line.match(/^\/\/\s*(.+?)\s*$/);
      if (header && file === PUBLIC_API) section = header[1];
      const m = line.match(/^export \* from '(.+)';/);
      if (!m) continue;
      let target = resolve(dirname(file), m[1]);
      if (existsSync(target + '.ts')) target += '.ts';
      else if (existsSync(join(target, 'index.ts'))) target = join(target, 'index.ts');
      else continue;
      if (target.endsWith('index.ts')) visit(target, file === PUBLIC_API ? section : sec);
      else out.push({ file: target, section: file === PUBLIC_API ? section : sec });
    }
  };
  visit(PUBLIC_API, section);
  return out;
}

const isExported = (node) => !!node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);

/** Texto do JSDoc (sem as tags), ou ''. */
function jsDocText(node, sf) {
  const docs = node.jsDoc ?? [];
  const parts = docs.map((d) => (typeof d.comment === 'string' ? d.comment : (d.comment ?? []).map((c) => c.text ?? '').join('')));
  return parts.join('\n').trim();
}

function firstParagraph(text) {
  const beforeCode = text.split('```')[0];
  return beforeCode.split(/\n\s*\n/)[0].replace(/\s*\n\s*/g, ' ').trim();
}

function codeExample(text) {
  const m = text.match(/```(\w*)\n([\s\S]*?)```/);
  return m ? { lang: m[1] || 'html', code: m[2].replace(/\n+$/, '') } : null;
}

function decoratorInfo(cls) {
  const decorators = ts.canHaveDecorators(cls) ? ts.getDecorators(cls) ?? [] : [];
  for (const d of decorators) {
    if (!ts.isCallExpression(d.expression)) continue;
    const kind = d.expression.expression.getText();
    if (!['Component', 'Directive', 'Injectable', 'Pipe'].includes(kind)) continue;
    const arg = d.expression.arguments[0];
    const info = { kind };
    if (arg && ts.isObjectLiteralExpression(arg)) {
      for (const p of arg.properties) {
        if (!ts.isPropertyAssignment(p)) continue;
        const key = p.name.getText();
        if ((key === 'selector' || key === 'exportAs' || key === 'name') && ts.isStringLiteralLike(p.initializer)) {
          info[key] = p.initializer.text;
        }
      }
    }
    return info;
  }
  return null;
}

/** Tipo de um input/model a partir dos argumentos de tipo, do transform ou do valor inicial. */
function signalType(call) {
  if (call.typeArguments?.length) return call.typeArguments[0].getText();
  const [initial, opts] = call.arguments;
  if (opts && ts.isObjectLiteralExpression(opts)) {
    const transform = opts.properties.find((p) => ts.isPropertyAssignment(p) && p.name.getText() === 'transform');
    if (transform) {
      const t = transform.initializer.getText();
      if (t === 'booleanAttribute') return 'boolean';
      if (t === 'numberAttribute') return 'number';
    }
  }
  if (!initial) return 'unknown';
  if (ts.isStringLiteralLike(initial)) return 'string';
  if (ts.isNumericLiteral(initial) || ts.isPrefixUnaryExpression(initial)) return 'number';
  if (initial.kind === ts.SyntaxKind.TrueKeyword || initial.kind === ts.SyntaxKind.FalseKeyword) return 'boolean';
  return 'unknown';
}

function describeClass(cls, sf) {
  const deco = decoratorInfo(cls);
  if (!deco) return null;
  const doc = jsDocText(cls, sf);
  const item = {
    name: cls.name.text,
    kind: deco.kind,
    selector: deco.selector,
    exportAs: deco.exportAs,
    summary: firstParagraph(doc),
    example: codeExample(doc),
    inputs: [],
    models: [],
    outputs: [],
    methods: [],
    formValue: null,
  };
  const implementsCva = cls.heritageClauses?.some((h) => h.types.some((t) => t.getText().includes('ControlValueAccessor')));

  for (const m of cls.members) {
    const isPrivate = m.modifiers?.some((x) => [ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword].includes(x.kind));
    if (isPrivate || !m.name || ts.isPrivateIdentifier(m.name)) continue;
    const name = m.name.getText();
    const mdoc = firstParagraph(jsDocText(m, sf));
    if (ts.isPropertyDeclaration(m) && m.initializer && ts.isCallExpression(m.initializer)) {
      const call = m.initializer;
      const callee = call.expression.getText();
      if (callee === 'input' || callee === 'input.required') {
        item.inputs.push({
          name,
          type: signalType(call),
          default: callee === 'input.required' ? '(obrigatório)' : call.arguments[0]?.getText() ?? '',
          doc: mdoc,
        });
      } else if (callee === 'model' || callee === 'model.required') {
        item.models.push({ name, type: signalType(call), default: call.arguments[0]?.getText() ?? '', doc: mdoc });
      } else if (callee === 'output') {
        item.outputs.push({ name, type: call.typeArguments?.[0]?.getText() ?? 'void', doc: mdoc });
      }
    } else if (ts.isMethodDeclaration(m) && !['writeValue', 'registerOnChange', 'registerOnTouched', 'setDisabledState'].includes(name) && !name.startsWith('ng')) {
      const params = m.parameters.map((p) => p.getText()).join(', ');
      const ret = m.type ? `: ${m.type.getText()}` : '';
      item.methods.push({ name, signature: `${name}(${params})${ret}`, doc: mdoc });
    }
    if (implementsCva && ts.isMethodDeclaration(m) && name === 'writeValue') {
      item.formValue = m.parameters[0]?.type?.getText() ?? 'unknown';
    }
  }
  return item;
}

function collect() {
  const sections = new Map();
  const add = (section, entry) => {
    if (!sections.has(section)) sections.set(section, { classes: [], functions: [], types: [], consts: [] });
    const s = sections.get(section);
    s[entry.bucket].push(entry);
  };
  for (const { file, section } of publicFiles()) {
    const sf = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    for (const node of sf.statements) {
      if (!isExported(node)) continue;
      if (ts.isClassDeclaration(node) && node.name) {
        const c = describeClass(node, sf);
        if (c) add(section, { bucket: 'classes', ...c });
      } else if (ts.isFunctionDeclaration(node) && node.name) {
        const params = node.parameters.map((p) => p.getText()).join(', ');
        const ret = node.type ? `: ${node.type.getText()}` : '';
        add(section, { bucket: 'functions', name: node.name.text, signature: `${node.name.text}(${params})${ret}`, doc: firstParagraph(jsDocText(node, sf)) });
      } else if ((ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) && node.name) {
        const text = node.getText().replace(/\/\*\*[\s\S]*?\*\/\s*/g, '');
        if (text.length <= 600) add(section, { bucket: 'types', name: node.name.text, text });
      } else if (ts.isVariableStatement(node)) {
        for (const d of node.declarationList.declarations) {
          if (!ts.isIdentifier(d.name)) continue;
          const n = d.name.text;
          if (/^zurIcon[A-Z]/.test(n)) continue; // listados à parte, pelo catálogo de ícones
          add(section, { bucket: 'consts', name: n, doc: firstParagraph(jsDocText(node, sf)) });
        }
      }
    }
  }
  return sections;
}

function iconNames() {
  const text = readFileSync(join(SRC, 'lib/icon/icons.ts'), 'utf8');
  return [...text.matchAll(/export const (zurIcon\w+): ZurIconDef = \{ name: '([\w-]+)'/g)].map((m) => ({ constName: m[1], name: m[2] }));
}

const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

export function renderCatalog(version) {
  const sections = collect();
  const lines = [];
  lines.push(`# Catálogo do Zuri ${version}`);
  lines.push('');
  lines.push('Gerado automaticamente a partir da API pública de `@juau/zuri`. Use **só** o que está aqui:');
  lines.push('seletores, entradas e saídas reais. Importe tudo de `\'@juau/zuri\'` e coloque o componente em `imports: [...]`.');
  lines.push('');
  lines.push('Convenções: entradas são `input()` (use `[nome]="valor"`), *models* aceitam two-way (`[(nome)]`),');
  lines.push('saídas são `(nome)="handler($event)"`. Controles de formulário funcionam com `ngModel`, formulários reativos');
  lines.push('e Signal Forms (`[formField]`).');
  lines.push('');
  lines.push('## Índice');
  for (const [section, s] of sections) {
    const names = s.classes.filter((c) => c.selector).map((c) => `\`${c.selector}\``);
    if (names.length) lines.push(`- **${section}**: ${names.join(', ')}`);
  }
  lines.push('');

  for (const [section, s] of sections) {
    lines.push(`## ${section}`);
    lines.push('');
    for (const c of s.classes) {
      lines.push(`### ${c.selector ? `\`${c.selector}\` — ` : ''}\`${c.name}\`${c.kind === 'Injectable' ? ' (serviço)' : ''}`);
      if (c.summary) lines.push('', c.summary);
      if (c.exportAs) lines.push('', `Referência no template: \`#ref="${c.exportAs}"\`.`);
      const rows = [
        ...c.inputs.map((i) => ['entrada', i.name, i.type, i.default, i.doc]),
        ...c.models.map((i) => ['model (two-way)', i.name, i.type, i.default, i.doc]),
        ...c.outputs.map((o) => ['saída', o.name, o.type, '', o.doc]),
      ];
      if (rows.length) {
        lines.push('', '| | Nome | Tipo | Padrão | Observação |', '|---|---|---|---|---|');
        for (const r of rows) lines.push(`| ${r.map(cell).join(' | ')} |`);
      }
      if (c.formValue) lines.push('', `Controle de formulário: valor \`${c.formValue}\` (\`ngModel\`, formulários reativos, \`[formField]\`).`);
      if (c.kind === 'Injectable' || (c.methods.length && !c.selector)) {
        const pub = c.methods.filter((m) => !m.name.startsWith('_'));
        if (pub.length) {
          lines.push('', 'Métodos:');
          for (const m of pub) lines.push(`- \`${m.signature}\`${m.doc ? ` — ${m.doc}` : ''}`);
        }
      }
      if (c.example) lines.push('', '```' + c.example.lang, c.example.code, '```');
      lines.push('');
    }
    if (s.functions.length) {
      lines.push('Funções:');
      for (const f of s.functions) lines.push(`- \`${f.signature}\`${f.doc ? ` — ${f.doc}` : ''}`);
      lines.push('');
    }
    if (s.consts.length) {
      lines.push('Constantes e tokens: ' + s.consts.map((c) => `\`${c.name}\``).join(', '));
      lines.push('');
    }
    if (s.types.length) {
      lines.push('<details><summary>Tipos</summary>', '', '```ts');
      for (const t of s.types) lines.push(t.text);
      lines.push('```', '', '</details>', '');
    }
  }

  const icons = iconNames();
  lines.push('## Ícones disponíveis');
  lines.push('');
  lines.push('Importe a constante e passe em `[icon]`: `readonly lupa = zurIconSearch;` → `<zur-icon [icon]="lupa" />`.');
  lines.push('');
  lines.push(icons.map((i) => `\`${i.constName}\` (${i.name})`).join(', '));
  lines.push('');
  return lines.join('\n');
}

export function selectorsInCatalog(md) {
  return [...md.matchAll(/^### `([^`]+)` — /gm)].map((m) => m[1]);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = resolve(process.argv[2] ?? join(ROOT, 'dist/zuri/ai/catalogo.md'));
  const version = JSON.parse(readFileSync(join(ROOT, 'projects/zuri/package.json'), 'utf8')).version;
  const md = renderCatalog(version);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, md);
  console.log(`Catálogo de IA gerado (${selectorsInCatalog(md).length} componentes, ${(md.length / 1024).toFixed(1)} KiB) em ${out}`);
}
