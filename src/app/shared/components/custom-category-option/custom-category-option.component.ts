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
  @Output() selectCategory = new EventEmitter<{ value: string; label: string }>();

  @ContentChildren(CustomCategoryOptionComponent, { descendants: true })
  categoryOptions!: QueryList<CustomCategoryOptionComponent>;


  expanded = false;
  isSelected = false; // ⭐ เพิ่ม

  markSelected(targetId: string): boolean {
    this.isSelected = this.node.id === targetId;

    if (this.node.children?.length) {
      let foundInChild = false;

      this.node.children.forEach(child => {
        // NOTE: logic นี้จะถูกเรียกผ่าน component tree
      });

      if (foundInChild) {
        this.expanded = true;
        return true;
      }
    }

    return this.isSelected;
  }

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