import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[allowedSpecialChars]'
})
export class AllowedSpecialCharsDirective {

  private allowedKeys: string[] = [
    'Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space',
    'Delete', 'Tab', 'Enter', 'Home', 'End', 'Shift', 'Control', 'Alt', 'Meta'
  ];

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.listen(this.el.nativeElement, 'input', this.onInputChange.bind(this));
    this.renderer.listen(this.el.nativeElement, 'keydown', this.onKeyDown.bind(this));
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const regEx = /^[a-zA-Z0-9 !"#$%&()*+\-./:;=?@_]*$/;
    let value = input.value;

    if (!regEx.test(value)) {
      value = value.replace(/[^a-zA-Z0-9 !"#$%&()*+\-./:;=?@_]/g, '');
      this.renderer.setProperty(this.el.nativeElement, 'value', value);
      event.preventDefault();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    const key = event.key;
    const isCtrlCmd = event.ctrlKey || event.metaKey;
    const allowedCodes = ['KeyV', 'KeyC', 'KeyA', 'KeyX'];
    if (isCtrlCmd && allowedCodes.includes(event.code)) {
      return;
    }

    const regEx = /^[a-zA-Z0-9 !"#$%&()*+\-./:;=?@_]*$/;
    if (!regEx.test(key) && !this.allowedKeys.includes(key)) {
      event.preventDefault();
    }
  }
}
