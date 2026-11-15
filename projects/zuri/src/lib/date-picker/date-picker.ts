import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ZUR_I18N } from '../i18n/i18n';
import { zurInlineStep } from '../shared/direction';
import { ZUR_SR_ONLY } from '../shared/search';
import { addDays, addMonths, compareDays, isoDay, monthGrid, sameDay, startOfDay } from './date-utils';

export type ZurDatePickerMode = 'single' | 'range';

/** Valor do modo `range`. `end` fica `null` enquanto só o início foi escolhido. */
export interface ZurDateRange {
  start: Date | null;
  end: Date | null;
}

let nextId = 0;

/**
 * Campo de data com calendário em painel. No modo `single` o valor é `Date | null`;
 * no modo `range` é `{ start, end }` — o primeiro clique marca o início, o segundo o fim
 * (como na reserva do Airbnb). Teclado na grade: setas, PageUp/PageDown (mês), Home/End
 * (semana), Enter/Espaço escolhe, Esc fecha. Nomes de mês e dia seguem o `locale` do i18n.
 *
 * ```html
 * <zur-date-picker label="Entrega" [min]="hoje" [(ngModel)]="entrega" />
 * <zur-date-picker label="Período" mode="range" [(ngModel)]="periodo" />
 * ```
 */
@Component({
  selector: 'zur-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ZurDatePicker), multi: true }],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
  template: `
    @if (label()) {
      <span class="label" [id]="id + '-label'">{{ label() }}</span>
    }
    <button
      #trigger
      type="button"
      class="field"
      [class.has-error]="!!error()"
      [class.placeholder]="!displayValue()"
      [disabled]="isDisabled()"
      aria-haspopup="dialog"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="open() ? id + '-panel' : null"
      [attr.aria-labelledby]="label() ? id + '-label ' + id + '-value' : null"
      [attr.aria-describedby]="error() ? id + '-error' : hint() ? id + '-hint' : null"
      [attr.aria-invalid]="error() ? true : null"
      (click)="toggle()"
    >
      <span [id]="id + '-value'">{{ displayValue() || placeholder() }}</span>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
    </button>

    @if (open()) {
      <div class="panel" role="dialog" [id]="id + '-panel'" [attr.aria-label]="label() || i18n.openCalendar" (keydown.escape)="close(true); $event.stopPropagation()">
        <div class="head">
          <button type="button" class="nav" [attr.aria-label]="i18n.previousMonth" (click)="shiftMonth(-1)">
            <svg class="flip" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
          </button>
          <span class="month" aria-live="polite">{{ monthTitle() }}</span>
          <button type="button" class="nav" [attr.aria-label]="i18n.nextMonth" (click)="shiftMonth(1)">
            <svg class="flip" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
          </button>
        </div>

        <table class="grid" role="grid" [attr.aria-label]="monthTitle()" (keydown)="onGridKeydown($event)">
          <thead>
            <tr>
              @for (day of weekdays(); track $index) {
                <th scope="col"><span aria-hidden="true">{{ day.short }}</span><span class="sr-only">{{ day.long }}</span></th>
              }
            </tr>
          </thead>
          <tbody>
            @for (week of weeks(); track $index) {
              <tr>
                @for (day of week; track day.getTime()) {
                  <td
                    role="gridcell"
                    [class.outside]="day.getMonth() !== viewMonth().getMonth()"
                    [class.in-range]="inRange(day)"
                    [class.range-start]="isRangeEdge(day, 'start')"
                    [class.range-end]="isRangeEdge(day, 'end')"
                    [attr.aria-selected]="isSelected(day)"
                  >
                    <button
                      type="button"
                      class="day"
                      [attr.data-date]="iso(day)"
                      [class.selected]="isSelected(day)"
                      [class.today]="isToday(day)"
                      [tabindex]="isFocusTarget(day) ? 0 : -1"
                      [disabled]="isOutOfBounds(day)"
                      [attr.aria-label]="fullDate(day)"
                      [attr.aria-current]="isToday(day) ? 'date' : null"
                      (click)="pick(day)"
                      (mouseenter)="hover.set(day)"
                      (focus)="focused.set(day)"
                    >
                      {{ day.getDate() }}
                    </button>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>

        @if (mode() === 'range') {
          <p class="range-hint" aria-live="polite">
            {{ i18n.rangeStart }}: <strong>{{ format(range().start) || '—' }}</strong>
            · {{ i18n.rangeEnd }}: <strong>{{ format(range().end) || '—' }}</strong>
          </p>
        }
      </div>
    }

    @if (error()) {
      <p class="help error" [id]="id + '-error'">{{ error() }}</p>
    } @else if (hint()) {
      <p class="help" [id]="id + '-hint'">{{ hint() }}</p>
    }
  `,
  styles: [
    ZUR_SR_ONLY,
    `
    :host {
      display: block;
      position: relative;
    }
    .label {
      display: block;
      font: var(--zur-font-caption);
      color: var(--zur-ink);
      margin-bottom: var(--zur-space-xxs);
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
      top: calc(100% + 8px);
      inset-inline-start: 0;
      z-index: 160;
      padding: var(--zur-space-md);
      background: var(--zur-surface-raised);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-md);
      box-shadow: var(--zur-shadow-float);
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--zur-space-sm);
    }
    .month {
      font: var(--zur-font-title);
      font-size: 16px;
      color: var(--zur-ink);
    }
    .nav {
      width: 36px;
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-full);
      background: var(--zur-canvas);
      color: var(--zur-ink);
      cursor: pointer;
    }
    .nav:hover {
      background: var(--zur-surface-soft);
    }
    .nav:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    .grid {
      border-collapse: collapse;
    }
    .flip {
      transform: scaleX(var(--zur-dir));
    }
    th {
      width: 40px;
      height: 32px;
      font: var(--zur-font-caption);
      color: var(--zur-muted);
      text-transform: uppercase;
    }
    td {
      padding: 1px 0;
      text-align: center;
    }
    td.in-range {
      background: var(--zur-surface-strong);
    }
    td.range-start.in-range {
      border-start-start-radius: var(--zur-radius-full);
      border-end-start-radius: var(--zur-radius-full);
    }
    td.range-end.in-range {
      border-start-end-radius: var(--zur-radius-full);
      border-end-end-radius: var(--zur-radius-full);
    }
    td.range-start.range-end {
      border-radius: var(--zur-radius-full);
    }
    .day {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: var(--zur-radius-full);
      background: transparent;
      font: var(--zur-font-body-sm);
      color: var(--zur-ink);
      cursor: pointer;
      position: relative;
    }
    td.outside .day {
      color: var(--zur-muted);
    }
    .day:hover:not(:disabled):not(.selected) {
      box-shadow: inset 0 0 0 1px var(--zur-ink);
    }
    .day:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
    .day.today {
      font-weight: 800;
    }
    .day.today::after {
      content: '';
      position: absolute;
      left: 50%;
      bottom: 6px;
      width: 4px;
      height: 4px;
      margin-left: -2px;
      border-radius: var(--zur-radius-full);
      background: var(--zur-primary-active);
    }
    .day.selected {
      background: var(--zur-ink);
      color: var(--zur-canvas);
      font-weight: 700;
    }
    .day.selected.today::after {
      background: var(--zur-canvas);
    }
    .day:disabled {
      color: var(--zur-muted);
      opacity: 0.45;
      text-decoration: line-through;
      cursor: not-allowed;
    }
    .range-hint {
      margin: var(--zur-space-sm) 0 0;
      font: var(--zur-font-caption);
      color: var(--zur-body);
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
  ],
})
export class ZurDatePicker implements ControlValueAccessor {
  protected readonly i18n = inject(ZUR_I18N);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly label = input('');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly mode = input<ZurDatePickerMode>('single');
  // aceitam `undefined` para o `[formField]` poder ligar as regras min/max do formulário
  readonly min = input<Date | null | undefined>(null);
  readonly max = input<Date | null | undefined>(null);
  readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly id = `zur-date-picker-${nextId++}`;

  readonly open = signal(false);
  protected readonly single = signal<Date | null>(null);
  protected readonly range = signal<ZurDateRange>({ start: null, end: null });
  /** Mês exibido (dia 1). */
  protected readonly viewMonth = signal(this.firstOfMonth(new Date()));
  /** Dia com o foco/roving tabindex na grade. */
  protected readonly focused = signal<Date>(startOfDay(new Date()));
  protected readonly hover = signal<Date | null>(null);
  protected readonly cvaDisabled = signal(false);

  protected onChange: (value: Date | ZurDateRange | null) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly weeks = computed(() => monthGrid(this.viewMonth()));

  protected readonly weekdays = computed(() => {
    const short = new Intl.DateTimeFormat(this.i18n.locale, { weekday: 'narrow' });
    const long = new Intl.DateTimeFormat(this.i18n.locale, { weekday: 'long' });
    // 3/jan/2021 foi um domingo.
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(2021, 0, 3 + i);
      return { short: short.format(d), long: long.format(d) };
    });
  });

  /** "Novembro de 2026": só a primeira letra maiúscula (CSS capitalize faria "De"). */
  protected readonly monthTitle = computed(() => {
    const text = new Intl.DateTimeFormat(this.i18n.locale, { month: 'long', year: 'numeric' }).format(this.viewMonth());
    return text.charAt(0).toLocaleUpperCase(this.i18n.locale) + text.slice(1);
  });

  protected readonly displayValue = computed(() => {
    if (this.mode() === 'single') return this.format(this.single());
    const { start, end } = this.range();
    if (!start) return '';
    return `${this.format(start)} – ${end ? this.format(end) : '…'}`;
  });

  format(date: Date | null): string {
    return date
      ? new Intl.DateTimeFormat(this.i18n.locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
      : '';
  }

  protected fullDate(date: Date): string {
    return new Intl.DateTimeFormat(this.i18n.locale, { dateStyle: 'full' }).format(date);
  }

  protected iso(date: Date): string {
    return isoDay(date);
  }

  protected isDisabled(): boolean {
    return this.disabled() || this.cvaDisabled();
  }

  protected isToday(date: Date): boolean {
    return sameDay(date, new Date());
  }

  protected isFocusTarget(date: Date): boolean {
    return sameDay(date, this.focused());
  }

  protected isOutOfBounds(date: Date): boolean {
    const min = this.min();
    const max = this.max();
    return (!!min && compareDays(date, min) < 0) || (!!max && compareDays(date, max) > 0);
  }

  protected isSelected(date: Date): boolean {
    if (this.mode() === 'single') return sameDay(date, this.single());
    const { start, end } = this.range();
    return sameDay(date, start) || sameDay(date, end);
  }

  /** Fim efetivo da faixa: o escolhido ou, enquanto escolhe, o dia sob o mouse. */
  private rangeEnd(): Date | null {
    const { start, end } = this.range();
    if (end) return end;
    const hover = this.hover();
    return start && hover && compareDays(hover, start) > 0 ? hover : null;
  }

  protected inRange(date: Date): boolean {
    if (this.mode() !== 'range') return false;
    const start = this.range().start;
    const end = this.rangeEnd();
    return !!start && !!end && compareDays(date, start) >= 0 && compareDays(date, end) <= 0;
  }

  protected isRangeEdge(date: Date, edge: 'start' | 'end'): boolean {
    return edge === 'start' ? sameDay(date, this.range().start) : sameDay(date, this.rangeEnd());
  }

  toggle(): void {
    if (this.open()) this.close();
    else this.show();
  }

  private show(): void {
    if (this.isDisabled()) return;
    const anchor =
      this.mode() === 'single' ? this.single() : (this.range().start ?? null);
    const target = anchor ?? this.clamp(startOfDay(new Date()));
    this.viewMonth.set(this.firstOfMonth(target));
    this.focused.set(target);
    this.hover.set(null);
    this.open.set(true);
    this.focusDay(target);
  }

  close(returnFocus = false): void {
    this.open.set(false);
    this.onTouched();
    if (returnFocus) this.host.nativeElement.querySelector<HTMLElement>('.field')?.focus();
  }

  protected shiftMonth(delta: number): void {
    this.viewMonth.update((m) => addMonths(m, delta));
    this.focused.update((d) => this.clamp(addMonths(d, delta)));
  }

  protected pick(date: Date): void {
    if (this.isOutOfBounds(date)) return;
    const day = startOfDay(date);
    this.focused.set(day);
    if (this.mode() === 'single') {
      this.single.set(day);
      this.onChange(day);
      this.close(true);
      return;
    }
    const { start, end } = this.range();
    if (!start || end || compareDays(day, start) < 0) {
      this.range.set({ start: day, end: null });
      this.onChange({ start: day, end: null });
    } else {
      const next = { start, end: day };
      this.range.set(next);
      this.onChange(next);
      this.close(true);
    }
  }

  protected onGridKeydown(event: KeyboardEvent): void {
    const current = this.focused();
    let next: Date | null = null;
    const inline = zurInlineStep(event, this.host.nativeElement);
    if (inline !== 0) {
      next = addDays(current, inline);
    } else switch (event.key) {
      case 'ArrowUp':
        next = addDays(current, -7);
        break;
      case 'ArrowDown':
        next = addDays(current, 7);
        break;
      case 'PageUp':
        next = addMonths(current, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        next = addMonths(current, event.shiftKey ? 12 : 1);
        break;
      case 'Home':
        next = addDays(current, -current.getDay());
        break;
      case 'End':
        next = addDays(current, 6 - current.getDay());
        break;
      default:
        return;
    }
    event.preventDefault();
    next = this.clamp(next);
    this.focused.set(next);
    this.hover.set(next);
    if (next.getMonth() !== this.viewMonth().getMonth() || next.getFullYear() !== this.viewMonth().getFullYear()) {
      this.viewMonth.set(this.firstOfMonth(next));
    }
    this.focusDay(next);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  /** Move o foco do navegador para o botão do dia depois da renderização. */
  private focusDay(date: Date): void {
    setTimeout(() => {
      this.host.nativeElement.querySelector<HTMLElement>(`.day[data-date="${isoDay(date)}"]`)?.focus();
    });
  }

  private clamp(date: Date): Date {
    const min = this.min();
    const max = this.max();
    if (min && compareDays(date, min) < 0) return startOfDay(min);
    if (max && compareDays(date, max) > 0) return startOfDay(max);
    return date;
  }

  private firstOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  writeValue(value: Date | ZurDateRange | null): void {
    if (value instanceof Date) {
      this.single.set(startOfDay(value));
    } else if (value && typeof value === 'object') {
      this.range.set({
        start: value.start ? startOfDay(value.start) : null,
        end: value.end ? startOfDay(value.end) : null,
      });
    } else {
      this.single.set(null);
      this.range.set({ start: null, end: null });
    }
  }
  registerOnChange(fn: (value: Date | ZurDateRange | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }
}
