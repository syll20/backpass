export type BackpassOptions = {
  debug?: boolean;
  tokenMap?: Record<string, string>;
};

export class Backpass {
  private input: HTMLInputElement | null = null;
  private sequence: string[] = [];
  private handler: (e: KeyboardEvent) => void;

  constructor(selectorOrElement: string | Element, _opts?: BackpassOptions) {
    if (typeof selectorOrElement === 'string') {
      this.input = document.querySelector(selectorOrElement) as HTMLInputElement | null;
    } else if (selectorOrElement instanceof Element) {
      this.input = selectorOrElement as HTMLInputElement;
    }

    this.handler = (e: KeyboardEvent) => this.onKeyDown(e as KeyboardEvent);

    if (this.input) {
      this.input.addEventListener('keydown', this.handler);
    } else {
      // If no element found, we do nothing. Consumer should ensure element exists.
      // Optionally in the future provide a `mount()` method.
    }
  }

  private onKeyDown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Backspace':
        this.sequence.push('\uE000');
        break;
      case 'Delete':
        this.sequence.push('\uE001');
        break;
      case 'ArrowLeft':
        this.sequence.push('\uE002');
        break;
      case 'ArrowRight':
        this.sequence.push('\uE003');
        break;
      case 'ArrowUp':
        this.sequence.push('\uE004');
        break;
      case 'ArrowDown':
        this.sequence.push('\uE005');
        break;
      default:
        if (e.key.length === 1) {
          this.sequence.push(`\\u${e.key.charCodeAt(0).toString(16).padStart(4, '0')}`);
        }
    }
  }

  getBackpass(): string {
    return this.sequence.join('');
  }

  reset() {
    this.sequence = [];
  }

  destroy() {
    this.input?.removeEventListener('keydown', this.handler);
    this.input = null;
    this.sequence = [];
  }
}
