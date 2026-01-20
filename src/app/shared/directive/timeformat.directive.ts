import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';
import { NgControl } from '@angular/forms';
/**
 * Directive สำหรับจัดรูปแบบการกรอกเวลา (Time Format)
 *
 * โหมดการทำงาน:
 * 1) ไม่กำหนด typeDate
 *    - รับค่าในรูปแบบ HH:mm
 *    - จำกัดชั่วโมงไม่เกิน 23 และนาทีไม่เกิน 59
 *    - ใส่เครื่องหมาย ':' ให้อัตโนมัติขณะพิมพ์
 *
 * 2) กำหนด typeDate = 'hour' | 'minute' | 'second'
 *    - ใช้สำหรับ input แยกช่อง
 *    - hour   : จำกัดค่า 0–23
 *    - minute : จำกัดค่า 0–59
 *    - second : จำกัดค่า 0–59
 *    - sync ค่าเข้ากับ Reactive Form ผ่าน NgControl
 *
 * ป้องกันการพิมพ์อักขระที่ไม่ใช่ตัวเลขจากคีย์บอร์ด
 *
 * เหมาะสำหรับฟอร์มตั้งเวลา, schedule, SLA, หรือการกรอกเวลาแบบกำหนดรูปแบบ
 */

@Directive({
  selector: '[appTimeFormat]'
})
export class TimeFormatDirective {
  constructor(private el: ElementRef, private renderer: Renderer2, private ngControl: NgControl) { }

  @Input() typeDate: 'hour' | 'minute' | 'second' | null = null;

  @HostListener('input', ['$event']) onInputChange(event: Event): void {
    const input = this.el.nativeElement;
    let value = input.value.replace(/\D/g, '');
    if (!this.typeDate) {
      let hours = value.slice(0, 2);
      if (hours && parseInt(hours, 10) > 23) {
        hours = '23';
      }

      let minutes = value.slice(2, 4);
      if (minutes && parseInt(minutes, 10) > 59) {
        minutes = '59';
      }

      if (value.length <= 2) {
        input.value = hours;
      } else if (value.length > 2) {
        input.value = `${hours}:${minutes}`;
      }
    } else {
      if (this.typeDate === 'hour' && parseInt(value, 10) > 23) {
        value = '23';
      } else if (['minute', 'second'].includes(this.typeDate) && parseInt(value, 10) > 59) {
        value = '59';
      }
      this.renderer.setProperty(input, 'value', value);

      if (this.ngControl) {
        this.ngControl.control?.setValue(value);
      }
    }
  }

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent): void {
    if (!['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key) &&
      !/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }
}
