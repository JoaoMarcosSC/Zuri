import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideZuriI18n } from '../i18n/i18n';
import { ZurDatePicker, ZurDateRange } from './date-picker';
import { addMonths, monthGrid } from './date-utils';

@Component({
  imports: [ZurDatePicker, ReactiveFormsModule],
  template: `
    <zur-date-picker label="Entrega" [min]="min" [formControl]="single" />
    <zur-date-picker label="Período" mode="range" [formControl]="range" />
  `,
})
class Host {
  min = new Date(2026, 2, 10);
  single = new FormControl<Date | null>(new Date(2026, 2, 15));
  range = new FormControl<ZurDateRange | null>(null);
}

const tick = () => new Promise((r) => setTimeout(r));

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const [singleEl, rangeEl] = Array.from(el.querySelectorAll('zur-date-picker')) as HTMLElement[];
  const open = async (host: HTMLElement) => {
    (host.querySelector('.field') as HTMLButtonElement).click();
    await fixture.whenStable();
    await tick();
  };
  const day = (host: HTMLElement, iso: string) => host.querySelector(`.day[data-date="${iso}"]`) as HTMLButtonElement;
  return { fixture, singleEl, rangeEl, open, day };
}

describe('date-utils', () => {
  it('addMonths limita ao fim do mês', () => {
    expect(addMonths(new Date(2026, 0, 31), 1).getDate()).toBe(28);
  });
  it('monthGrid tem 6 semanas começando no domingo', () => {
    const grid = monthGrid(new Date(2026, 2, 1));
    expect(grid.length).toBe(6);
    expect(grid[0][0].getDay()).toBe(0);
  });
});

describe('ZurDatePicker', () => {
  it('mostra a data formatada no locale e abre o calendário no mês do valor', async () => {
    const { singleEl, open } = await setup();
    const field = singleEl.querySelector('.field')!;
    expect(field.textContent).toContain('15/03/2026');
    await open(singleEl);
    expect(field.getAttribute('aria-expanded')).toBe('true');
    expect(singleEl.querySelector('.month')?.textContent?.trim()).toBe('Março de 2026');
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-03-15');
  });

  it('desabilita dias antes do mínimo e escolhe pelo clique', async () => {
    const { fixture, singleEl, open, day } = await setup();
    await open(singleEl);
    expect(day(singleEl, '2026-03-09').disabled).toBe(true);
    day(singleEl, '2026-03-20').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.single.value).toEqual(new Date(2026, 2, 20));
    expect(singleEl.querySelector('.panel')).toBeNull();
  });

  it('navega pelo teclado e escolhe com Enter', async () => {
    const { fixture, singleEl, open } = await setup();
    await open(singleEl);
    const grid = singleEl.querySelector('[role=grid]')!;
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();
    await tick();
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-03-22');
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true }));
    await fixture.whenStable();
    await tick();
    expect(singleEl.querySelector('.month')?.textContent?.trim()).toBe('Abril de 2026');
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-04-22');
  });

  it('modo range: primeiro clique é o início, segundo o fim', async () => {
    const { fixture, rangeEl, open, day } = await setup();
    await open(rangeEl);
    const today = new Date();
    const iso = (d: number) =>
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    day(rangeEl, iso(10)).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.range.value?.end).toBeNull();
    day(rangeEl, iso(14)).click();
    await fixture.whenStable();
    const v = fixture.componentInstance.range.value!;
    expect(v.start?.getDate()).toBe(10);
    expect(v.end?.getDate()).toBe(14);
    expect(rangeEl.querySelector('.field')?.textContent).toContain('–');
  });

  it('usa o locale do i18n', async () => {
    TestBed.configureTestingModule({ providers: [provideZuriI18n('en')] });
    const { singleEl } = await setup();
    expect(singleEl.querySelector('.field')?.textContent).toContain('03/15/2026');
  });
});
