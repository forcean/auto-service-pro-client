import { Component, Input } from '@angular/core';
import { IStockMovementSummary } from '../../interface/stock-management.interface';

@Component({
  selector: 'app-stock-summary',
  standalone: false,
  templateUrl: './stock-summary.component.html',
  styleUrl: './stock-summary.component.scss',
})
export class StockSummaryComponent {
  @Input() summary!: IStockMovementSummary;
}
