import { Directive, ElementRef, Renderer2 } from '@angular/core';
/**
 * Directive สำหรับจำกัดการพิมพ์ชื่อ–นามสกุล
 * - อนุญาตเฉพาะตัวอักษรภาษาอังกฤษ (a–z, A–Z)
 * - อนุญาตตัวอักษรภาษาไทย (ก–ฮ รวมสระและวรรณยุกต์)
 * - อนุญาตเครื่องหมายขีด (-) สำหรับชื่อแบบมีขีด
 *
 * ป้องกันรูปแบบที่ไม่ถูกต้อง:
 * - ไม่ให้มีขีดซ้ำกันหลายตัว (--)
 * - ไม่ให้ขึ้นต้นด้วยเครื่องหมายขีด (-)
 *
 * เหมาะสำหรับ input ชื่อ–นามสกุล เพื่อให้ข้อมูลสะอาดและตรงตามรูปแบบ
 */

@Directive({
  selector: '[allowednamesurname]'
})
export class AllowedNameSurnameDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.renderer.listen(this.el.nativeElement, 'input', this.onInputChange.bind(this));
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    let value = input.value;

    value = value.replace(/[^a-zA-Zก-ฮ\u0E2F-\u0E3A\u0E40-\u0E4D-]/g, '');

    if (value.includes('--')) {
      value = value.replace(/--+/g, '-');
    }

    if (value.startsWith('-')) {
      value = value.replace(/^-+/, '');
    }

    this.renderer.setProperty(this.el.nativeElement, 'value', value);
    event.preventDefault();
  }
}
