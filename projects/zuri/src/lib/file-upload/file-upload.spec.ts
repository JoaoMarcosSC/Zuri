import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurFileUpload, ZurUploadFile, zurAcceptsFile, zurFormatBytes } from './file-upload';

@Component({
  imports: [ZurFileUpload],
  template: `<zur-file-upload label="Fotos" accept="image/*,.pdf" [maxSize]="1000" multiple [(files)]="files" (filesAdded)="added = $event" />`,
})
class Host {
  files = signal<ZurUploadFile[]>([]);
  added: ZurUploadFile[] = [];
}

const file = (name: string, size: number, type: string) => new File(['x'.repeat(size)], name, { type });

describe('helpers', () => {
  it('formata bytes', () => {
    expect(zurFormatBytes(512)).toBe('512 B');
    expect(zurFormatBytes(1536)).toBe('1,5 KB');
    expect(zurFormatBytes(5 * 1024 * 1024, 'en-US')).toBe('5 MB');
  });
  it('confere o accept por extensão e mime', () => {
    expect(zurAcceptsFile(file('a.png', 1, 'image/png'), 'image/*')).toBe(true);
    expect(zurAcceptsFile(file('a.PDF', 1, ''), '.pdf')).toBe(true);
    expect(zurAcceptsFile(file('a.txt', 1, 'text/plain'), 'image/*,.pdf')).toBe(false);
  });
});

describe('ZurFileUpload', () => {
  it('aceita, rejeita e lista arquivos', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const upload = fixture.debugElement.children[0].componentInstance as ZurFileUpload;
    upload.addFiles([
      file('monstera.png', 100, 'image/png'),
      file('notas.txt', 10, 'text/plain'),
      file('grande.png', 5000, 'image/png'),
    ]);
    await fixture.whenStable();
    expect(fixture.componentInstance.files().map((f) => f.file.name)).toEqual(['monstera.png']);
    expect(fixture.componentInstance.added.length).toBe(1);
    const errors = Array.from(el.querySelectorAll('.rejected li')).map((li) => li.textContent?.trim());
    expect(errors).toEqual(['notas.txt não é de um tipo aceito', 'grande.png passa do limite de 1.000 B']);
    expect(el.querySelector('.name')?.textContent).toBe('monstera.png');
  });

  it('mostra progresso e remove pelo botão', async () => {
    const fixture = TestBed.createComponent(Host);
    const f = file('a.png', 10, 'image/png');
    fixture.componentInstance.files.set([{ id: '1', file: f, progress: 40, status: 'uploading' }]);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('zur-progress')?.getAttribute('aria-valuenow')).toBe('40');
    (el.querySelector('.remove') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.files()).toEqual([]);
  });

  it('aceita arquivos soltos na área', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const drop = fixture.nativeElement.querySelector('.drop') as HTMLElement;
    // jsdom não tem DataTransfer: um Event com `dataTransfer.files` basta para o componente.
    const event = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', { value: { files: [file('b.pdf', 5, 'application/pdf')] } });
    drop.dispatchEvent(event);
    await fixture.whenStable();
    expect(fixture.componentInstance.files().length).toBe(1);
  });
});
