import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ZurBadge, ZurButton, ZurCard, ZurLogo } from '@juau/zuri';

interface Trait {
  title: string;
  description: string;
  badge: string;
}

@Component({
  selector: 'docs-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ZurButton, ZurBadge, ZurCard, ZurLogo],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly traits: Trait[] = [
    {
      badge: 'Paleta',
      title: 'Verde-menta fresco',
      description:
        'Uma única voltagem de marca sobre neutros com tintura sage — inspirada em Jobright e Wise.',
    },
    {
      badge: 'Temas',
      title: 'Claro e escuro, de verdade',
      description:
        'Alterne pelo botão sol/lua na barra lateral. O escuro é quase-preto, inspirado na imersão do Spotify, com leve tintura verde — não cinza genérico.',
    },
    {
      badge: 'Formas',
      title: 'Suave, com uma sombra só',
      description:
        'Botões a 8px, cards a 14px, pills em raio total — e um único tier de elevação, como no Airbnb.',
    },
    {
      badge: 'Tipografia',
      title: 'Nunito Sans arredondada',
      description:
        'Terminais arredondados e peso moderado — calorosa sem perder legibilidade em UI densa.',
    },
  ];

  protected readonly swatches = [
    '--zur-primary',
    '--zur-primary-hover',
    '--zur-primary-active',
    '--zur-primary-soft',
  ];
}
