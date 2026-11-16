import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ZurChip, ZurChipGroup } from './chip/chip';
import { ZurDatePicker } from './date-picker/date-picker';
import { ZurKanban, ZurKanbanCard, ZurKanbanColumn } from './kanban/kanban';
import { ZurSegmented } from './segmented/segmented';
import { ZurSlider } from './slider/slider';
import { ZurStepper, ZurStepperStep } from './stepper/stepper';
import { ZurTree, ZurTreeNode } from './tree/tree';

/** Em RTL as setas ←→ seguem o sentido de leitura: ← avança, → volta. */
@Component({
  imports: [FormsModule, ZurChip, ZurChipGroup, ZurSlider, ZurSegmented, ZurDatePicker, ZurKanban, ZurKanbanCard, ZurStepper, ZurStepperStep, ZurTree],
  template: `
    <zur-slider label="Altura" [min]="0" [max]="100" [step]="10" [ngModel]="altura()" (ngModelChange)="altura.set($event)" />
    <zur-segmented label="Visão" [options]="visoes" [ngModel]="visao()" (ngModelChange)="visao.set($event)" />
    <zur-date-picker label="Data" [ngModel]="data()" (ngModelChange)="data.set($event)" />
    <zur-kanban [(columns)]="board"><ng-template zurKanbanCard let-item>{{ item.title }}</ng-template></zur-kanban>
    <zur-stepper [(index)]="etapa">
      <zur-stepper-step label="A">a</zur-stepper-step>
      <zur-stepper-step label="B">b</zur-stepper-step>
      <zur-stepper-step label="C">c</zur-stepper-step>
    </zur-stepper>
    <zur-tree label="Árvore" [nodes]="nodes" [(expanded)]="open" />
    <zur-chip-group label="Ambiente" mode="single" [ngModel]="ambiente()" (ngModelChange)="ambiente.set($event)">
      <zur-chip value="sala">Sala</zur-chip>
      <zur-chip value="varanda">Varanda</zur-chip>
      <zur-chip value="quarto">Quarto</zur-chip>
    </zur-chip-group>
  `,
})
class Host {
  altura = signal(50);
  visao = signal('a');
  visoes = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }, { value: 'c', label: 'C' }];
  data = signal<Date | null>(new Date(2026, 5, 15));
  board = signal<ZurKanbanColumn[]>([
    { id: 'c1', title: 'Um', items: [{ id: 'k1', title: 'Cartão' }] },
    { id: 'c2', title: 'Dois', items: [] },
  ]);
  etapa = signal(0);
  nodes: ZurTreeNode[] = [{ id: 'pai', label: 'Pai', children: [{ id: 'filho', label: 'Filho' }] }];
  open = signal<string[]>([]);
  ambiente = signal<string | null>('sala');
}

async function setup(dir: 'rtl' | 'ltr') {
  const fixture = TestBed.createComponent(Host);
  fixture.nativeElement.setAttribute('dir', dir);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const settle = async () => {
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r));
  };
  const press = async (target: Element, key: string) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    await settle();
  };
  return { fixture, el, settle, press, host: () => fixture.componentInstance };
}

for (const dir of ['ltr', 'rtl'] as const) {
  // a tecla que "avança" (aumenta, vai ao próximo) em cada direção
  const forward = dir === 'ltr' ? 'ArrowRight' : 'ArrowLeft';
  const backward = dir === 'ltr' ? 'ArrowLeft' : 'ArrowRight';

  describe(`teclado em ${dir.toUpperCase()}`, () => {
    it('slider: a seta de avançar aumenta e a de voltar diminui', async () => {
      const { el, press, host } = await setup(dir);
      const thumb = el.querySelector('zur-slider [role=slider]')!;
      await press(thumb, forward);
      expect(host().altura()).toBe(60);
      await press(thumb, backward);
      await press(thumb, backward);
      expect(host().altura()).toBe(40);
    });

    it('segmented: avançar vai à opção seguinte', async () => {
      const { el, press, host } = await setup(dir);
      const group = el.querySelector('zur-segmented')!;
      await press(group, forward);
      expect(host().visao()).toBe('b');
      await press(group, backward);
      expect(host().visao()).toBe('a');
    });

    it('calendário: avançar vai ao dia seguinte', async () => {
      const { el, press, settle } = await setup(dir);
      (el.querySelector('zur-date-picker .field') as HTMLElement).click();
      await settle();
      await settle();
      const grid = el.querySelector('zur-date-picker [role=grid]')!;
      await press(grid, forward);
      await settle();
      expect((document.activeElement as HTMLElement).getAttribute('data-date')).toBe('2026-06-16');
      await press(grid, backward);
      await press(grid, backward);
      await settle();
      expect((document.activeElement as HTMLElement).getAttribute('data-date')).toBe('2026-06-14');
    });

    it('kanban: avançar leva o cartão para a coluna seguinte', async () => {
      const { el, press, host } = await setup(dir);
      const card = el.querySelector('.card[data-id="k1"]') as HTMLElement;
      card.focus();
      await press(card, ' ');
      await press(card, forward);
      expect(host().board()[1].items.map((i) => i.id)).toEqual(['k1']);
    });

    it('stepper: avançar move o foco para a etapa seguinte', async () => {
      const { el, press } = await setup(dir);
      const heads = Array.from(el.querySelectorAll('zur-stepper .head')) as HTMLElement[];
      heads[0].focus();
      await press(el.querySelector('zur-stepper .steps')!, forward);
      expect(document.activeElement).toBe(heads[1]);
    });

    it('grupo de chips: avançar escolhe o chip seguinte e voltar o anterior', async () => {
      const { el, press, host } = await setup(dir);
      const chips = Array.from(el.querySelectorAll('zur-chip-group button.body')) as HTMLElement[];
      chips[0].focus();
      await press(chips[0], forward);
      expect(host().ambiente()).toBe('varanda');
      expect(document.activeElement).toBe(chips[1]);
      await press(chips[1], backward);
      expect(host().ambiente()).toBe('sala');
    });

    it('árvore: avançar abre o nó e voltar fecha', async () => {
      const { el, press, host } = await setup(dir);
      const pai = el.querySelector('[data-id="pai"]') as HTMLElement;
      pai.focus();
      await press(pai, forward);
      expect(host().open()).toEqual(['pai']);
      await press(pai, backward);
      expect(host().open()).toEqual([]);
    });
  });
}
