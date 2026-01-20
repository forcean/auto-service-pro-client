import { Directive, ElementRef, Renderer2 } from '@angular/core';
/**
 * Directive สำหรับป้องกันการเว้นวรรค (space) ในช่อง input
 * - ไม่อนุญาตให้กดปุ่ม Space จากคีย์บอร์ด
 * - เมื่อ paste จะลบช่องว่างทั้งหมดออกโดยอัตโนมัติ
 * - รองรับทั้ง input ทั่วไปและ input ประเภท email
 * - dispatch event 'input' เพื่อให้ Reactive Form อัปเดตค่าได้ถูกต้อง
 *
 * เหมาะสำหรับ field ที่ห้ามมี space เช่น
 * username, email, code, password, slug หรือ identifier ต่าง ๆ
 */

@Directive({
  selector: '[appPreventSpace]',
  standalone: false
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
