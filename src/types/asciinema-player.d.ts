declare module 'asciinema-player' {
  export function create(source: string, element: HTMLDivElement, options: Options | null = null): Player;

  export class Player {
    dispose(): void;
  }

  export class Options {
    cols?: number;

    rows?: number;

    autoPlay?: boolean;

    loop?: boolean | number;
  }
}
