import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { FormsModule } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import { expect, userEvent, within } from 'storybook/test';
import { ZurButton } from '../lib/button/button';
import { ZurCheckbox } from '../lib/checkbox/checkbox';
import { ZurDensityScope } from '../lib/density/density';
import { ZurInput } from '../lib/input/input';
import { ZurNumberInput } from '../lib/number-input/number-input';
import { ZurRating } from '../lib/rating/rating';
import { ZurSegmented } from '../lib/segmented/segmented';
import { ZurSelect } from '../lib/select/select';
import { ZurSlider } from '../lib/slider/slider';
import { ZurStepper, ZurStepperStep } from '../lib/stepper/stepper';
import { ZurTabs, ZurTab } from '../lib/tabs/tabs';

@Component({
  selector: 'demo-signal-form',
  imports: [FormField, JsonPipe, ZurInput, ZurSelect, ZurCheckbox, ZurNumberInput, ZurRating],
  template: `
    <div style="display:grid; gap:20px; max-width:360px">
      <zur-input label="Nome" [formField]="f.nome" />
      <zur-select label="Planta" [options]="plantas" [formField]="f.planta" />
      <zur-number-input label="Quantidade" [min]="1" [max]="10" [formField]="f.qtd" />
      <zur-rating label="Nota" [formField]="f.nota" />
      <zur-checkbox [formField]="f.presente">É para presente</zur-checkbox>
      <p style="margin:0; font:var(--zur-font-caption); color:var(--zur-body)">
        Modelo: {{ model() | json }} · válido: {{ f().valid() }}
      </p>
    </div>
  `,
})
class DemoSignalForm {
  plantas = [{ value: 'monstera', label: 'Monstera' }, { value: 'jiboia', label: 'Jiboia' }];
  readonly model = signal({ nome: 'Ana', planta: 'monstera', qtd: 2 as number | null, nota: 4, presente: false });
  readonly f = form(this.model, (p) => required(p.nome));
}

/** Mesmos controles nos três modos de formulário do Angular. */
const meta: Meta = {
  title: 'Plataforma',
  decorators: [
    moduleMetadata({
      imports: [
        FormsModule, DemoSignalForm, ZurDensityScope, ZurButton, ZurInput, ZurSelect, ZurSegmented, ZurSlider,
        ZurStepper, ZurStepperStep, ZurTabs, ZurTab, ZurCheckbox,
      ],
    }),
  ],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const painel = (titulo: string) => `
  <section style="display:grid; gap:16px; padding:20px; border:1px solid var(--zur-hairline); border-radius:14px; background:var(--zur-surface-raised)">
    <h3 style="margin:0; font:var(--zur-font-title); color:var(--zur-ink)">${titulo}</h3>
    <zur-input label="Nome do cliente" placeholder="Ana Silva" />
    <zur-select label="Planta" [options]="plantas" />
    <zur-segmented label="Visão" [options]="visoes" ngModel="a" />
    <zur-slider label="Altura (cm)" [min]="0" [max]="100" ngModel="40" />
    <div style="display:flex; gap:8px"><button zur-button>Salvar</button><button zur-button variant="secondary" size="sm">Cancelar</button></div>
  </section>`;

export const Densidade: Story = {
  render: () => ({
    props: {
      plantas: [{ value: 'a', label: 'Monstera' }, { value: 'b', label: 'Jiboia' }],
      visoes: [{ value: 'a', label: 'Grade' }, { value: 'b', label: 'Lista' }],
    },
    template: `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:24px; max-width:820px">
        <div zurDensity="comfortable">${painel('Confortável (padrão)')}</div>
        <div zurDensity>${painel('Compacta (zurDensity)')}</div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const heights = Array.from(canvasElement.querySelectorAll<HTMLInputElement>('zur-input input')).map((i) => i.getBoundingClientRect().height);
    // controle compacto é mais baixo que o confortável
    await expect(heights[1]).toBeLessThan(heights[0]);
  },
};

export const RTL: Story = {
  name: 'RTL (direita para a esquerda)',
  render: () => ({
    props: {
      plantas: [{ value: 'a', label: 'مونستيرا' }, { value: 'b', label: 'جيبويا' }],
      visoes: [{ value: 'a', label: 'شبكة' }, { value: 'b', label: 'قائمة' }],
    },
    template: `
      <div dir="rtl" style="max-width:420px">
        ${painel('طلب جديد')}
        <zur-stepper style="margin-top:24px" [index]="1">
          <zur-stepper-step label="العنوان">…</zur-stepper-step>
          <zur-stepper-step label="الدفع">الدفع بالبطاقة أو Pix.</zur-stepper-step>
          <zur-stepper-step label="المراجعة">…</zur-stepper-step>
        </zur-stepper>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const container = canvasElement.querySelector('[dir=rtl]') as HTMLElement;
    await expect(getComputedStyle(container).direction).toBe('rtl');
  },
};

export const SignalForms: Story = {
  name: 'Signal Forms ([formField])',
  render: () => ({ template: `<demo-signal-form />` }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.clear(canvas.getByRole('textbox', { name: 'Nome' }));
    await expect(canvas.getByText(/válido: false/)).toBeTruthy();
  },
};
