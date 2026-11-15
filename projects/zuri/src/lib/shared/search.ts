/** Remove acentos e caixa para comparar textos digitados ("orquidea" acha "Orquídea"). */
export function zurNormalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Diz se `query` combina com `text`: por trecho ("costela" em "Costela-de-adão")
 * ou pelas iniciais das palavras ("cda" em "Costela-de-adão").
 */
export function zurMatches(text: string, query: string): boolean {
  const q = zurNormalize(query);
  if (!q) return true;
  const t = zurNormalize(text);
  if (t.includes(q)) return true;
  const initials = t
    .split(/[\s\-_/]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('');
  return initials.startsWith(q.replace(/\s+/g, ''));
}

/** Estilo de texto só para leitores de tela, compartilhado pelos componentes. */
export const ZUR_SR_ONLY = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
`;
