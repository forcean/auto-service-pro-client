import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import { IUpdateTaskRequest, IWorkOrderTask } from '../../interface/repair-flow.interface';
import { UserList } from '../../interface/table-user-management.interface';

@Component({
  selector: 'app-task-edit-modal',
  standalone: false,
  templateUrl: './task-edit-modal.component.html',
  styleUrl: './task-edit-modal.component.scss',
})
export class TaskEditModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() task: IWorkOrderTask | null = null;
  @Input() mechanics: UserList[] = [];
  @Input() isSubmitting = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<IUpdateTaskRequest>();

  form: IUpdateTaskRequest = {};
  mechanicIds: string[] = [];
  readonly priorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      this.form = {
        title: this.task.title,
        description: this.task.description,
        priority: this.task.priority,
        estimateMinute: this.task.estimateMinute,
        actualMinute: this.task.actualMinute,
        plannedStartDate: this.toDateTimeLocal(this.task.plannedStartDate),
        plannedFinishDate: this.toDateTimeLocal(this.task.plannedFinishDate),
        progress: this.task.progress,
        mechanics: this.task.mechanics,
        remark: this.task.remark,
      };
      this.mechanicIds = this.task.mechanics?.map((mechanic) => mechanic.mechanicId) ?? [];
    }
  }

  onSave(): void {
    const title = this.form.title?.trim();
    if (!title) return;

    this.save.emit({
      ...this.form,
      title,
      description: this.form.description?.trim() || undefined,
      estimateMinute: Number(this.form.estimateMinute) || 0,
      actualMinute: Number(this.form.actualMinute) || 0,
      progress: Math.min(100, Math.max(0, Number(this.form.progress) || 0)),
      plannedStartDate: this.form.plannedStartDate || undefined,
      plannedFinishDate: this.form.plannedFinishDate || undefined,
      remark: this.form.remark?.trim() || undefined,
      mechanics: this.mechanics
        .filter((mechanic) => this.mechanicIds.includes(mechanic.id))
        .map((mechanic) => ({
          mechanicId: mechanic.id,
          mechanicName: [mechanic.firstname, mechanic.lastname].filter(Boolean).join(' ') || mechanic.publicId,
        })),
    });
  }

  onBackdropClick(): void {
    if (!this.isSubmitting) this.close.emit();
  }

  private toDateTimeLocal(value?: string): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return offsetDate.toISOString().slice(0, 16);
  }
}
