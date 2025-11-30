import { Directive, ElementRef, Renderer2 } from '@angular/core';
// ห้ามกด spacebar ใน input
// ห้าม paste ข้อความที่มี space — จะลบ space ออกอัตโนมัติ

@Directive({
  selector: '[appPreventSpace]'
})
export class PreventSpaceDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.listen(this.el.nativeElement, 'keydown', this.onKeyDown.bind(this));
    this.renderer.listen(this.el.nativeElement, 'paste', this.onPaste.bind(this));
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.code === 'Space' || event.key === ' ') {
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const sanitizedText = pastedText.replace(/\s/g, '');
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.type === 'email') {
      inputElement.value = sanitizedText;
    } else {
      const start = inputElement.selectionStart || 0;
      const end = inputElement.selectionEnd || 0;
      const currentValue = inputElement.value;
      const newValue = currentValue.slice(0, start) + sanitizedText + currentValue.slice(end);
      inputElement.value = newValue;
      inputElement.setSelectionRange(start + sanitizedText.length, start + sanitizedText.length);
    }

    inputElement.dispatchEvent(new Event('input'));
  }
}
