import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ZurInlineEdit } from './inline-edit';

@Component({
  imports: [ZurInlineEdit, ReactiveFormsModule],
  template: `<zur-inline-edit label="Nome do pedido" placeholder="Sem nome" [multiline]="multi" [formControl]="ctrl" (saved)="salvos.push($event)" />`,
})
class Host {
  multi = false;
  ctrl = new FormControl('Pedido 42');
  salvos: string[] = [];
}

async function setup(multi = false) {
  const fixture = TestBed.createComponent(Host);
  fixture.componentInstance.multi = multi;
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const read = () => el.querySelector('.read') as HTMLButtonElement | null;
  const field = () => el.querySelector('.field') as HTMLInputElement | null;
  const settle = async () => {
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 20));
    await fixture.whenStable();
  };
  const edit = async (text: string) => {
    read()!.click();
    await settle();
    field()!.value = text;
    field()!.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };
  const key = async (k: string, init: KeyboardEventInit = {}) => {
    field()!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, ...init }));
    await settle();
  };
  return { fixture, el, host: fixture.componentInstance, read, field, edit, key, settle };
}

describe('ZurInlineEdit', () => {
  it('em leitura é um botão com o valor e o aviso de edição no nome acessível', async () => {
    const { read } = await setup();
    expect(read()!.textContent).toContain('Pedido 42');
    expect(read()!.textContent).toContain('(Editar)');
    expect(getComputedStyle(read()!.querySelector('.sr-only')!).position).toBe('absolute'); // oculto de verdade
  });

  it('clicar abre o campo focado; Enter salva, atualiza o formulário e devolve o foco', async () => {
    const { host, read, field, edit, key, settle } = await setup();
    await edit('Pedido 43');
    expect(document.activeElement).toBe(field());
    expect(field()!.getAttribute('aria-label')).toBe('Nome do pedido');
    await key('Enter');
    expect(host.ctrl.value).toBe('Pedido 43');
    expect(host.salvos).toEqual(['Pedido 43']);
    expect(field()).toBeNull();
    await settle();
    expect(document.activeElement).toBe(read());
  });

  it('Esc cancela sem alterar nem emitir', async () => {
    const { host, read, field, edit, key } = await setup();
    await edit('outro');
    await key('Escape');
    expect(host.ctrl.value).toBe('Pedido 42');
    expect(host.salvos).toEqual([]);
    expect(field()).toBeNull();
    expect(read()!.textContent).toContain('Pedido 42');
  });

  it('salvar sem mudar não emite; F2 abre a edição', async () => {
    const { host, read, field, settle, key } = await setup();
    read()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'F2', bubbles: true }));
    await settle();
    expect(field()).not.toBeNull();
    await key('Enter');
    expect(host.salvos).toEqual([]);
  });

  it('mostra o placeholder quando vazio e anuncia o resultado', async () => {
    const { fixture, host, el, edit, key } = await setup();
    host.ctrl.setValue('');
    await fixture.whenStable();
    expect(el.querySelector('.value')?.textContent).toBe('Sem nome');
    await edit('Novo');
    await key('Enter');
    expect(el.querySelector('[aria-live=polite]')?.textContent).toBe('Alteração salva');
  });

  it('multiline: Enter quebra linha e Ctrl+Enter salva', async () => {
    const { host, edit, key, field } = await setup(true);
    await edit('linha 1');
    expect(field()!.tagName).toBe('TEXTAREA');
    await key('Enter');
    expect(host.salvos).toEqual([]);
    await key('Enter', { ctrlKey: true });
    expect(host.salvos).toEqual(['linha 1']);
  });

  it('o focusout do botão de leitura (que sai do DOM ao abrir) não salva nem fecha a edição', async () => {
    const { read, field, host, settle } = await setup();
    const botao = read()!;
    botao.click();
    // o navegador emite focusout, sem relatedTarget, quando o botão focado é removido
    botao.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: null }));
    await settle();
    expect(field()).not.toBeNull();
    expect(host.salvos).toEqual([]);
  });

  it('sair do campo para fora do componente salva', async () => {
    const { host, field, edit, settle } = await setup();
    await edit('Pedido 99');
    field()!.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }));
    await settle();
    expect(host.salvos).toEqual(['Pedido 99']);
    expect(field()).toBeNull();
  });
});
