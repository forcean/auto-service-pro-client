import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, ElementRef } from '@angular/core';

@Component({
  selector: 'custom-option',
  standalone: false,
  templateUrl: './custom-option.component.html',
  styleUrls: ['./custom-option.component.scss']
})
export class CustomOptionComponent implements OnChanges {
  @Input() value: unknown;
  @Input() selected: boolean = false;
  @Input() disabled = false;
  @Output() selectEvent: EventEmitter<{ value: unknown, label: string }> = new EventEmitter();

  isSelected: boolean = false;

  constructor(private elementRef: ElementRef) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selected']) {
      this.isSelected = this.selected;
    }
  }

  select() {
    if (!this.disabled) {
      const label = this.getLabel();
      this.isSelected = true;
      this.selectEvent.emit({ value: this.value, label });
    }
  }

  getValue(): string {
    return this.value ? String(this.value) : '';
  }

  getLabel(): string {
    return this.elementRef.nativeElement.innerText.trim();
  }
}
