import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideZuriI18n } from '../i18n/i18n';
import { ZurThemeScope } from './theme-scope';
import { ZurThemeToggle } from './theme-toggle';
import { ZurThemeService } from './theme.service';

describe('ZurThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('começa no tema salvo e aplica data-theme no <html>', () => {
    localStorage.setItem('zur-theme', 'dark');
    const service = TestBed.inject(ZurThemeService);
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggle alterna e persiste em localStorage', () => {
    const service = TestBed.inject(ZurThemeService);
    expect(service.theme()).toBe('light');
    service.toggle();
    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem('zur-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

@Component({
  imports: [ZurThemeScope, ZurThemeToggle],
  template: `<div zurThemeScope id="scope"><zur-theme-toggle /></div>`,
})
class ScopeHost {}

describe('zurThemeScope', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('o toggle dentro do escopo muda só o escopo e não persiste', async () => {
    const fixture = TestBed.createComponent(ScopeHost);
    await fixture.whenStable();
    const scope = fixture.nativeElement.querySelector('#scope') as HTMLElement;
    expect(scope.getAttribute('data-theme')).toBe('light');
    (scope.querySelector('button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(scope.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('zur-theme')).toBeNull();
  });

  it('acompanha quando o tema da página muda', async () => {
    const fixture = TestBed.createComponent(ScopeHost);
    await fixture.whenStable();
    TestBed.inject(ZurThemeService).set('dark');
    await fixture.whenStable();
    const scope = fixture.nativeElement.querySelector('#scope') as HTMLElement;
    expect(scope.getAttribute('data-theme')).toBe('dark');
  });
});

@Component({
  imports: [ZurThemeScope],
  template: `<div zurThemeScope id="scope"><p>Login sem botão de tema</p></div>`,
})
class ScopeSemToggleHost {}

describe('zurThemeScope sem zur-theme-toggle dentro', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('aplica o tema salvo da página mesmo sem ninguém pedir o serviço', async () => {
    localStorage.setItem('zur-theme', 'dark');
    const fixture = TestBed.createComponent(ScopeSemToggleHost);
    await fixture.whenStable();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect((fixture.nativeElement.querySelector('#scope') as HTMLElement).getAttribute('data-theme')).toBe('dark');
  });
});

@Component({ imports: [ZurThemeToggle], template: `<zur-theme-toggle />` })
class ToggleHost {}

describe('ZurThemeToggle', () => {
  beforeEach(() => localStorage.clear());

  it('o rótulo diz para qual tema vai (pt e en)', async () => {
    let fixture = TestBed.createComponent(ToggleHost);
    await fixture.whenStable();
    const label = () => fixture.nativeElement.querySelector('button').getAttribute('aria-label');
    expect(label()).toBe('Ativar tema escuro');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZuriI18n('en')] });
    fixture = TestBed.createComponent(ToggleHost);
    await fixture.whenStable();
    expect(label()).toBe('Switch to dark theme');
  });
});
