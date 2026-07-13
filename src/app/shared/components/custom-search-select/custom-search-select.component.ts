import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { createPopper, Instance } from '@popperjs/core';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-custom-search-select',
  standalone: false,
  templateUrl: './custom-search-select.component.html',
  styleUrl: './custom-search-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSearchSelectComponent),
      multi: true,
    },
  ],
})
export class CustomSearchSelectComponent implements ControlValueAccessor, AfterViewInit, OnChanges, OnDestroy
{
  @ViewChild('dropdown')
  dropdown!: ElementRef<HTMLButtonElement>;
  @ViewChild('customOptions')
  customOptions!: ElementRef<HTMLDivElement>;
  @ViewChild('searchInput')
  searchInput!: ElementRef<HTMLInputElement>;

  @Input() items: any[] = [];
  @Input() bindLabel = 'name';
  @Input() bindValue = 'id';
  @Input() bindSubLabel = '';
  @Input()placeholder = 'เลือกข้อมูล';
  @Input()searchPlaceholder = 'ค้นหา...';
  @Input()isDisabled = false;
  @Input()isError = false;
  @Input()positionClass = '';
  @Input()loading = false;
  @Input()dropdownName = '';
  @Input() minSearchLength = 2;

  @Output()search = new EventEmitter<string>();
  @Output()change = new EventEmitter<unknown>();
  @Output()toggle = new EventEmitter<string>();
  @Output()clickOutside = new EventEmitter<string>();

  keyword = '';
  selectedValue: unknown = null;
  selectedLabel = '';
  isDropdownOpen = false;
  activeIndex = -1;

  private popper?: Instance;
  private searchSubject = new Subject<string>();
  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};
  private destroy$ = new Subject<void>();

  constructor() {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((keyword) => {
        this.search.emit(keyword);
      });
  }

  ngAfterViewInit(): void {
    this.writeValue(this.selectedValue);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.updateSelectedLabel();
    }
  }

  writeValue(value: unknown): void {
    this.selectedValue = value;
    this.updateSelectedLabel();
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  toggleDropdown(): void {
    if (this.isDisabled) {
      return;
    }
    this.isDropdownOpen = !this.isDropdownOpen;
    this.toggle.emit(this.dropdownName);

    if (!this.isDropdownOpen) {
      this.closeDropdown();

      return;
    }

    this.activeIndex = this.items.length ? 0 : -1;
    this.keyword = '';

    setTimeout(() => {
      this.searchInput?.nativeElement &&
        (this.searchInput.nativeElement.value = '');
      this.adjustDropdownDirection();
      this.focusSearchInput();
    }, 0);
  }

  private focusSearchInput(): void {
    if (!this.searchInput) {
      return;
    }

    this.searchInput.nativeElement.focus();
    this.searchInput.nativeElement.select();
  }

  private adjustDropdownDirection(): void {
    if (!this.dropdown || !this.customOptions) {
      return;
    }

    this.popper?.destroy();
    this.popper = undefined;
    this.popper = createPopper(
      this.dropdown.nativeElement,
      this.customOptions.nativeElement,

      {
        placement: 'bottom-start',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
          {
            name: 'preventOverflow',
            options: {
              boundary: 'viewport',
            },
          },
        ],
      },
    );
  }

  onSearch(event: Event): void {
    const keyword = (event.target as HTMLInputElement).value;

    this.keyword = keyword;
    this.activeIndex = -1;

    if (keyword.length > 0 && keyword.length < this.minSearchLength) {
      this.search.emit('');
      return;
    }

    this.searchSubject.next(keyword);
  }

  selectItem(item: Record<string, unknown>): void {
    this.selectedValue = item[this.bindValue];
    this.selectedLabel = String(item[this.bindLabel] ?? '');
    console.log(this.selectedValue);
    this.onChange(this.selectedValue);
    this.onTouched();
    this.change.emit(item);
    this.closeDropdown();
  }

  private closeDropdown(): void {
    this.isDropdownOpen = false;
    this.keyword = '';
    this.activeIndex = -1;
    this.popper?.destroy();
    this.popper = undefined;
    this.searchInput?.nativeElement.blur();
  }

  clearSelection(): void {
    this.selectedValue = null;
    this.selectedLabel = '';
    this.onChange(null);
    this.onTouched();
    this.change.emit(null);
  }

  resetSearch(): void {
    this.keyword = '';
    this.searchInput?.nativeElement &&
      (this.searchInput.nativeElement.value = '');
    this.searchSubject.next('');
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.isDropdownOpen) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();

        if (!this.items.length) {
          return;
        }

        this.activeIndex++;

        if (this.activeIndex >= this.items.length) {
          this.activeIndex = 0;
        }

        this.scrollToActiveItem();

        break;

      case 'ArrowUp':
        event.preventDefault();

        if (!this.items.length) {
          return;
        }

        this.activeIndex--;

        if (this.activeIndex < 0) {
          this.activeIndex = this.items.length - 1;
        }

        this.scrollToActiveItem();

        break;

      case 'Enter':
        event.preventDefault();

        if (this.activeIndex >= 0 && this.activeIndex < this.items.length) {
          this.selectItem(this.items[this.activeIndex]);
        }

        break;

      case 'Escape':
        this.closeDropdown();

        break;
    }
  }

  private scrollToActiveItem(): void {
    if (!this.customOptions) {
      return;
    }

    const container = this.customOptions.nativeElement.querySelector(
      '.custom-search-options',
    ) as HTMLElement;

    if (!container) {
      return;
    }

    const option = container.children[this.activeIndex] as HTMLElement;

    if (!option) {
      return;
    }

    option.scrollIntoView({
      block: 'nearest',

      behavior: 'smooth',
    });
  }

  private updateSelectedLabel(): void {
    const item = this.items.find(
      (item) => item[this.bindValue] === this.selectedValue,
    );

    this.selectedLabel = item ? String(item[this.bindLabel]) : '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isDropdownOpen) {
      return;
    }

    const target = event.target as HTMLElement;

    if (!target.closest('.custom-select-container')) {
      this.closeDropdown();

      this.clickOutside.emit(this.dropdownName);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.isDropdownOpen) {
      this.popper?.update();
    }
  }
}

