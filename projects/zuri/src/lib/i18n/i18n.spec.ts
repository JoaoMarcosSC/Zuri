import { TestBed } from '@angular/core/testing';
import { ZUR_I18N, ZUR_I18N_EN, ZUR_I18N_PT, provideZuriI18n } from './i18n';

describe('ZUR_I18N', () => {
  it('usa português por padrão', () => {
    expect(TestBed.inject(ZUR_I18N)).toBe(ZUR_I18N_PT);
  });

  it('troca para inglês com provideZuriI18n("en")', () => {
    TestBed.configureTestingModule({ providers: [provideZuriI18n('en')] });
    expect(TestBed.inject(ZUR_I18N).close).toBe('Close');
    expect(TestBed.inject(ZUR_I18N)).toBe(ZUR_I18N_EN);
  });

  it('aceita override parcial sobre o português', () => {
    TestBed.configureTestingModule({ providers: [provideZuriI18n({ close: 'Fechar janela' })] });
    const t = TestBed.inject(ZUR_I18N);
    expect(t.close).toBe('Fechar janela');
    expect(t.back).toBe('Voltar');
  });

  it('formata página e contador', () => {
    expect(ZUR_I18N_PT.page(3)).toBe('Página 3');
    expect(ZUR_I18N_EN.characterCount(12, 200)).toBe('12 of 200 characters');
  });

  it('tem as mesmas chaves nos dois idiomas', () => {
    expect(Object.keys(ZUR_I18N_EN).sort()).toEqual(Object.keys(ZUR_I18N_PT).sort());
  });

  it('formata os textos dos componentes novos', () => {
    expect(ZUR_I18N_PT.unreadNotifications(1)).toBe('Notificações, 1 não lida');
    expect(ZUR_I18N_PT.unreadNotifications(0)).toBe('Notificações');
    expect(ZUR_I18N_EN.typing('Ana')).toBe('Ana is typing…');
    expect(ZUR_I18N_PT.cardMoved('Regar', 'Feito', 2)).toBe('Regar: coluna Feito, posição 2.');
  });
});
