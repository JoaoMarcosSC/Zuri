import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ZurToastContainer } from './toast-container';
import { ZurToastService } from './toast.service';

@Component({
  imports: [ZurToastContainer],
  template: `<zur-toast-container />`,
})
class Host {}

describe('ZurToastService + container', () => {
  afterEach(() => vi.useRealTimers());

  it('mostra o toast no container e remove após o tempo', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    vi.useFakeTimers();
    const service = TestBed.inject(ZurToastService);
    service.show('Link copiado.', 'success', 1000);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Link copiado.');
    expect(service.toasts().length).toBe(1);
    vi.advanceTimersByTime(1000);
    expect(service.toasts().length).toBe(0);
  });

  it('sucesso e erro têm ícone (a cor não é o único sinal) e o neutro não', async () => {
    const service = TestBed.inject(ZurToastService);
    const fixture = TestBed.createComponent(ZurToastContainer);
    await fixture.whenStable();
    service.show('Pedido confirmado', 'success');
    service.show('Falhou', 'error');
    service.show('Copiado');
    await fixture.whenStable();
    const toasts = Array.from(fixture.nativeElement.querySelectorAll('.toast')) as HTMLElement[];
    expect(toasts.map((t) => t.getAttribute('data-kind'))).toEqual(['success', 'error', 'neutral']);
    expect(toasts.map((t) => !!t.querySelector('svg.icon[aria-hidden=true]'))).toEqual([true, true, false]);
  });

  it('dismiss remove o toast pelo id', () => {
    const service = TestBed.inject(ZurToastService);
    service.show('A', 'neutral', 60000);
    const id = service.toasts()[0].id;
    service.dismiss(id);
    expect(service.toasts().length).toBe(0);
  });

  it('show devolve o id e dismissAll limpa tudo', () => {
    const service = TestBed.inject(ZurToastService);
    const a = service.show('A', 'neutral', 60000);
    const b = service.show('B', 'neutral', 60000);
    expect(b).toBe(a + 1);
    service.dismissAll();
    expect(service.toasts().length).toBe(0);
  });

  it('aceita o tempo como número (forma antiga) ou em opções', () => {
    vi.useFakeTimers();
    const service = TestBed.inject(ZurToastService);
    service.show('curto', 'neutral', 500);
    service.show('opções', 'neutral', { durationMs: 1000 });
    vi.advanceTimersByTime(500);
    expect(service.toasts().map((t) => t.message)).toEqual(['opções']);
    vi.advanceTimersByTime(500);
    expect(service.toasts().length).toBe(0);
  });

  it('persistente não fecha sozinho; com ação o padrão é mais longo (8 s)', () => {
    vi.useFakeTimers();
    const service = TestBed.inject(ZurToastService);
    service.show('fica', 'error', { persistent: true });
    service.show('desfazer', 'neutral', { action: { label: 'Desfazer', handler: () => {} } });
    vi.advanceTimersByTime(7999);
    expect(service.toasts().length).toBe(2);
    vi.advanceTimersByTime(1);
    expect(service.toasts().map((t) => t.message)).toEqual(['fica']);
    service.dismissAll();
  });

  it('pausar congela o tempo e retomar continua de onde parou', () => {
    vi.useFakeTimers();
    const service = TestBed.inject(ZurToastService);
    service.show('A', 'neutral', 1000);
    vi.advanceTimersByTime(400);
    service.pauseAll();
    vi.advanceTimersByTime(60000);
    expect(service.toasts().length).toBe(1);
    service.resumeAll();
    vi.advanceTimersByTime(599);
    expect(service.toasts().length).toBe(1);
    vi.advanceTimersByTime(1);
    expect(service.toasts().length).toBe(0);
  });

  it('um toast criado durante a pausa só começa a contar ao retomar', () => {
    vi.useFakeTimers();
    const service = TestBed.inject(ZurToastService);
    service.pauseAll();
    service.show('novo', 'neutral', 1000);
    vi.advanceTimersByTime(5000);
    expect(service.toasts().length).toBe(1);
    service.resumeAll();
    vi.advanceTimersByTime(1000);
    expect(service.toasts().length).toBe(0);
  });

  it('o container pausa no hover e no foco e retoma ao sair', async () => {
    const service = TestBed.inject(ZurToastService);
    const fixture = TestBed.createComponent(ZurToastContainer);
    await fixture.whenStable();
    vi.useFakeTimers();
    service.show('A', 'neutral', 1000);
    fixture.detectChanges();
    const stack = fixture.nativeElement.querySelector('.stack') as HTMLElement;
    stack.dispatchEvent(new Event('pointerenter'));
    vi.advanceTimersByTime(5000);
    expect(service.toasts().length).toBe(1);
    stack.dispatchEvent(new Event('pointerleave'));
    vi.advanceTimersByTime(1000);
    expect(service.toasts().length).toBe(0);
  });

  it('o botão de ação roda o handler e fecha o toast', async () => {
    const service = TestBed.inject(ZurToastService);
    const fixture = TestBed.createComponent(ZurToastContainer);
    await fixture.whenStable();
    let desfeito = 0;
    service.show('Planta removida', 'neutral', { action: { label: 'Desfazer', handler: () => desfeito++ } });
    await fixture.whenStable();
    const btn = fixture.nativeElement.querySelector('.action') as HTMLButtonElement;
    expect(btn.textContent?.trim()).toBe('Desfazer');
    btn.click();
    await fixture.whenStable();
    expect(desfeito).toBe(1);
    expect(service.toasts().length).toBe(0);
  });
});
