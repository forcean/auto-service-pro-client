import { Component, Input } from '@angular/core';
import { IStockMovementSummary } from '../../interface/stock-management.interface';

@Component({
  selector: 'app-stock-summary',
  standalone: false,
  templateUrl: './stock-summary.component.html',
  styleUrl: './stock-summary.component.scss',
})
export class StockSummaryComponent {
  @Input() summary: IStockMovementSummary = {
    total: 0,
    receive: 0,
    issue: 0,
    adjust: 0,
    return: 0,
    reserve: 0,
    release: 0,
    in: 0,
    out: 0,
  };
  @Input() loading = false;
}
