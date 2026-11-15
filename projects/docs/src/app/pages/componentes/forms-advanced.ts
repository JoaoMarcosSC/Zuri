import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ZurChips,
  ZurCombobox,
  ZurComboboxOption,
  ZurDatePicker,
  ZurDateRange,
  ZurFileUpload,
  ZurSegmented,
  ZurSlider,
  ZurUploadFile,
} from '@juau/zuri';
import { CodeBlock } from '../../shared/code-block/code-block';

/** Seções de Combobox, Date picker, Upload, Chips, Slider e Segmented da página Componentes. */
@Component({
  selector: 'docs-forms-advanced',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CodeBlock, ZurCombobox, ZurDatePicker, ZurFileUpload, ZurChips, ZurSlider, ZurSegmented],
  templateUrl: './forms-advanced.html',
  styleUrl: './componentes.css',
  styles: `
    :host {
      max-width: none;
      margin: 0;
    }
    .readout {
      margin: var(--zur-space-sm) 0 0;
      font: var(--zur-font-caption);
      color: var(--zur-muted);
    }
  `,
})
export class FormsAdvanced {
  private readonly destroyRef = inject(DestroyRef);
  private readonly timers = new Set<ReturnType<typeof setInterval>>();

  constructor() {
    this.destroyRef.onDestroy(() => this.timers.forEach(clearInterval));
  }

  protected readonly plantas: ZurComboboxOption[] = [
    { value: 'jiboia', label: 'Jiboia', description: 'Meia-sombra · fácil' },
    { value: 'costela', label: 'Costela-de-adão', description: 'Luz indireta · média' },
    { value: 'orquidea', label: 'Orquídea', description: 'Luz filtrada · exigente' },
    { value: 'zamioculca', label: 'Zamioculca', description: 'Pouca luz · muito fácil' },
    { value: 'espada', label: 'Espada-de-são-jorge', description: 'Qualquer luz · muito fácil' },
    { value: 'calathea', label: 'Calathea', description: 'Sombra · exigente' },
  ];
  protected readonly planta = signal<string | null>('costela');

  protected readonly hoje = new Date();
  protected readonly entrega = signal<Date | null>(null);
  protected readonly ferias = signal<ZurDateRange | null>(null);

  protected readonly fotos = signal<ZurUploadFile[]>([]);

  protected readonly ambientes = signal<string[]>(['Sala', 'Varanda']);
  protected readonly altura = signal(60);
  protected readonly preco = signal<[number, number]>([40, 260]);
  protected readonly reais = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  protected readonly visao = signal('grade');
  protected readonly visoes = [
    { value: 'grade', label: 'Grade' },
    { value: 'lista', label: 'Lista' },
    { value: 'mapa', label: 'Mapa' },
  ];

  protected formatRange(range: ZurDateRange | null): string {
    const f = (d: Date | null) => (d ? d.toLocaleDateString('pt-BR') : '—');
    return range ? `${f(range.start)} até ${f(range.end)}` : 'nenhum';
  }

  /** Simula o envio: o componente só mostra o progresso que a aplicação informa. */
  protected simularEnvio(novos: ZurUploadFile[]): void {
    for (const item of novos) {
      let progress = 0;
      const timer = setInterval(() => {
        progress = Math.min(100, progress + 8 + Math.round(Math.random() * 14));
        const done = progress >= 100;
        this.fotos.update((list) =>
          list.map((f): ZurUploadFile => (f.id === item.id ? { ...f, progress, status: done ? 'done' : 'uploading' } : f)),
        );
        if (done) {
          clearInterval(timer);
          this.timers.delete(timer);
        }
      }, 250);
      this.timers.add(timer);
    }
  }

  protected readonly codeCombobox = `<zur-combobox
  label="Planta"
  placeholder="Busque pelo nome"
  [options]="plantas"
  [(ngModel)]="planta"
/>

// plantas: ZurComboboxOption[] = [
//   { value: 'jiboia', label: 'Jiboia', description: 'Meia-sombra · fácil' }, …
// ]`;

  protected readonly codeDatePicker = `<zur-date-picker label="Entrega" [min]="hoje" [(ngModel)]="entrega" />

<zur-date-picker label="Férias" mode="range" [(ngModel)]="ferias" />
// ferias: ZurDateRange = { start: Date | null, end: Date | null }`;

  protected readonly codeFileUpload = `<zur-file-upload
  label="Fotos da sua planta"
  accept="image/*,.pdf"
  [maxSize]="5_242_880"
  multiple
  [(files)]="fotos"
  (filesAdded)="enviar($event)"
/>

// O componente não faz HTTP: atualize progress/status de cada item.
fotos.update(list => list.map(f => f.id === id ? { ...f, progress: 60, status: 'uploading' } : f));`;

  protected readonly codeChips = `<zur-chips label="Ambientes" placeholder="Digite e tecle Enter" [max]="6" [(ngModel)]="ambientes" />`;

  protected readonly codeSlider = `<zur-slider label="Altura máxima (cm)" [min]="10" [max]="200" [step]="5" [(ngModel)]="altura" />

<zur-slider label="Faixa de preço" range [min]="0" [max]="500" [step]="10"
  [format]="reais" [(ngModel)]="preco" />   <!-- preco: [40, 260] -->`;

  protected readonly codeSegmented = `<zur-segmented label="Visualização" [options]="visoes" [(ngModel)]="visao" />`;
}
