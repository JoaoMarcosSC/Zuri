import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideZuriI18n } from '../i18n/i18n';
import { ZurLogo } from '../logo/logo';
import { ZurSidenav, ZurSidenavItem } from '../sidenav/sidenav';
import { ZurDashboardLayout } from './dashboard-layout';
import { ZurErrorLayout } from './error-layout';
import { ZurFormLayout } from './form-layout';
import { ZurListDetailLayout } from './list-detail-layout';
import { ZurPageHeader } from './page-header';
import { ZurShellState } from './shell-state';
import { ZurSidebar } from './sidebar';
import { ZurTopbar } from './topbar';

function setWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
}

describe('ZurShellState', () => {
  afterEach(() => setWidth(1024));

  it('no desktop, toggle recolhe a sidebar', () => {
    setWidth(1280);
    const state = TestBed.runInInjectionContext(() => new ZurShellState());
    expect(state.viewport()).toBe('desktop');
    expect(state.collapsed()).toBe(false);
    state.toggle();
    expect(state.collapsed()).toBe(true);
  });

  it('no tablet, começa recolhida', () => {
    setWidth(800);
    const state = TestBed.runInInjectionContext(() => new ZurShellState());
    expect(state.viewport()).toBe('tablet');
    expect(state.collapsed()).toBe(true);
  });

  it('no mobile, toggle abre a gaveta e closeDrawer fecha', () => {
    setWidth(390);
    const state = TestBed.runInInjectionContext(() => new ZurShellState());
    expect(state.viewport()).toBe('mobile');
    state.toggle();
    expect(state.drawerOpen()).toBe(true);
    state.closeDrawer();
    expect(state.drawerOpen()).toBe(false);
  });
});

@Component({
  imports: [ZurDashboardLayout, ZurSidebar, ZurTopbar, ZurSidenav, ZurSidenavItem, ZurLogo, ZurPageHeader],
  template: `
    <zur-dashboard-layout>
      <zur-sidebar>
        <zur-logo zurSidebarHeader variant="auto" />
        <zur-sidenav>
          <a zur-sidenav-item href="#" [active]="true">Início</a>
        </zur-sidenav>
      </zur-sidebar>
      <zur-topbar />
      <zur-page-header title="Visão geral" description="Resumo" />
    </zur-dashboard-layout>
  `,
})
class DashboardHost {}

describe('ZurDashboardLayout + sidebar + topbar', () => {
  beforeEach(() => setWidth(1280));

  it('mostra o botão de menu com rótulo do i18n e recolhe a sidebar', async () => {
    const fixture = TestBed.createComponent(DashboardHost);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const menu = el.querySelector('zur-topbar button.menu') as HTMLButtonElement;
    expect(menu.getAttribute('aria-label')).toBe('Alternar menu lateral');
    expect(menu.getAttribute('aria-expanded')).toBe('true');
    expect(el.querySelector('zur-logo svg')?.getAttribute('viewBox')).toBe('8 0 130 64');

    menu.click();
    await fixture.whenStable();
    expect(el.querySelector('zur-sidebar')?.getAttribute('data-collapsed')).toBe('true');
    expect(menu.getAttribute('aria-expanded')).toBe('false');
    // logo "auto" vira só o símbolo com a sidebar recolhida
    expect(el.querySelector('zur-logo svg')?.getAttribute('viewBox')).toBe('0 0 64 64');
  });

  it('item ativo do sidenav ganha aria-current e o page-header mostra o título', async () => {
    const fixture = TestBed.createComponent(DashboardHost);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('a[zur-sidenav-item]')?.getAttribute('aria-current')).toBe('page');
    expect(el.querySelector('zur-page-header h1')?.textContent).toContain('Visão geral');
  });

  it('em inglês, o botão de menu e a sidebar usam o i18n', async () => {
    TestBed.configureTestingModule({ providers: [provideZuriI18n('en')] });
    const fixture = TestBed.createComponent(DashboardHost);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('button.menu')?.getAttribute('aria-label')).toBe('Toggle side menu');
    expect(el.querySelector('zur-sidebar aside')?.getAttribute('aria-label')).toBe('Side navigation');
  });
});

@Component({
  imports: [ZurListDetailLayout],
  template: `
    <zur-list-detail-layout [(detailOpen)]="aberto">
      <div zurList>Lista</div>
      <div zurDetail>Detalhe</div>
    </zur-list-detail-layout>
  `,
})
class ListDetailHost {
  aberto = signal(true);
}

describe('ZurListDetailLayout', () => {
  it('reflete detailOpen e o botão Voltar fecha o detalhe', async () => {
    const fixture = TestBed.createComponent(ListDetailHost);
    await fixture.whenStable();
    const host = fixture.nativeElement.querySelector('zur-list-detail-layout') as HTMLElement;
    expect(host.getAttribute('data-detail-open')).toBe('true');
    const back = host.querySelector('button.back') as HTMLButtonElement;
    expect(back.textContent?.trim()).toBe('Voltar');
    back.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.aberto()).toBe(false);
    expect(host.getAttribute('data-detail-open')).toBe('false');
  });
});

@Component({
  imports: [ZurFormLayout],
  template: `<zur-form-layout [steps]="['Dados', 'Pagamento', 'Revisão']" [current]="1">Campos</zur-form-layout>`,
})
class FormHost {}

describe('ZurFormLayout', () => {
  it('marca etapas concluídas, atual e pendentes', async () => {
    const fixture = TestBed.createComponent(FormHost);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('ol')?.getAttribute('aria-label')).toBe('Etapas');
    const states = Array.from(el.querySelectorAll('.step')).map((s) => s.getAttribute('data-state'));
    expect(states).toEqual(['done', 'current', 'todo']);
    expect(el.querySelector('[aria-current=step]')?.textContent).toContain('Pagamento');
  });
});

@Component({
  imports: [ZurErrorLayout],
  template: `<zur-error-layout code="404" title="Página não encontrada" description="Sumiu." />`,
})
class ErrorHost {}

describe('ZurErrorLayout', () => {
  it('mostra código, título e descrição', async () => {
    const fixture = TestBed.createComponent(ErrorHost);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.code')?.textContent?.trim()).toBe('404');
    expect(el.querySelector('h1')?.textContent).toContain('Página não encontrada');
    expect(el.querySelector('.description')?.textContent).toContain('Sumiu.');
  });
});
