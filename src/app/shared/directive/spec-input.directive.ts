import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appSpecInput]',
  standalone: false
})
export class SpecInputDirective {

  @Input() allowedUnits: string[] = ['kg', 'g', 'cm', 'mm', 'm', 'in'];

  constructor(
    private el: ElementRef<HTMLInputElement>,
    private ngControl: NgControl
  ) { }

  @HostListener('input')
  onInput(): void {
    let value = this.el.nativeElement.value.toLowerCase();

    value = value.replace(/[^0-9a-z.\s]/g, '');

    if (value && !/^\d/.test(value)) {
      value = '';
    }

    const match = value.match(/^(\d+(?:\.\d*)?)(\s*[a-z]*)?$/);
    if (!match) {
      value = value.slice(0, -1);
    } else {
      const numberPart = match[1];
      let unitPart = (match[2] || '').trim();

      if (unitPart) {
        const isValidPrefix = this.allowedUnits.some(
          u => u.startsWith(unitPart)
        );

        if (!isValidPrefix) {
          unitPart = '';
        }
      }

      value = unitPart
        ? `${numberPart} ${unitPart}`
        : numberPart;
    }

    this.el.nativeElement.value = value;
    this.ngControl.control?.setValue(value, { emitEvent: false });
  }


  // @HostListener('input') 
  // onInput(): void { 
  // let value = this.el.nativeElement.value; 
  // value = value.replace(/[^0-9a-zA-Z.\s]/g, ''); 
  // this.el.nativeElement.value = value; 
  // this.ngControl.control?.setValue(value, { emitEvent: false }); }


  @HostListener('blur')
  onBlur(): void {
    let value = this.el.nativeElement.value;

    value = value.trim();
    if (!value) {
      this.ngControl.control?.setValue(null);
      return;
    }

    const normalized = this.normalize(value);

    if (!normalized) {
      this.ngControl.control?.setErrors({ invalidSpec: true });
      return;
    }

    this.el.nativeElement.value = normalized;
    this.ngControl.control?.setValue(normalized);
  }

  private normalize(value: string): string | null {
    // บีบ space ให้เหลือช่องเดียว
    value = value.replace(/\s+/g, ' ');

    // 🔑 ตรงนี้คือหัวใจ → จับ "ตัวเลขติด unit"
    const unitPattern = this.allowedUnits.join('|');

    const regex = new RegExp(
      `^(\\d+(?:\\.\\d+)?)(?:\\s*)(${unitPattern})$`,
      'i'
    );

    const match = value.match(regex);
    if (!match) return null;

    const number = match[1];
    const unit = match[2].toLowerCase();

    return `${number} ${unit}`;
  }
}
