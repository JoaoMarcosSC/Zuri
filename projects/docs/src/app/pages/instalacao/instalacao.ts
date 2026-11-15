import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ZurStep } from '@juau/zuri';
import { CodeBlock } from '../../shared/code-block/code-block';

@Component({
  selector: 'docs-instalacao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeBlock, ZurStep],
  templateUrl: './instalacao.html',
  styleUrl: './instalacao.css',
})
export class Instalacao {
  protected readonly stepInstall = `npm install @juau/zuri`;

  protected readonly stepStyles = `/* styles.css global da sua aplicação */
@import '@juau/zuri/styles/tokens.css';

@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800&display=swap');

body {
  margin: 0;
  background: var(--zur-canvas);
  color: var(--zur-body);
  font: var(--zur-font-body);
  transition: background-color 200ms ease, color 200ms ease;
}`;

  protected readonly stepShell = `<zur-navbar>
  <strong zurNavbarLogo>Minha Marca</strong>
  <ng-container zurNavbarLinks>
    <a href="#">Início</a>
    <a href="#">Explorar</a>
  </ng-container>
  <ng-container zurNavbarActions>
    <zur-theme-toggle />
  </ng-container>
</zur-navbar>

<zur-toast-container />`;

  protected readonly stepUse = `import { ZurButton } from '@juau/zuri';

@Component({
  imports: [ZurButton],
  template: \`<button zur-button variant="primary">Reservar</button>\`,
})
export class MinhaTela {}`;
}
