/**
 * Diz se o elemento está num contexto da direita para a esquerda. Respeita o atributo
 * `dir` do ancestral mais próximo (como `<html dir="rtl">` ou um `zurThemeScope`) e,
 * sem ele, a propriedade CSS `direction`.
 */
export function zurIsRtl(el: Element): boolean {
  const attr = el.closest('[dir]')?.getAttribute('dir')?.toLowerCase();
  if (attr === 'rtl') return true;
  if (attr === 'ltr') return false;
  return el.ownerDocument.defaultView?.getComputedStyle(el).direction === 'rtl';
}

/**
 * Traduz ←/→ para "voltar/avançar" no sentido de leitura: `+1` avança, `-1` volta, `0` se a
 * tecla não for uma seta horizontal. Em RTL as setas se invertem (← avança).
 */
export function zurInlineStep(event: KeyboardEvent, el: Element): -1 | 0 | 1 {
  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return 0;
  const right = event.key === 'ArrowRight';
  return right !== zurIsRtl(el) ? 1 : -1;
}
