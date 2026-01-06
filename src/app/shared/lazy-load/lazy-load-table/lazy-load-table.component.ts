import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-lazy-load-table',
  standalone: false,
  templateUrl: './lazy-load-table.component.html',
  styleUrls: ['./lazy-load-table.component.scss']
})
export class LazyLoadTableComponent implements OnChanges {
  @Input() recordPerPage = 0;

  listTd: number[] = [];
  listTr: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recordPerPage']) {
      this.listTd = Array(6).fill(0);
      this.listTr = Array(this.recordPerPage).fill(0);
    }
  }
}
