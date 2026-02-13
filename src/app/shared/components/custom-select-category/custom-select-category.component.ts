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
import { ICategory } from '../../interface/catalog.interface';

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
export class CustomSelectCategoryComponent implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input() isDisabled = false;
  @Input() isError = false;
  @Input() positionClass = '';
  @Input({ required: true }) categories: ICategory[] = [];

  @ViewChild('dropdown') dropdown!: ElementRef;
  @ViewChild('customOptions') customOptions!: ElementRef;
  @ContentChildren(CustomCategoryOptionComponent, { descendants: true })
  categoryOptions!: QueryList<CustomCategoryOptionComponent>;

  private onChange: (value: string | null) => void = () => { };
  private onTouched: () => void = () => { };

  selectedLabel = '';
  selectedValue: string | null = null;
  noDataOptionText = 'ไม่มีข้อมูล';
  isDropdownOpen = false;

  ngAfterContentInit(): void {
    this.bindOptions();

    this.categoryOptions.changes.subscribe(() => {
      this.bindOptions();
    });
  }

  private bindOptions() {
    this.categoryOptions.forEach(option => {
      option.selectCategory.subscribe(node => {
        this.selectOption(node);
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
          { name: 'offset', options: { offset: [0, 10] } },
          { name: 'preventOverflow', options: { boundary: 'viewport' } }
        ]
      }
    );
  }

  selectOption(node: ICategory) {
    if (!node.isSelectable) return;

    this.clearTree(this.categories);
    node.isSelected = true;
    this.selectedLabel = node.name;
    this.selectedValue = node.id;

    this.onChange(node.id);
    this.onTouched();
    this.isDropdownOpen = false;
  }

  getSelectedLabel(): string {
    return this.selectedLabel || this.placeholder;
  }

  writeValue(value: string | null): void {
    this.selectedValue = value;
    if (!value) return;

    this.clearTree(this.categories);
    this.findAndSelect(this.categories, value);
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

  private clearTree(nodes: ICategory[]) {
    nodes.forEach(n => {
      n.isSelected = false;
      n.expanded = false;
      if (n.children) this.clearTree(n.children);
    });
  }

  private findAndSelect(nodes: ICategory[], targetId: string): boolean {
    for (const node of nodes) {
      if (node.id === targetId) {
        node.isSelected = true;
        this.selectedLabel = node.name;
        return true;
      }

      if (node.children?.length) {
        const found = this.findAndSelect(node.children, targetId);
        if (found) {
          node.expanded = true;
          return true;
        }
      }
    }
    return false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-container') && this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }
}