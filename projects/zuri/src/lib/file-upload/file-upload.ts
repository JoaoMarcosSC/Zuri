import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { ZUR_I18N } from '../i18n/i18n';
import { ZurProgress } from '../progress/progress';
import { ZUR_SR_ONLY } from '../shared/search';

export type ZurUploadStatus = 'pending' | 'uploading' | 'done' | 'error';

/** Um arquivo na lista do `zur-file-upload`. Atualize `progress`/`status` de fora. */
export interface ZurUploadFile {
  id: string;
  file: File;
  /** 0–100 enquanto envia; `null` esconde a barra. */
  progress: number | null;
  status: ZurUploadStatus;
  error?: string;
}

let nextId = 0;
let nextFileId = 0;

/** Formata bytes em B, KB ou MB no locale informado. */
export function zurFormatBytes(bytes: number, locale = 'pt-BR'): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  const digits = unit === 0 || value >= 10 ? 0 : 1;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value)} ${units[unit]}`;
}

/** Confere um arquivo contra uma lista no formato do atributo `accept` (`.pdf,image/*`). */
export function zurAcceptsFile(file: File, accept: string): boolean {
  const rules = accept
    .split(',')
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean);
  if (rules.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule);
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
}

/**
 * Área de envio de arquivos: arrastar e soltar ou escolher no computador, com
 * validação de tipo (`accept`) e tamanho (`maxSize`, em bytes). Os arquivos aceitos
 * entram em `files` (two-way) e saem em `filesAdded`; o componente não faz o envio —
 * quem usa atualiza `progress` e `status` de cada item.
 *
 * ```html
 * <zur-file-upload label="Fotos da planta" accept="image/*" [maxSize]="5_000_000"
 *   multiple [(files)]="fotos" (filesAdded)="enviar($event)" />
 * ```
 */
@Component({
  selector: 'zur-file-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZurProgress],
  template: `
    @if (label()) {
      <span class="label" [id]="id + '-label'">{{ label() }}</span>
    }
    <div
      class="drop"
      [class.dragging]="dragging()"
      [class.disabled]="disabled()"
      (dragenter)="onDragOver($event)"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>
      <p class="drop-text">
        {{ i18n.dropFiles }}
        <button
          type="button"
          class="browse"
          [disabled]="disabled()"
          [attr.aria-describedby]="hint() ? id + '-hint' : null"
          [attr.aria-labelledby]="label() ? id + '-label ' + id + '-browse' : null"
          [id]="id + '-browse'"
          (click)="fileInput.click()"
        >{{ i18n.browseFiles }}</button>
      </p>
      @if (hint()) {
        <p class="hint" [id]="id + '-hint'">{{ hint() }}</p>
      }
      <input
        #fileInput
        type="file"
        class="sr-only"
        tabindex="-1"
        aria-hidden="true"
        [accept]="accept()"
        [multiple]="multiple()"
        [disabled]="disabled()"
        (change)="onPick($event)"
      />
    </div>

    @if (rejected().length) {
      <ul class="rejected" role="alert">
        @for (msg of rejected(); track $index) {
          <li>{{ msg }}</li>
        }
      </ul>
    }

    @if (files().length) {
      <ul class="files">
        @for (item of files(); track item.id) {
          <li class="file" [attr.data-status]="item.status">
            <span class="icon" aria-hidden="true">
              @if (item.status === 'done') {
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7" /></svg>
              } @else if (item.status === 'error') {
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 7v6M12 17v.01" /></svg>
              } @else {
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" /><path d="M14 3v5h5" /></svg>
              }
            </span>
            <div class="meta">
              <span class="name">{{ item.file.name }}</span>
              <span class="size">{{ size(item.file.size) }}</span>
              @if (item.error) {
                <span class="error">{{ item.error }}</span>
              }
              @if (item.progress !== null && item.status === 'uploading') {
                <zur-progress size="sm" [value]="item.progress" [label]="item.file.name" />
              }
            </div>
            <button
              type="button"
              class="remove"
              [attr.aria-label]="i18n.removeFile(item.file.name)"
              (click)="remove(item)"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </li>
        }
      </ul>
    }
  `,
  styles: [
    ZUR_SR_ONLY,
    `
    :host {
      display: block;
    }
    .label {
      display: block;
      font: var(--zur-font-caption);
      color: var(--zur-ink);
      margin-bottom: var(--zur-space-xxs);
    }
    .drop {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--zur-space-xs);
      padding: var(--zur-space-xl) var(--zur-space-lg);
      text-align: center;
      color: var(--zur-muted);
      background: var(--zur-surface-soft);
      border: 2px dashed var(--zur-hairline);
      border-radius: var(--zur-radius-md);
      transition: border-color 120ms ease, background-color 120ms ease;
    }
    .drop.dragging {
      border-color: var(--zur-primary);
      background: var(--zur-primary-soft);
      color: var(--zur-on-primary-soft);
    }
    .drop.disabled {
      opacity: 0.45;
    }
    .drop-text {
      margin: 0;
      font: var(--zur-font-body);
      color: var(--zur-body);
    }
    .browse {
      padding: 0;
      border: none;
      background: none;
      font: inherit;
      font-weight: 700;
      color: var(--zur-ink);
      text-decoration: underline;
      text-underline-offset: 3px;
      cursor: pointer;
    }
    .browse:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
      border-radius: var(--zur-radius-xs);
    }
    .browse:disabled {
      cursor: not-allowed;
    }
    .hint {
      margin: 0;
      font: var(--zur-font-caption);
      color: var(--zur-muted);
    }
    .rejected {
      margin: var(--zur-space-sm) 0 0;
      padding: 0;
      list-style: none;
      font: var(--zur-font-caption);
      color: var(--zur-error-text);
    }
    .files {
      display: grid;
      gap: var(--zur-space-xs);
      margin: var(--zur-space-md) 0 0;
      padding: 0;
      list-style: none;
    }
    .file {
      display: flex;
      align-items: center;
      gap: var(--zur-space-sm);
      padding: var(--zur-space-sm) var(--zur-space-md);
      background: var(--zur-surface-raised);
      border: 1px solid var(--zur-hairline);
      border-radius: var(--zur-radius-md);
    }
    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      border-radius: var(--zur-radius-sm);
      background: var(--zur-surface-strong);
      color: var(--zur-body);
    }
    .file[data-status='done'] .icon {
      background: var(--zur-success-soft);
      color: var(--zur-success-text);
    }
    .file[data-status='error'] .icon {
      background: var(--zur-error-soft);
      color: var(--zur-error-text);
    }
    .meta {
      display: grid;
      gap: 2px;
      flex: 1;
      min-width: 0;
    }
    .name {
      font: var(--zur-font-body-sm);
      font-weight: 600;
      color: var(--zur-ink);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .size {
      font: var(--zur-font-caption);
      color: var(--zur-muted);
    }
    .error {
      font: var(--zur-font-caption);
      color: var(--zur-error-text);
    }
    .meta zur-progress {
      margin-top: 4px;
    }
    .remove {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: var(--zur-radius-full);
      background: transparent;
      color: var(--zur-muted);
      cursor: pointer;
    }
    .remove:hover {
      background: var(--zur-surface-strong);
      color: var(--zur-ink);
    }
    .remove:focus-visible {
      outline: none;
      box-shadow: var(--zur-focus-ring);
    }
  `,
  ],
})
export class ZurFileUpload {
  protected readonly i18n = inject(ZUR_I18N);

  readonly label = input('');
  readonly hint = input('');
  /** Mesmo formato do atributo `accept` do input: `.pdf,image/*`. */
  readonly accept = input('');
  /** Tamanho máximo por arquivo, em bytes. `0` = sem limite. */
  readonly maxSize = input(0, { transform: numberAttribute });
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Lista de arquivos aceitos (two-way). */
  readonly files = model<ZurUploadFile[]>([]);
  /** Arquivos que acabaram de ser aceitos. */
  readonly filesAdded = output<ZurUploadFile[]>();
  readonly fileRemoved = output<ZurUploadFile>();

  protected readonly id = `zur-file-upload-${nextId++}`;
  protected readonly dragging = signal(false);
  protected readonly rejected = signal<string[]>([]);

  protected size(bytes: number): string {
    return zurFormatBytes(bytes, this.i18n.locale);
  }

  /** Valida e adiciona arquivos — também pode ser chamado de fora. */
  addFiles(list: FileList | File[]): void {
    if (this.disabled()) return;
    let incoming = Array.from(list);
    if (!this.multiple()) incoming = incoming.slice(0, 1);
    const rejected: string[] = [];
    const accepted: ZurUploadFile[] = [];
    for (const file of incoming) {
      if (this.accept() && !zurAcceptsFile(file, this.accept())) {
        rejected.push(this.i18n.fileTypeNotAllowed(file.name));
      } else if (this.maxSize() > 0 && file.size > this.maxSize()) {
        rejected.push(this.i18n.fileTooLarge(file.name, this.size(this.maxSize())));
      } else {
        accepted.push({ id: `zur-file-${nextFileId++}`, file, progress: null, status: 'pending' });
      }
    }
    this.rejected.set(rejected);
    if (accepted.length) {
      this.files.update((current) => (this.multiple() ? [...current, ...accepted] : accepted));
      this.filesAdded.emit(accepted);
    }
  }

  remove(item: ZurUploadFile): void {
    this.files.update((current) => current.filter((f) => f.id !== item.id));
    this.fileRemoved.emit(item);
  }

  protected onPick(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.addFiles(input.files);
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    const related = event.relatedTarget as Node | null;
    if (!related || !(event.currentTarget as HTMLElement).contains(related)) {
      this.dragging.set(false);
    }
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    if (event.dataTransfer?.files) this.addFiles(event.dataTransfer.files);
  }
}
