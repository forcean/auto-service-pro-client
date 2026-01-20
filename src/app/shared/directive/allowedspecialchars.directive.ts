import { Directive, ElementRef, Renderer2 } from '@angular/core';
/**
 * Directive สำหรับจำกัดการพิมพ์ให้รับเฉพาะ
 * - ตัวอักษร a–z, A–Z
 * - ตัวเลข 0–9
 * - ช่องว่าง (space)
 * - อักขระพิเศษที่อนุญาต เช่น ! " # $ % & ( ) * + - . / : ; = ? @ _
 *
 * ใช้กับ input/textarea เพื่อป้องกันการพิมพ์อักขระต้องห้าม
 * ทั้งจากการกดแป้นพิมพ์และการ paste
 * เหมาะกับ: ชื่อสินค้า, รหัสสินค้า, input ที่ต้องการกัน emoji / ภาษาไทย / special chars แปลก ๆ
 */

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
