import { Component, ContentChildren, QueryList, forwardRef, Input, HostListener, EventEmitter, Output, AfterContentInit, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CustomOptionComponent } from '../custom-option/custom-option.component';
import { createPopper } from '@popperjs/core';
// import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'custom-select',
  standalone: false,
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true
    }
  ]
})
export class CustomSelectComponent implements ControlValueAccessor, AfterContentInit {

  @ContentChildren(CustomOptionComponent) options!: QueryList<CustomOptionComponent>;

  @Input() placeholder: string = '';
  @Input() isDisabled = false;
  @Input() isDropdownOpen = false;
  @Input() dropdownName: string = '';
  @Input() positionClass: string = '';
  @Input() isError: boolean = false;
  @Output() change: EventEmitter<unknown> = new EventEmitter<unknown>();
  @Output() toggle: EventEmitter<string> = new EventEmitter<string>();
  @Output() clickOutside: EventEmitter<string> = new EventEmitter<string>();
  @ViewChild('dropdown') dropdown!: ElementRef;
  @ViewChild('customOptions') customOptions!: ElementRef;


  selectedValue: unknown = null;
  selectedLabel: string = '';
  noDataOptionText: string = "ไม่มีข้อมูล";
  optionsValue: unknown = null;

  private onChange: (value: unknown) => void = () => { };
  private onTouched: () => void = () => { };

  constructor(
    // private translate: TranslateService,
  ) {
    // this.translate.onLangChange.subscribe(() => {
    //   setTimeout(() => {
    //     if (this.selectedValue) {
    //       this.writeValue(this.selectedValue);
    //     }
    //   }, 0);
    // });
  }

  ngAfterContentInit() {
    this.setupOptionSubscriptions();

    this.options.changes.subscribe(() => {
      this.setupOptionSubscriptions();
    });

    setTimeout(() => {
      if (this.selectedValue) {
        this.writeValue(this.selectedValue);
      }
    }, 0);
  }


  setupOptionSubscriptions() {
    this.options.forEach(option => {
      this.optionsValue = option.value
      if (option.isSelected) {
        this.selectedValue = option.getValue();
        this.selectedLabel = option.getLabel();
      }
      option.selectEvent.subscribe(({ value, label }) => {
        this.selectOption(value, label);
      });
    });
    this.writeValue(this.selectedValue);
  }

  toggleDropdown() {
    if (!this.isDisabled) {
      this.isDropdownOpen = !this.isDropdownOpen;
      this.toggle.emit(this.dropdownName);
      if (this.isDropdownOpen) {
        setTimeout(() => {
          if (this.customOptions?.nativeElement) {
            this.adjustDropdownDirection();
          }
        });
      }
    }
  }

  adjustDropdownDirection() {
    createPopper(this.dropdown.nativeElement, this.customOptions.nativeElement, {
      placement: 'bottom-start',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 10],
          },
        },
        {
          name: 'preventOverflow',
          options: {
            boundary: 'viewport',
          },
        },
      ],
    });
  }

  selectOption(value: unknown, label: string) {
    if (!this.isDisabled) {
      this.selectedValue = value;
      this.selectedLabel = label;
      this.onChange(value);
      this.onTouched();
      this.isDropdownOpen = false;
      this.change.emit(value);
      this.toggle.emit(this.dropdownName);
      this.options.forEach(option => option.isSelected = option.value === value);
    }
  }

  getSelectedLabel(): string {
    return this.selectedLabel || this.placeholder;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  writeValue(value: unknown): void {
    this.selectedValue = value;
    if (this.options) {
      let hasSelected = false;
      this.options.forEach(option => {
        option.isSelected = option.value === value;
        if (option.isSelected) {
          this.selectedLabel = option.getLabel();
          hasSelected = true;
        }
      });
      if (!hasSelected) {
        this.selectedLabel = '';
      }
    }
  }


  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-container') && this.isDropdownOpen) {
      this.isDropdownOpen = false;
      this.clickOutside.emit(this.dropdownName);
    }
  }
}
