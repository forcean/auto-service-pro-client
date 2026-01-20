import { Directive, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import Sortable, { MultiDrag } from 'sortablejs';
/**
 * Directive สำหรับทำ list ให้สามารถลากเพื่อเรียงลำดับ (drag & drop sorting)
 * โดยใช้ไลบรารี SortableJS (รองรับ MultiDrag)
 *
 * ความสามารถหลัก:
 * - ลาก item เพื่อเปลี่ยนลำดับใน array ที่ผูกกับ directive
 * - sync ลำดับใหม่กลับไปยัง component ผ่าน EventEmitter
 * - รองรับการตั้งค่า SortableJS เพิ่มเติมผ่าน sortableOptions
 * - destroy instance อัตโนมัติเมื่อ directive ถูกทำลาย
 *
 * เหมาะสำหรับ:
 * - ตาราง (table rows)
 * - list รายการ
 * - การจัดลำดับรูปภาพ, เมนู, หรือข้อมูลต่าง ๆ
 */

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