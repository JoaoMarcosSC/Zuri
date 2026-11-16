import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurCodeSnippet } from './code-snippet';

@Component({
  imports: [ZurCodeSnippet],
  template: `<zur-code-snippet language="bash" code="npm install @juau/zuri" />`,
})
class Host {}

async function setup(writeText: (t: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const copy = el.querySelector('.copy') as HTMLButtonElement;
  const settle = async () => {
    await new Promise((r) => setTimeout(r, 5));
    await fixture.whenStable();
  };
  return { el, copy, settle };
}

describe('ZurCodeSnippet', () => {
  it('mostra o código em LTR com a linguagem e um grupo rotulado', async () => {
    const { el } = await setup(async () => {});
    expect(el.querySelector('code')?.textContent).toBe('npm install @juau/zuri');
    expect(el.querySelector('pre')?.getAttribute('dir')).toBe('ltr');
    expect(el.querySelector('pre')?.getAttribute('tabindex')).toBe('0');
    expect(el.querySelector('zur-code-snippet')?.getAttribute('aria-label')).toBe('bash');
    expect(el.querySelector('.language')?.textContent).toBe('bash');
  });

  it('copia, troca o botão para "Copiado" e anuncia', async () => {
    const written: string[] = [];
    const { el, copy, settle } = await setup(async (t) => void written.push(t));
    expect(copy.textContent).toContain('Copiar');
    copy.click();
    await settle();
    expect(written).toEqual(['npm install @juau/zuri']);
    expect(copy.textContent).toContain('Copiado');
    expect(el.querySelector('[aria-live=polite]')?.textContent).toBe('Copiado');
    expect(getComputedStyle(el.querySelector('[aria-live=polite]')!).position).toBe('absolute'); // não duplica "Copiado" na tela
  });

  it('se a cópia falha, avisa em vez de fingir que copiou', async () => {
    const { el, copy, settle } = await setup(() => Promise.reject(new Error('negado')));
    copy.click();
    await settle();
    expect(copy.textContent).toContain('Copiar');
    expect(el.querySelector('[aria-live=polite]')?.textContent).toBe('Não foi possível copiar');
  });
});
