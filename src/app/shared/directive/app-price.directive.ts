import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit
} from '@angular/core';
import { NgControl } from '@angular/forms';
// ติดเรื่องยังไม่สามารถพิมจุดเลยได้
@Directive({
  selector: '[appPrice]',
  standalone: false
})
export class PriceDirective implements OnInit {
  @Input() decimal = 2;
  @Input() locale = 'th-TH';

  private formatter!: Intl.NumberFormat;

  constructor(
    private el: ElementRef<HTMLInputElement>,
    private ngControl: NgControl
  ) { }

  ngOnInit(): void {
    this.formatter = new Intl.NumberFormat(this.locale, {
      minimumFractionDigits: this.decimal,
      maximumFractionDigits: this.decimal
    });
  }

  @HostListener('input')
  onInput(): void {
    const input = this.el.nativeElement;
    let raw = input.value;

    raw = raw.replace(/,/g, '');
    raw = raw.replace(/[^0-9.]/g, '');

    const parts = raw.split('.');
    if (parts.length > 2) {
      raw = parts[0] + '.' + parts.slice(1).join('');
    }

    if (parts[1]?.length > this.decimal) {
      raw = `${parts[0]}.${parts[1].slice(0, this.decimal)}`;
    }

    const numeric =
      raw === '' || raw === '.' ? null : Number(raw);

    this.ngControl.control?.setValue(numeric, {
      emitEvent: false
    });
  }

  @HostListener('blur')
  onBlur(): void {
    const input = this.el.nativeElement;
    const raw = input.value.replace(/,/g, '');

    if (raw === '' || raw === '.') {
      input.value = '';
      this.ngControl.control?.setValue(null, { emitEvent: false });
      return;
    }

    const numeric = Number(raw);
    if (isNaN(numeric)) return;

    this.ngControl.control?.setValue(numeric, { emitEvent: false });
    input.value = this.formatter.format(numeric);
  }

  @HostListener('focus')
  onFocus(): void {
    const input = this.el.nativeElement;
    input.value = input.value.replace(/,/g, '');
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const allowed = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Home',
      'End'
    ];

    if (allowed.includes(event.key)) return;
    if (/^[0-9.]$/.test(event.key)) return;

    event.preventDefault();
  }
}