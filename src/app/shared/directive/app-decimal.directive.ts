import { Directive, ElementRef, HostListener, Input } from "@angular/core";
import { NgControl } from "@angular/forms";

@Directive({
  selector: '[appDecimal]',
  standalone: false
})
export class DecimalDirective {
  @Input() decimal = 2;

  constructor(
    private el: ElementRef<HTMLInputElement>,
    private ngControl: NgControl
  ) { }

  @HostListener('input')
  onInput(): void {
    const input = this.el.nativeElement;
    let value = input.value;

    value = value.replace(/[^0-9.]/g, '');

    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    if (parts[1]?.length > this.decimal) {
      value = `${parts[0]}.${parts[1].slice(0, this.decimal)}`;
    }

    if (value !== input.value) {
      input.value = value;
    }

    this.ngControl.control?.setValue(value, { emitEvent: false });
  }

  @HostListener('blur')
  onBlur(): void {
    const input = this.el.nativeElement;
    const value = input.value;

    if (value === '' || value === '.') {
      this.ngControl.control?.setValue(null);
      input.value = '';
      return;
    }
    const numeric = Number(value);
    this.ngControl.control?.setValue(numeric);
    input.value = numeric.toString();
  }
}