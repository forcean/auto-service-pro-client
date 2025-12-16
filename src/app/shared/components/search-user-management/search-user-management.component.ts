import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ISearchCriteria } from '../../interface/table-user-management.interface';

@Component({
  selector: 'app-search-user-management',
  standalone: false,
  templateUrl: './search-user-management.component.html',
  styleUrl: './search-user-management.component.scss'
})
export class SearchUserManagementComponent {

  @Input() username: string = '';
  @Input() role: string = '';

  @Output() search = new EventEmitter<ISearchCriteria>();
  @Output() reset = new EventEmitter<void>();

  onSearch() {
    this.search.emit({
      publicId: this.username || undefined,
      role: this.role || undefined
    });
  }

  onReset() {
    this.username = '';
    this.role = '';
    this.reset.emit();
  }
}