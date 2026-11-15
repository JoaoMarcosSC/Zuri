/**
 * Lê `tokens.css` do Zuri e gera os formatos de exportação:
 *  - `tokens.json`            tokens no formato W3C Design Tokens (claro e escuro em $extensions.mode)
 *  - `tailwind.preset.cjs`    preset do Tailwind v3 (valores apontam para `var(--zur-*)`)
 *  - `tailwind-theme.css`     `@theme` do Tailwind v4
 *
 * Os valores exportados continuam sendo `var(--zur-*)`, então o tema claro/escuro segue
 * trocando em tempo de execução. O JSON é para ferramentas (Figma, Style Dictionary).
 */

/** Tira os comentários CSS. */
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** `[{ selector, declarations: Map<nome, valor> }]` de cada bloco simples do CSS. */
export function parseBlocks(css) {
  const blocks = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(stripComments(css)))) {
    const declarations = new Map();
    const decl = /--([a-z0-9-]+)\s*:\s*([^;]+);/g;
    let d;
    while ((d = decl.exec(m[2]))) declarations.set(d[1], d[2].replace(/\s+/g, ' ').trim());
    if (declarations.size) blocks.push({ selector: m[1].trim(), declarations });
  }
  return blocks;
}

/** Tokens com o valor de cada tema: `[{ name, light, dark }]` (sem o prefixo `zur-`). */
export function parseTokens(css) {
  const blocks = parseBlocks(css);
  const light = blocks.find((b) => b.selector.includes(':root'));
  const dark = blocks.find((b) => b.selector.includes("[data-theme='dark']"));
  if (!light || !dark) throw new Error('tokens.css precisa ter o bloco :root e o [data-theme=\'dark\'].');
  const strip = (name) => name.replace(/^zur-/, '');
  return [...light.declarations].map(([name, value]) => ({
    name: strip(name),
    light: value,
    dark: dark.declarations.get(name) ?? value,
  }));
}

/** Grupo e tipo DTCG de cada token, pelo nome. */
export function classify(name, value) {
  if (name.startsWith('radius-')) return { group: 'radius', key: name.slice(7), type: 'dimension' };
  if (name.startsWith('space-')) return { group: 'space', key: name.slice(6), type: 'dimension' };
  if (name.startsWith('control-height-')) return { group: 'controlHeight', key: name.slice(15), type: 'dimension' };
  if (name.startsWith('tracking-')) return { group: 'tracking', key: name.slice(9), type: 'dimension' };
  if (name === 'font-family') return { group: 'fontFamily', key: 'base', type: 'fontFamily' };
  if (name.startsWith('font-')) return { group: 'typography', key: name.slice(5), type: undefined };
  if (name.startsWith('shadow-') || name === 'focus-ring') return { group: 'shadow', key: name.replace(/^shadow-/, ''), type: undefined };
  return { group: 'color', key: name, type: 'color' };
}

const KEBAB_TO_CAMEL = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

/** `var(--zur-x)` vira a referência `{grupo.x}` do formato W3C. */
function toAlias(value, byName) {
  const m = /^var\(--zur-([a-z0-9-]+)\)$/.exec(value);
  if (!m || !byName.has(m[1])) return value;
  const c = classify(m[1], '');
  return `{${c.group}.${KEBAB_TO_CAMEL(c.key)}}`;
}

export function buildTokensJson(tokens) {
  const byName = new Map(tokens.map((t) => [t.name, t]));
  const out = {
    $description: 'Design tokens do Zuri. $extensions.mode traz o valor de cada tema.',
  };
  for (const t of tokens) {
    const { group, key, type } = classify(t.name, t.light);
    const entry = {
      ...(type ? { $type: type } : {}),
      $value: toAlias(t.light, byName),
      $extensions: {
        css: `--zur-${t.name}`,
        mode: { light: toAlias(t.light, byName), dark: toAlias(t.dark, byName) },
      },
    };
    (out[group] ??= {})[KEBAB_TO_CAMEL(key)] = entry;
  }
  return out;
}

const q = (s) => JSON.stringify(s);

export function buildTailwindPreset(tokens) {
  const v = (name) => `var(--zur-${name})`;
  const colors = {};
  const borderRadius = {};
  const spacing = {};
  const boxShadow = {};
  let fontFamily = null;
  const fontSize = {};
  for (const t of tokens) {
    const { group, key } = classify(t.name, t.light);
    if (group === 'color') colors[key] = v(t.name);
    else if (group === 'radius') borderRadius[key] = v(t.name);
    else if (group === 'space') spacing[key] = v(t.name);
    else if (group === 'shadow' && t.name !== 'focus-ring') boxShadow[key] = v(t.name);
    else if (group === 'fontFamily') fontFamily = v(t.name);
    else if (group === 'typography') fontSize[key] = v(t.name);
  }
  void fontSize;
  const body = (o) => '{\n' + Object.entries(o).map(([k, val]) => `      ${q(k)}: ${q(val)},`).join('\n') + '\n    }';
  return `/**
 * Preset do Tailwind (v3) com os tokens do Zuri. Gerado de tokens.css — não edite.
 *
 *   // tailwind.config.js
 *   module.exports = { presets: [require('@juau/zuri/tailwind.preset.cjs')], content: [...] };
 *
 * Os valores são \`var(--zur-*)\`: o tema claro/escuro continua trocando em tempo de execução
 * (com \`data-theme="dark"\` no <html>). Como são variáveis CSS, modificadores de opacidade
 * (\`bg-primary/50\`) não funcionam; use \`bg-primary-soft\` ou o token que já tem a cor certa.
 * Para o Tailwind v4, use \`@import '@juau/zuri/tailwind-theme.css'\`.
 */
module.exports = {
  theme: {
    extend: {
      colors: ${body(colors)},
      borderRadius: ${body(borderRadius)},
      spacing: ${body(spacing)},
      boxShadow: ${body(boxShadow)},
      fontFamily: {
        sans: [${q(fontFamily ?? 'var(--zur-font-family)')}],
      },
    },
  },
};
`;
}

export function buildTailwindTheme(tokens) {
  const lines = [];
  for (const t of tokens) {
    const { group, key } = classify(t.name, t.light);
    const ref = `var(--zur-${t.name})`;
    if (group === 'color') lines.push(`  --color-${key}: ${ref};`);
    else if (group === 'radius') lines.push(`  --radius-${key}: ${ref};`);
    else if (group === 'space') lines.push(`  --spacing-${key}: ${ref};`);
    else if (group === 'shadow' && t.name !== 'focus-ring') lines.push(`  --shadow-${key}: ${ref};`);
    else if (group === 'fontFamily') lines.push(`  --font-sans: ${ref};`);
  }
  return `/* Tema do Tailwind v4 com os tokens do Zuri. Gerado de tokens.css — não edite.
   Uso (no seu CSS principal):  @import 'tailwindcss';  @import '@juau/zuri/tailwind-theme.css';
   Os valores são var(--zur-*): o tema claro/escuro troca em tempo de execução. */
@theme inline {
${lines.join('\n')}
}
`;
}
