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

  it('dismiss remove o toast pelo id', () => {
    const service = TestBed.inject(ZurToastService);
    service.show('A', 'neutral', 60000);
    const id = service.toasts()[0].id;
    service.dismiss(id);
    expect(service.toasts().length).toBe(0);
  });
});
