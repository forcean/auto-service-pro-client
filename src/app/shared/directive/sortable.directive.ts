import { Directive, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import Sortable, { MultiDrag } from 'sortablejs';

Sortable.mount(new MultiDrag());
@Directive({
  selector: '[appSortable]'
})
export class SortableDirective implements OnChanges, OnDestroy {
  @Input() appSortable: any;
  @Input() sortableOptions: any;
  @Output() appSortableChange = new EventEmitter<string[]>();

  private sortableInstance: Sortable | undefined;

  constructor(private el: ElementRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appSortable']) {
      this.initSortable();
    }
  }

  ngOnDestroy(): void {
    if (this.sortableInstance) {
      this.sortableInstance.destroy();
    }
  }

  private initSortable(): void {
    if (this.sortableInstance) {
      this.sortableInstance.destroy();
    }

    this.sortableInstance = Sortable.create(this.el.nativeElement, {
      ...this.sortableOptions,
      animation: 150,
      onEnd: (event: any) => {
        if (this.appSortable && event.oldIndex != null && event.newIndex != null) {
          const movedItem = this.appSortable.splice(event.oldIndex, 1)[0];

          if (movedItem !== undefined) {
            this.appSortable.splice(event.newIndex, 0, movedItem);
            this.appSortableChange.emit(this.appSortable);
          }
        }
      }
    });
  }
}