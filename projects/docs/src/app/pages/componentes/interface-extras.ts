import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ZurAvatarGroup,
  ZurBanner,
  ZurButton,
  ZurCarousel,
  ZurCarouselSlide,
  ZurNumberInput,
  ZurOtpInput,
  ZurRating,
  ZurStepper,
  ZurStepperStep,
  ZurTimePicker,
  ZurToastService,
} from '@juau/zuri';
import { CodeBlock } from '../../shared/code-block/code-block';

/** Number input, OTP, Rating, Time picker, Stepper, Carousel, Avatar group e Banner. */
@Component({
  selector: 'docs-interface-extras',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule, CodeBlock, ZurButton, ZurNumberInput, ZurOtpInput, ZurRating, ZurTimePicker, ZurStepper,
    ZurStepperStep, ZurCarousel, ZurCarouselSlide, ZurAvatarGroup, ZurBanner,
  ],
  templateUrl: './interface-extras.html',
  styleUrl: './componentes.css',
  styles: `
    :host {
      max-width: none;
      margin: 0;
    }
    .stack {
      display: grid;
      gap: var(--zur-space-lg);
      width: 100%;
      max-width: 320px;
    }
    .demo-wide {
      display: block;
    }
    .slide {
      display: grid;
      place-items: center;
      height: 200px;
      font: var(--zur-font-headline);
    }
    .slide-a { background: var(--zur-primary-soft); color: var(--zur-on-primary-soft); }
    .slide-b { background: var(--zur-surface-strong); color: var(--zur-ink); }
    .slide-c { background: var(--zur-info-soft); color: var(--zur-info-text); }
    .banners {
      display: grid;
      gap: var(--zur-space-sm);
      border-radius: var(--zur-radius-md);
      overflow: hidden;
      width: 100%;
    }
    .actions {
      display: flex;
      gap: var(--zur-space-sm);
    }
    .ok {
      margin: 0;
      color: var(--zur-success-text);
      font: var(--zur-font-caption);
      font-weight: 700;
    }
  `,
})
export class InterfaceExtras {
  private readonly toast = inject(ZurToastService);

  protected readonly qtd = signal<number | null>(2);
  protected readonly preco = signal<number | null>(49.9);
  protected readonly codigo = signal('');
  protected readonly completo = signal('');
  protected readonly nota = signal<number | null>(4);
  protected readonly hora = signal<string | null>('10:15');
  protected readonly etapa = signal(0);
  protected readonly slide = signal(0);
  protected readonly bannerAberto = signal(true);

  protected readonly equipe = ['Ana Silva', 'Bruno Costa', 'Carla Dias', 'Diego Melo', 'Eva Lima', 'Fábio Reis'].map((name) => ({ name }));

  protected finalizar(): void {
    this.toast.show('Pedido finalizado!', 'success');
    this.etapa.set(0);
  }

  protected readonly codeNumber = `<zur-number-input label="Quantidade" [min]="1" [max]="10" [(ngModel)]="qtd" />
<zur-number-input label="Preço (R$)" [min]="0" [step]="0.1" [(ngModel)]="preco" />`;

  protected readonly codeOtp = `<zur-otp-input label="Código enviado por SMS" [length]="6"
  [(ngModel)]="codigo" (completed)="verificar($event)" />`;

  protected readonly codeRating = `<zur-rating label="Sua nota" [(ngModel)]="nota" />
<zur-rating readonly [value]="4.5" size="sm" />`;

  protected readonly codeTime = `<zur-time-picker label="Retirada na loja" min="09:00" max="18:00"
  [minuteStep]="15" [(ngModel)]="hora" />   <!-- valor: 'HH:mm' (24h) -->`;

  protected readonly codeStepper = `<zur-stepper #s linear [(index)]="etapa">
  <zur-stepper-step label="Endereço" description="Onde entregar">…</zur-stepper-step>
  <zur-stepper-step label="Pagamento">…</zur-stepper-step>
  <zur-stepper-step label="Revisão">…</zur-stepper-step>
</zur-stepper>
<button zur-button (click)="s.next()">Continuar</button>`;

  protected readonly codeCarousel = `<zur-carousel label="Destaques da semana" [(index)]="slide" [autoplay]="6000" loop>
  <zur-carousel-slide>…</zur-carousel-slide>
  <zur-carousel-slide>…</zur-carousel-slide>
</zur-carousel>
<!-- O autoplay pausa ao focar/passar o mouse e fica desligado com prefers-reduced-motion. -->`;

  protected readonly codeAvatarGroup = `<zur-avatar-group label="Equipe do pedido" [people]="equipe" [max]="4" />`;

  protected readonly codeBanner = `<zur-banner kind="warning" dismissible [(open)]="aberto">
  Manutenção hoje às 22h.
  <a zurBannerAction href="#">Saiba mais</a>
</zur-banner>`;
}
