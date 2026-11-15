import { Directive, ElementRef, inject } from '@angular/core';
import { ZUR_THEME_SCOPE, ZurThemeService } from './theme.service';

/**
 * Cria um tema isolado: o `zur-theme-toggle` (e qualquer `ZurThemeService`) dentro do
 * elemento muda só o tema dele, sem tocar no resto da página. Começa no tema da página,
 * acompanha-o quando ele muda e não persiste a escolha local.
 *
 * ```html
 * <div zurThemeScope>
 *   <zur-navbar>… <zur-theme-toggle /> …</zur-navbar>
 * </div>
 * ```
 */
@Directive({
  selector: '[zurThemeScope]',
  providers: [
    { provide: ZUR_THEME_SCOPE, useFactory: () => inject(ElementRef) },
    { provide: ZurThemeService, useClass: ZurThemeService },
  ],
  host: { class: 'zur-theme-scope' },
})
export class ZurThemeScope {}
