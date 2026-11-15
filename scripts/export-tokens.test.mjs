import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import {
  buildTailwindPreset,
  buildTailwindTheme,
  buildTokensJson,
  classify,
  parseBlocks,
  parseTokens,
} from './tokens-lib.mjs';

const css = readFileSync(new URL('../projects/zuri/src/styles/tokens.css', import.meta.url), 'utf8');
const tokens = parseTokens(css);
const byName = Object.fromEntries(tokens.map((t) => [t.name, t]));

test('lê todos os tokens do bloco claro (e nenhum fica de fora)', () => {
  const light = parseBlocks(css).find((b) => b.selector.includes(':root'));
  assert.equal(tokens.length, light.declarations.size);
  assert.ok(tokens.length >= 60, `esperava ao menos 60 tokens, veio ${tokens.length}`);
  assert.ok(new Set(tokens.map((t) => t.name)).size === tokens.length, 'nomes repetidos');
});

test('o tema escuro sobrescreve só o que muda e herda o resto', () => {
  assert.equal(byName['primary'].light, '#35d49b');
  assert.equal(byName['primary'].dark, '#3ee6a8');
  assert.equal(byName['radius-md'].light, byName['radius-md'].dark);
  assert.equal(byName['space-md'].dark, '16px');
});

test('valores em várias linhas (sombra) viram uma linha só', () => {
  assert.match(byName['shadow-float'].light, /^0 0 0 1px rgba\(0, 0, 0, 0\.02\), 0 2px 6px/);
  assert.ok(!byName['shadow-float'].light.includes('\n'));
});

test('classifica cada token no grupo certo', () => {
  assert.deepEqual(classify('radius-sm', ''), { group: 'radius', key: 'sm', type: 'dimension' });
  assert.equal(classify('space-md', '').group, 'space');
  assert.equal(classify('font-family', '').type, 'fontFamily');
  assert.equal(classify('font-body', '').group, 'typography');
  assert.equal(classify('shadow-float', '').group, 'shadow');
  assert.equal(classify('chart-1', '').group, 'color');
});

test('tokens.json: formato W3C com os dois temas e referências resolvidas', () => {
  const json = buildTokensJson(tokens);
  assert.equal(json.color.primary.$type, 'color');
  assert.equal(json.color.primary.$value, '#35d49b');
  assert.deepEqual(json.color.primary.$extensions.mode, { light: '#35d49b', dark: '#3ee6a8' });
  assert.equal(json.color.primary.$extensions.css, '--zur-primary');
  assert.equal(json.radius.md.$value, '14px');
  // var(--zur-hairline) vira referência {color.hairline}
  assert.equal(json.color.chartGrid.$value, '{color.hairline}');
  // todo token vira exatamente uma entrada
  const count = Object.entries(json).filter(([k]) => !k.startsWith('$')).reduce((n, [, g]) => n + Object.keys(g).length, 0);
  assert.equal(count, tokens.length);
});

test('preset do Tailwind v3 é CommonJS válido e aponta para var(--zur-*)', () => {
  const sandbox = { module: { exports: {} } };
  vm.runInNewContext(buildTailwindPreset(tokens), sandbox);
  const { colors, borderRadius, boxShadow, fontFamily } = sandbox.module.exports.theme.extend;
  assert.equal(colors['primary'], 'var(--zur-primary)');
  assert.equal(colors['chart-1'], 'var(--zur-chart-1)');
  assert.equal(borderRadius['md'], 'var(--zur-radius-md)');
  assert.equal(boxShadow['float'], 'var(--zur-shadow-float)');
  assert.equal(fontFamily.sans.length, 1);
  assert.equal(fontFamily.sans[0], 'var(--zur-font-family)');
  assert.equal(colors['focus-ring'], undefined);
});

test('tema do Tailwind v4 usa @theme inline com as variáveis', () => {
  const theme = buildTailwindTheme(tokens);
  assert.match(theme, /@theme inline \{/);
  assert.match(theme, /--color-primary: var\(--zur-primary\);/);
  assert.match(theme, /--radius-md: var\(--zur-radius-md\);/);
  assert.match(theme, /--font-sans: var\(--zur-font-family\);/);
});

test('a densidade compacta redefine as alturas dos controles (e não vira token de tema)', () => {
  const compact = parseBlocks(css).find((b) => b.selector.includes("[data-density='compact']"));
  assert.ok(compact, 'bloco [data-density=compact] não encontrado');
  assert.equal(compact.declarations.get('zur-control-height-lg'), '40px');
  assert.equal(compact.declarations.get('zur-control-height-md'), '36px');
  assert.equal(compact.declarations.get('zur-control-height-sm'), '28px');
  // os tokens exportados continuam sendo os confortáveis (36/48/56)
  assert.equal(byName['control-height-lg'].light, '56px');
});

// ── contraste dos pares semânticos (fundo suave + texto), usados em alert, banner, toast, badge… ──
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

for (const kind of ['success', 'warning', 'error', 'info']) {
  for (const mode of ['light', 'dark']) {
    test(`contraste AA: ${kind}-text sobre ${kind}-soft no tema ${mode === 'light' ? 'claro' : 'escuro'}`, () => {
      const fg = byName[`${kind}-text`][mode];
      const bg = byName[`${kind}-soft`][mode];
      const ratio = contrast(fg, bg);
      assert.ok(ratio >= 4.5, `${kind}: ${fg} sobre ${bg} tem ${ratio.toFixed(2)}:1 (mínimo 4,5:1)`);
    });
  }
}
