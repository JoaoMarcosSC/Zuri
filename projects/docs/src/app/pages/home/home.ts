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
        'Uma cor de marca só, sobre cinzas levemente esverdeados. A referência foi Jobright e Wise.',
    },
    {
      badge: 'Temas',
      title: 'Claro e escuro, de verdade',
      description:
        'O botão de sol e lua fica na barra lateral. O escuro é quase preto, com um toque de verde, no espírito do Spotify. Nada de cinza genérico.',
    },
    {
      badge: 'Formas',
      title: 'Suave, com uma sombra só',
      description:
        'Botões com 8px de raio, cards com 14px e pílulas redondas. Sombra, só uma, e só no que flutua, como no Airbnb.',
    },
    {
      badge: 'Tipografia',
      title: 'Nunito Sans arredondada',
      description:
        'Letras de pontas arredondadas e peso moderado. É acolhedora e continua legível em telas cheias de informação.',
    },
  ];

  protected readonly swatches = [
    '--zur-primary',
    '--zur-primary-hover',
    '--zur-primary-active',
    '--zur-primary-soft',
  ];
}
