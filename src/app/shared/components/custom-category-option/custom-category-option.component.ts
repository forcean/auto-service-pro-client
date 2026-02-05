import { Component, ContentChildren, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { ICategory } from '../../interface/category.interface';


@Component({
  selector: 'custom-category-option',
  standalone: false,
  templateUrl: './custom-category-option.component.html',
  styleUrl: './custom-category-option.component.scss'
})
export class CustomCategoryOptionComponent {
  @Input() node!: ICategory;
  @Input() level = 0;
  @Output() selectCategory = new EventEmitter<ICategory>();

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    this.node.expanded = !this.node.expanded;
  }

  select(): void {
    if (!this.node.isSelectable) return;
    this.selectCategory.emit(this.node);
  }
}