import { Directive, ElementRef, Renderer2, Input } from '@angular/core';

@Directive({
  selector: '[appPreventSpecialChars]'
})
export class PreventSpecialCharsDirective {

  @Input() allowSpace: boolean = false;

  private allowedKeys: string[] = [
    'Backspace', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Delete', 
    'Tab', 'Enter', 'Home', 'End', 'Shift', 'Control', 'Alt', 'Meta'
  ];

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.listen(this.el.nativeElement, 'input', this.onInputChange.bind(this));
    this.renderer.listen(this.el.nativeElement, 'keydown', this.onKeyDown.bind(this));
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const regEx = this.allowSpace 
      ? /[^a-zA-Z0-9ก-ฮ\u0E2F-\u0E3A\u0E40-\u0E4D- ]/g 
      : /[^a-zA-Z0-9ก-ฮ\u0E2F-\u0E3A\u0E40-\u0E4D-]/g;
    let value = input.value;

    value = value.replace(regEx, '');

    if (this.allowSpace) {
      value = value.trimStart();
    }
    this.renderer.setProperty(this.el.nativeElement, 'value', value);
  }

  onKeyDown(event: KeyboardEvent) {
    const key = event.key;
    const isCtrlCmd = event.ctrlKey || event.metaKey;
    const allowedCodes = ['KeyV', 'KeyC', 'KeyA', 'KeyX'];
    if (isCtrlCmd && allowedCodes.includes(event.code)) {
      return;
    }
    
    const regEx = this.allowSpace 
      ? /^[a-zA-Z0-9ก-ฮ\u0E2F-\u0E3A\u0E40-\u0E4D- ]$/ 
      : /^[a-zA-Z0-9ก-ฮ\u0E2F-\u0E3A\u0E40-\u0E4D-]$/;
    if (!regEx.test(key) && !this.allowedKeys.includes(key)) {
      event.preventDefault();
    }
  }
}
