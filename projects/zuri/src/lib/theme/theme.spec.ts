import { ApplicationRef, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideZuriI18n } from '../i18n/i18n';
import { ZurThemeScope } from './theme-scope';
import { ZurThemeToggle } from './theme-toggle';
import { ZurThemeService, provideZuriTheme } from './theme.service';

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

describe('provideZuriTheme', () => {
  let listeners: ((e: { matches: boolean }) => void)[] = [];
  let systemDark = false;
  const realMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    listeners = [];
    systemDark = false;
    window.matchMedia = ((query: string) => ({
      matches: query.includes('dark') ? systemDark : false,
      media: query,
      addEventListener: (_: string, fn: (e: { matches: boolean }) => void) => listeners.push(fn),
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;
  });
  afterEach(() => {
    window.matchMedia = realMatchMedia;
    vi.restoreAllMocks();
  });

  const systemChanges = (dark: boolean) => listeners.forEach((fn) => fn({ matches: dark }));

  it('liga o tema na partida, sem ninguém injetar o serviço', () => {
    systemDark = true;
    TestBed.configureTestingModule({ providers: [provideZuriTheme()] });
    TestBed.inject(ApplicationRef); // cria o injetor da aplicação, que roda os inicializadores
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('system: segue a troca do sistema até a pessoa escolher no botão', () => {
    TestBed.configureTestingModule({ providers: [provideZuriTheme({ mode: 'system' })] });
    const service = TestBed.inject(ZurThemeService);
    expect(service.theme()).toBe('light');
    systemChanges(true);
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    service.set('light'); // escolha da pessoa
    systemChanges(true);
    expect(service.theme()).toBe('light');
  });

  it('dark fixo: ignora o que estava salvo e o sistema, não troca e esconde o botão', async () => {
    localStorage.setItem('zur-theme', 'light');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    TestBed.configureTestingModule({ providers: [provideZuriTheme({ mode: 'dark' })] });
    const service = TestBed.inject(ZurThemeService);
    expect(service.theme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    systemChanges(false);
    service.toggle();
    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem('zur-theme')).toBe('light'); // não grava nada
    const fixture = TestBed.createComponent(ToggleHost);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('light fixo: um zurThemeScope ainda pode trocar só a sua área', async () => {
    TestBed.configureTestingModule({ providers: [provideZuriTheme({ mode: 'light' })] });
    const fixture = TestBed.createComponent(ScopeHost);
    await fixture.whenStable();
    const scope = fixture.nativeElement.querySelector('#scope') as HTMLElement;
    (scope.querySelector('button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(scope.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
