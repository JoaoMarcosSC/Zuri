import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurIcon } from './icon';
import { ZUR_ICON_CATALOG, zurIconChevronEnd, zurIconSearch } from './icons';

@Component({
  imports: [ZurIcon],
  template: `
    <zur-icon id="deco" [icon]="lupa" />
    <zur-icon id="nome" [icon]="lupa" label="Buscar" [size]="24" />
    <zur-icon id="seta" [icon]="seta" />
  `,
})
class Host {
  lupa = zurIconSearch;
  seta = zurIconChevronEnd;
}

describe('ZurIcon', () => {
  it('é decorativo sem label e vira imagem com label', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const deco = root.querySelector('#deco') as HTMLElement;
    const nome = root.querySelector('#nome') as HTMLElement;
    expect(deco.getAttribute('aria-hidden')).toBe('true');
    expect(deco.getAttribute('role')).toBeNull();
    expect(nome.getAttribute('role')).toBe('img');
    expect(nome.getAttribute('aria-label')).toBe('Buscar');
    expect(nome.getAttribute('aria-hidden')).toBeNull();
    expect(nome.querySelector('svg')?.getAttribute('width')).toBe('24');
    expect(nome.querySelector('path')?.getAttribute('d')).toBe(zurIconSearch.d);
  });

  it('marca só os ícones direcionais para espelhar em RTL', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('#seta')?.hasAttribute('data-mirror')).toBe(true);
    expect(root.querySelector('#deco')?.hasAttribute('data-mirror')).toBe(false);
  });
});

describe('catálogo de ícones', () => {
  it('tem nomes únicos em kebab-case e caminhos não vazios', () => {
    const names = ZUR_ICON_CATALOG.map((i) => i.name);
    expect(new Set(names).size).toBe(names.length);
    for (const icon of ZUR_ICON_CATALOG) {
      expect(icon.name).toMatch(/^[a-z]+(-[a-z]+)*$/);
      expect(icon.d.length).toBeGreaterThan(5);
      expect(icon.d).toMatch(/^M/);
    }
  });

  it('espelha só setas, chevrons, link externo e desfazer', () => {
    const mirrored = ZUR_ICON_CATALOG.filter((i) => i.mirror).map((i) => i.name).sort();
    expect(mirrored).toEqual(['chevron-end', 'chevron-start', 'external-link', 'undo']);
  });
});
