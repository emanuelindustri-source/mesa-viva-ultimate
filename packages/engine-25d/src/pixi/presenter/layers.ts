import { Container } from 'pixi.js';

export interface StageLayers {
  readonly shadow: Container;
  readonly board: Container;
  readonly cards: Container;
  readonly chips: Container;
  readonly tokens: Container;
  readonly seats: Container;
  readonly effects: Container;
}

export function createStageLayers(): StageLayers {
  const cards = new Container();
  cards.sortableChildren = true;
  return {
    shadow: new Container(),
    board: new Container(),
    cards,
    chips: new Container(),
    tokens: new Container(),
    seats: new Container(),
    effects: new Container(),
  };
}
