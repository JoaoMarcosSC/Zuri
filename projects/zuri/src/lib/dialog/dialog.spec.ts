import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideZuriI18n } from '../i18n/i18n';
import { ZurDialog } from './dialog';

async function setup() {
  const dialog = TestBed.inject(ZurDialog);
  const app = TestBed.inject(ApplicationRef);
  const trigger = document.createElement('button');
  document.body.appendChild(trigger);
  trigger.focus();
  const settle = async () => {
    await app.whenStable();
    await new Promise((r) => setTimeout(r));
  };
  const host = () => document.querySelector('zur-dialog') as HTMLElement | null;
  const buttons = () => Array.from(host()!.querySelectorAll('button')) as HTMLButtonElement[];
  return { dialog, trigger, settle, host, buttons };
}

afterEach(() => {
  document.querySelectorAll('zur-dialog').forEach((d) => d.remove());
  document.body.style.overflow = '';
});

describe('ZurDialog', () => {
  it('confirm: botão confirma (true) e cancelar devolve false', async () => {
    const { dialog, settle, buttons, host } = await setup();
    let p = dialog.confirm({ title: 'Excluir pedido?', message: 'Não dá para desfazer.' });
    await settle();
    expect(host()!.querySelector('[role=alertdialog]')?.getAttribute('aria-modal')).toBe('true');
    expect(host()!.querySelector('h2')?.textContent).toBe('Excluir pedido?');
    expect(buttons().map((b) => b.textContent?.trim())).toEqual(['Cancelar', 'Confirmar']);
    buttons()[1].click();
    expect(await p).toBe(true);
    expect(host()).toBeNull();

    p = dialog.confirm({ title: 'Outra?' });
    await settle();
    buttons()[0].click();
    expect(await p).toBe(false);
  });

  it('Esc e clique no fundo cancelam', async () => {
    const { dialog, settle, host } = await setup();
    let p = dialog.confirm({ title: 'A' });
    await settle();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(await p).toBe(false);

    p = dialog.confirm({ title: 'B' });
    await settle();
    (host()!.querySelector('.scrim') as HTMLElement).click();
    expect(await p).toBe(false);
  });

  it('o foco entra no diálogo, fica preso e volta ao elemento anterior', async () => {
    const { dialog, trigger, settle, buttons, host } = await setup();
    const p = dialog.confirm({ title: 'Salvar?' });
    await settle();
    expect(document.activeElement).toBe(buttons()[1]); // não destrutivo: foco em Confirmar
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    document.activeElement!.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(buttons()[0]);
    expect(document.body.style.overflow).toBe('hidden');
    buttons()[1].click();
    await p;
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).toBe('');
    expect(host()).toBeNull();
  });

  it('destrutivo: botão vermelho e foco começa em Cancelar', async () => {
    const { dialog, settle, buttons } = await setup();
    const p = dialog.confirm({ title: 'Excluir?', confirmLabel: 'Excluir', destructive: true });
    await settle();
    expect(buttons()[1].getAttribute('data-variant')).toBe('danger');
    expect(buttons()[1].textContent?.trim()).toBe('Excluir');
    expect(document.activeElement).toBe(buttons()[0]);
    buttons()[0].click();
    await p;
  });

  it('alert tem um só botão (OK)', async () => {
    const { dialog, settle, buttons } = await setup();
    const p = dialog.alert({ title: 'Pronto' });
    await settle();
    expect(buttons().map((b) => b.textContent?.trim())).toEqual(['OK']);
    buttons()[0].click();
    await expect(p).resolves.toBeUndefined();
  });

  it('usa os textos do idioma configurado', async () => {
    TestBed.configureTestingModule({ providers: [provideZuriI18n('en')] });
    const { dialog, settle, buttons } = await setup();
    const p = dialog.confirm({ title: 'Delete?' });
    await settle();
    expect(buttons().map((b) => b.textContent?.trim())).toEqual(['Cancel', 'Confirm']);
    buttons()[0].click();
    await p;
  });
});
