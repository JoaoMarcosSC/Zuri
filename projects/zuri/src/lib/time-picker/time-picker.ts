import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZUR_I18N } from '../i18n/i18n';
import { zurInlineStep } from '../shared/direction';

let nextId = 0;

interface Column {
  id: 'hour' | 'minute' | 'period';
  label: string;
  options: { value: number; label: string; disabled: boolean; selected: boolean }[];
}

const pad = (n: number) => String(n).padStart(2, '0');

/** `'14:30'` → minutos desde meia-noite (ou `null` se inválido). */
export function zurTimeToMinutes(time: string | null | undefined): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time ?? '');
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h < 24 && min < 60 ? h * 60 + min : null;
}

/**
 * Seletor de horário: campo que abre um painel com listas de horas e minutos (e AM/PM
 * quando o idioma usa 12 horas). O valor é `'HH:mm'` (24h), em formulários ou `ngModel`.
 * Teclado: ↑↓ dentro da lista, ←→ entre listas, Enter/Espaço escolhe, Esc fecha.
 *
 * ```html
 * <zur-time-picker label="Retirada" min="09:00" max="18:00" [minuteStep]="15" [(ngModel)]="hora" />
 * ```
 */
@Component({
  selector: 'zur-time-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ZurTimePicker), multi: true }],
  host: { '(document:click)': 'onDocumentClick($event)' },
  template: `
    @if (label()) {
      <span class="label" [id]="id + '-label'">{{ label() }}</span>
    }
    <button
      type="button"
      class="field"
      [class.has-error]="!!error()"
      [class.placeholder]="!display()"
      [disabled]="isDisabled()"
      aria-haspopup="dialog"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="open() ? id + '-panel' : null"
      [attr.aria-labelledby]="label() ? id + '-label ' + id + '-value' : null"
      [attr.aria-describedby]="error() ? id + '-error' : hint() ? id + '-hint' : null"
      [attr.aria-invalid]="error() ? true : null"
      (click)="toggle()"
    >
      <span [id]="id + '-value'">{{ display() || placeholder() }}</span>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
    </button>

    @if (open()) {
      <div class="panel" role="dialog" [id]="id + '-panel'" [attr.aria-label]="label() || i18n.openTimePicker" (keydown.escape)="close(true); $event.stopPropagation()">
        @for (col of columns(); track col.id; let c = $index) {
          <div class="column" role="listbox" [attr.aria-label]="col.label" [attr.data-col]="col.id">
            @for (opt of col.options; track opt.value; let o = $index) {
              <button
                type="button"
                class="option"
                role="option"
                [class.selected]="opt.selected"
                [attr.aria-selected]="opt.selected"
                [attr.data-value]="opt.value"
                [disabled]="opt.disabled"
                [tabindex]="isTabStop(col, o) ? 0 : -1"
                (click)="pick(col.id, opt.value)"
                (keydown)="onKeydown($event, c, o)"
              >{{ opt.label }}</button>
            }
          </div>
        }
      </div>
    }

    @if (error()) {
      <p class="help error" [id]="id + '-error'">{{ error() }}</p>
    } @else if (hint()) {
      <p class="help" [id]="id + '-hint'">{{ hint() }}</p>
    }
  `,
  styles: `
    :host {
      display: block;
      position: relative;
    }
    .label {
      display: block;
      font: var(--zur-font-caption);
      color: var(--zur-ink);
      margin-block-end: var(--zur-space-xxs);
    }
    .field {
      width: 100%;
      box-sizing: border-box;
      height: var(--zur-control-height-lg);
      padding: 0 var(--zur-space-md);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--zur-space-sm);
      font: var(--zur-font-body);
      font-variant-numeric: tabular-nums;
      color: var(--zur-ink);
      background: var(--zur-canvas);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-sm);
      text-align: start;
      cursor: pointer;
    }
    .field.placeholder {
      color: var(--zur-muted);
    }
    .field svg {
      color: var(--zur-muted);
      flex-shrink: 0;
    }
    .field:focus-visible,
    .field[aria-expanded='true'] {
      outline: none;
      border: 2px solid var(--zur-ink);
      padding: 0 calc(var(--zur-space-md) - 1px);
    }
    .field:disabled {
      background: var(--zur-surface-soft);
      color: var(--zur-muted);
      cursor: not-allowed;
    }
    .field.has-error {
      border-color: var(--zur-error);
    }
    .panel {
      position: absolute;
      inset-block-start: calc(100% + 8px);
      inset-inline-start: 0;
      z-index: 160;
      display: flex;
      gap: var(--zur-space-xs);
      padding: var(--zur-space-sm);
      background: var(--zur-surface-raised);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-md);
      box-shadow: var(--zur-shadow-float);
    }
    .column {
      display: flex;
      flex-direction: column;
      gap: 2px;
      width: 64px;
      max-height: 232px;
      overflow-y: auto;
      scrollbar-width: thin;
    }
    .option {
      height: 40px;
      flex-shrink: 0;
      border: none;
      border-radius: var(--zur-radius-sm);
      background: transparent;
      font: var(--zur-font-body-sm);
      font-variant-numeric: tabular-nums;
      color: var(--zur-ink);
      cursor: pointer;
    }
    .option:hover:not(:disabled):not(.selected) {
      background: var(--zur-surface-soft);
    }
    .option.selected {
      background: var(--zur-ink);
      color: var(--zur-canvas);
      font-weight: 700;
    }
    .option:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    .option:disabled {
      color: var(--zur-muted);
      opacity: 0.45;
      text-decoration: line-through;
      cursor: not-allowed;
    }
    .help {
      margin: var(--zur-space-xxs) 0 0;
      font: var(--zur-font-caption);
      color: var(--zur-muted);
    }
    .help.error {
      color: var(--zur-error-text);
    }
  `,
})
export class ZurTimePicker implements ControlValueAccessor {
  protected readonly i18n = inject(ZUR_I18N);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');
  /** Intervalo entre os minutos listados (padrão 5). */
  readonly minuteStep = input(5, { transform: numberAttribute });
  /** Menor e maior horário aceitos, em `'HH:mm'`. */
  // aceitam `undefined` para o `[formField]` poder ligar as regras min/max do formulário
  readonly min = input<string | null | undefined>(null);
  readonly max = input<string | null | undefined>(null);
  /** `null` = decide pelo idioma (en-US usa 12h, pt-BR usa 24h). */
  readonly hour12 = input<boolean | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly id = `zur-time-picker-${nextId++}`;
  readonly open = signal(false);
  private readonly hour = signal<number | null>(null);
  private readonly minute = signal<number | null>(null);
  protected readonly cvaDisabled = signal(false);

  protected onChange: (value: string | null) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly is12h = computed(
    () =>
      this.hour12() ??
      new Intl.DateTimeFormat(this.i18n.locale, { hour: 'numeric' }).resolvedOptions().hour12 ??
      false,
  );

  /** Valor no formato do formulário, ou `null` enquanto incompleto. */
  readonly value = computed(() =>
    this.hour() !== null && this.minute() !== null ? `${pad(this.hour()!)}:${pad(this.minute()!)}` : null,
  );

  protected readonly display = computed(() => {
    if (this.hour() === null || this.minute() === null) return '';
    return new Intl.DateTimeFormat(this.i18n.locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: this.is12h(),
    }).format(new Date(2000, 0, 1, this.hour()!, this.minute()!));
  });

  private inRange(hour: number, minute: number): boolean {
    const t = hour * 60 + minute;
    const min = zurTimeToMinutes(this.min());
    const max = zurTimeToMinutes(this.max());
    return (min === null || t >= min) && (max === null || t <= max);
  }

  protected readonly columns = computed<Column[]>(() => {
    const h = this.hour();
    const m = this.minute();
    const step = Math.max(1, this.minuteStep());
    const minutes = Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step);
    const twelve = this.is12h();
    const pm = (h ?? 0) >= 12;
    const hours = twelve ? Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i)) : Array.from({ length: 24 }, (_, i) => i);
    const to24 = (display: number) => (twelve ? (display % 12) + (pm ? 12 : 0) : display);
    const anyMinuteOk = (hour24: number) => minutes.some((mm) => this.inRange(hour24, mm));
    const cols: Column[] = [
      {
        id: 'hour',
        label: this.i18n.hours,
        options: hours.map((v) => ({
          value: v,
          label: twelve ? String(v) : pad(v),
          disabled: !anyMinuteOk(to24(v)),
          selected: h !== null && (twelve ? (h % 12 || 12) === v : h === v),
        })),
      },
      {
        id: 'minute',
        label: this.i18n.minutes,
        options: minutes.map((v) => ({
          value: v,
          label: pad(v),
          disabled: !this.inRange(h ?? 0, v) && h !== null,
          selected: m === v,
        })),
      },
    ];
    if (twelve) {
      const parts = new Intl.DateTimeFormat(this.i18n.locale, { hour: 'numeric', hour12: true });
      const label = (hour: number) => parts.formatToParts(new Date(2000, 0, 1, hour)).find((p) => p.type === 'dayPeriod')?.value ?? '';
      cols.push({
        id: 'period',
        label: 'AM/PM',
        options: [
          { value: 0, label: label(9), disabled: false, selected: h !== null && !pm },
          { value: 1, label: label(15), disabled: false, selected: h !== null && pm },
        ],
      });
    }
    return cols;
  });

  protected isDisabled(): boolean {
    return this.disabled() || this.cvaDisabled();
  }

  /** O item escolhido (ou o primeiro) de cada lista recebe o Tab. */
  protected isTabStop(col: Column, index: number): boolean {
    const selected = col.options.findIndex((o) => o.selected);
    return selected >= 0 ? index === selected : index === col.options.findIndex((o) => !o.disabled);
  }

  toggle(): void {
    if (this.open()) this.close();
    else this.show();
  }

  private show(): void {
    if (this.isDisabled()) return;
    this.open.set(true);
    setTimeout(() => {
      const target =
        this.host.nativeElement.querySelector<HTMLElement>('[data-col="hour"] .option[tabindex="0"]') ??
        this.host.nativeElement.querySelector<HTMLElement>('.option');
      target?.focus();
    });
  }

  close(returnFocus = false): void {
    this.open.set(false);
    this.onTouched();
    if (returnFocus) this.host.nativeElement.querySelector<HTMLElement>('.field')?.focus();
  }

  protected pick(column: Column['id'], value: number): void {
    let hour = this.hour();
    let minute = this.minute();
    const twelve = this.is12h();
    const pm = (hour ?? 0) >= 12;
    if (column === 'hour') {
      hour = twelve ? (value % 12) + (pm ? 12 : 0) : value;
      if (minute === null) minute = this.firstValidMinute(hour);
      else if (!this.inRange(hour, minute)) minute = this.firstValidMinute(hour);
    } else if (column === 'minute') {
      minute = value;
      if (hour === null) hour = this.firstValidHour(value);
    } else {
      const base = hour === null ? 0 : hour % 12;
      hour = base + (value === 1 ? 12 : 0);
      if (minute === null) minute = 0;
    }
    this.hour.set(hour);
    this.minute.set(minute);
    this.onChange(this.value());
    if (column === 'minute') this.close(true);
  }

  private firstValidMinute(hour: number): number {
    const step = Math.max(1, this.minuteStep());
    for (let m = 0; m < 60; m += step) if (this.inRange(hour, m)) return m;
    return 0;
  }

  private firstValidHour(minute: number): number {
    for (let h = 0; h < 24; h++) if (this.inRange(h, minute)) return h;
    return 0;
  }

  protected onKeydown(event: KeyboardEvent, c: number, o: number): void {
    const cols = this.columns();
    const root = this.host.nativeElement;
    const focusOption = (col: number, opt: number) => {
      const buttons = root.querySelectorAll<HTMLElement>(`[data-col="${cols[col].id}"] .option`);
      let i = Math.max(0, Math.min(opt, buttons.length - 1));
      // pula opções desabilitadas
      const dir = opt >= o || col !== c ? 1 : -1;
      while (buttons[i]?.hasAttribute('disabled') && i + dir >= 0 && i + dir < buttons.length) i += dir;
      buttons[i]?.focus();
    };
    const step = zurInlineStep(event, root);
    if (step !== 0) {
      event.preventDefault();
      const next = c + step;
      if (next >= 0 && next < cols.length) focusOption(next, Math.max(0, cols[next].options.findIndex((x) => x.selected)));
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusOption(c, o + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusOption(c, o - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusOption(c, 0);
        break;
      case 'End':
        event.preventDefault();
        focusOption(c, cols[c].options.length - 1);
        break;
    }
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) this.close();
  }

  writeValue(value: string | null): void {
    const t = zurTimeToMinutes(value);
    this.hour.set(t === null ? null : Math.floor(t / 60));
    this.minute.set(t === null ? null : t % 60);
  }
  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
