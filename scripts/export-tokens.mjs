#!/usr/bin/env node
/**
 * Gera `tokens.json`, `tailwind.preset.cjs` e `tailwind-theme.css` em `dist/zuri/`
 * a partir de `projects/zuri/src/styles/tokens.css`. Rode depois de `ng build zuri`
 * (o `npm run build:lib` já faz isso).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTailwindPreset, buildTailwindTheme, buildTokensJson, parseTokens } from './tokens-lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'projects/zuri/src/styles/tokens.css');
const outDir = process.argv[2] ? resolve(process.argv[2]) : join(root, 'dist/zuri');

const tokens = parseTokens(readFileSync(source, 'utf8'));
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'tokens.json'), JSON.stringify(buildTokensJson(tokens), null, 2) + '\n');
writeFileSync(join(outDir, 'tailwind.preset.cjs'), buildTailwindPreset(tokens));
writeFileSync(join(outDir, 'tailwind-theme.css'), buildTailwindTheme(tokens));
console.log(`Tokens exportados (${tokens.length}) em ${outDir}: tokens.json, tailwind.preset.cjs, tailwind-theme.css`);
