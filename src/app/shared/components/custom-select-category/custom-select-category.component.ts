import {
  Component,
  ContentChildren,
  QueryList,
  forwardRef,
  Input,
  HostListener,
  AfterContentInit,
  ElementRef,
  ViewChild
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { createPopper } from '@popperjs/core';
import { CustomCategoryOptionComponent } from '../custom-category-option/custom-category-option.component';

@Component({
  selector: 'app-custom-select-category',
  standalone: false,
  templateUrl: './custom-select-category.component.html',
  styleUrl: './custom-select-category.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectCategoryComponent),
      multi: true
    }
  ]
})
export class CustomSelectCategoryComponent implements ControlValueAccessor, AfterContentInit {

  @ContentChildren(CustomCategoryOptionComponent, { descendants: true })
  categoryOptions!: QueryList<CustomCategoryOptionComponent>;

  @Input() placeholder = '';
  @Input() isDisabled = false;
  @Input() isDropdownOpen = false;
  @Input() dropdownName = '';
  @Input() positionClass = '';
  @Input() isError = false;

  @ViewChild('dropdown') dropdown!: ElementRef;
  @ViewChild('customOptions') customOptions!: ElementRef;

  private pendingValue: string | null = null;
  selectedValue: string | null = null;
  selectedLabel = '';
  noDataOptionText = 'ไม่มีข้อมูล';

  private onChange: (value: string | null) => void = () => { };
  private onTouched: () => void = () => { };

  ngAfterContentInit(): void {
    this.bindCategoryOptions();

    this.categoryOptions.changes.subscribe(() => {
      this.bindCategoryOptions();

      // ⭐ สำคัญ: defer ไป tick สุดท้าย
      queueMicrotask(() => {
        if (this.pendingValue) {
          this.applyValueToOptions();
        }
      });
    });

    // ⭐ เผื่อกรณี options มาครบตั้งแต่แรก
    queueMicrotask(() => {
      if (this.pendingValue) {
        this.applyValueToOptions();
      }
    });
  }



  private bindCategoryOptions() {
    this.categoryOptions.forEach(option => {
      option.selectCategory.subscribe(event => {
        this.selectOption(event.value, event.label);
      });
    });
  }

  toggleDropdown() {
    if (this.isDisabled) return;

    this.isDropdownOpen = !this.isDropdownOpen;

    if (this.isDropdownOpen) {
      setTimeout(() => this.adjustDropdownDirection());
    }
  }

  adjustDropdownDirection() {
    if (!this.dropdown || !this.customOptions) return;

    createPopper(
      this.dropdown.nativeElement,
      this.customOptions.nativeElement,
      {
        placement: 'bottom-start',
        modifiers: [
          {
            name: 'offset',
            options: { offset: [0, 10] }
          },
          {
            name: 'preventOverflow',
            options: { boundary: 'viewport' }
          }
        ]
      }
    );
  }

  selectOption(value: string, label: string) {
    if (this.isDisabled) return;

    this.selectedValue = value;
    this.selectedLabel = label;

    this.onChange(value);
    this.onTouched();

    this.isDropdownOpen = false;
  }

  getSelectedLabel(): string {
    return this.selectedLabel || this.placeholder;
  }

  writeValue(value: string | null): void {
    this.pendingValue = value;
    this.selectedValue = value;

    if (!this.categoryOptions || this.categoryOptions.length === 0) {
      return; // ⛔ ยังไม่มี option
    }

    this.applyValueToOptions();
  }


  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-container') && this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }

  private applyValueToOptions() {
    this.clearSelection(this.categoryOptions);

    this.categoryOptions.forEach(option => {
      if (option.node.id === this.pendingValue) {
        option.node.isSelected = true;
        this.selectedLabel = option.node.name;
      }
    });
  }

  private clearSelection(options: QueryList<CustomCategoryOptionComponent>) {
    options.forEach(opt => opt.node.isSelected = false);
  }



  private markOptionAndParents(
    option: CustomCategoryOptionComponent,
    targetId: string
  ): boolean {
    // ตรงตัว
    if (option.node.id === targetId) {
      option.isSelected = true;
      return true;
    }

    // เช็ก child
    if (option.node.children?.length) {
      let foundInChild = false;

      option.node.children.forEach(() => {
        // descendant options จะอยู่ใน ContentChildren อยู่แล้ว
        this.categoryOptions.forEach(childOption => {
          if (childOption.node.id !== option.node.id &&
            this.markOptionAndParents(childOption, targetId)) {
            foundInChild = true;
          }
        });
      });

      if (foundInChild) {
        option.expanded = true; // ⭐ auto expand parent
        return true;
      }
    }

    option.isSelected = false;
    return false;
  }


}