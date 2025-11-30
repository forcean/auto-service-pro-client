import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appCommaSeparator]'
})
export class CommaSeparatorDirective {
  private previousValue: string = '';

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event: any): void {
    const input = this.el.nativeElement;
    const cleanValue = input.value.replace(/,/g, '');

    if (/^0\d+/.test(cleanValue)) {
      input.value = cleanValue;
      this.previousValue = cleanValue;
      return;
    }

    const formattedValue = this.formatNumber(cleanValue);
    input.value = formattedValue;
    this.previousValue = cleanValue;
  }

  @HostListener('blur') onBlur(): void {
    const input = this.el.nativeElement;
    let cleanValue = input.value.replace(/,/g, '');

    if (cleanValue === '') {
      input.value = '';
      this.previousValue = '';
      return;
    }

    cleanValue = cleanValue === '0' ? '0' : cleanValue;
  
    const formattedValue = this.formatNumber(cleanValue);
    input.value = formattedValue;
    this.previousValue = cleanValue;
  }

  @HostListener('copy', ['$event']) onCopy(event: ClipboardEvent): void {
    const input = this.el.nativeElement;
    const cleanValue = input.value.replace(/,/g, '');
    event.clipboardData?.setData('text/plain', cleanValue);
    event.preventDefault();
  }

  private formatNumber(value: string): string {
    if (value === "0") {
      return "0";
    }

    if (!value) {
      return '';
    }

    const num = parseFloat(value);
    if (isNaN(num)) {
      return '';
    }

    return new Intl.NumberFormat('en-US').format(num);
  }

  public getRawValue(): string {
    return this.previousValue;
  }
}
