import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICategory } from '../../interface/category.interface';


@Component({
  selector: 'custom-category-option',
  standalone: false,
  templateUrl: './custom-category-option.component.html',
  styleUrl: './custom-category-option.component.scss'
})
export class CustomCategoryOptionComponent {
  @Input() node!: ICategory;
  @Output() selectCategory = new EventEmitter<{ value: string; label: string }>();
  @Input() level = 0;

  expanded = false;

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    this.expanded = !this.expanded;
  }

  select(): void {
    if (!this.node.isSelectable) return;

    this.selectCategory.emit({
      value: this.node.id,
      label: this.node.name
    });
  }
}