import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Banknote, CalendarDays, ReceiptText, TrendingUp } from 'lucide-angular';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexFill,
  ApexGrid,
  ApexMarkers,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
} from 'ng-apexcharts';

import {
  EPaymentMethod,
  IPaymentCashFlowSummary,
  TCashFlowInterval,
} from '../../interface/billing.interface';

interface IPaymentMethodChartItem {
  method: EPaymentMethod;
  label: string;
  amount: number;
  transactions: number;
  percentage: number;
  dotClass: string;
  barClass: string;
}

@Component({
  selector: 'app-payment-cash-flow',
  standalone: false,
  templateUrl: './payment-cash-flow.component.html',
  styleUrl: './payment-cash-flow.component.scss',
})
export class PaymentCashFlowComponent {
  @Input() summary: IPaymentCashFlowSummary = this.emptySummary();
  @Input() interval: TCashFlowInterval = 'day';
  @Input() isLoading = false;
  @Input() sourceLabel = 'สรุปจากทุกรายการตามตัวกรองปัจจุบัน';
  @Output() readonly intervalChange = new EventEmitter<TCashFlowInterval>();

  readonly intervalOptions: Array<{ value: TCashFlowInterval; label: string }> = [
    { value: 'day', label: 'รายวัน' },
    { value: 'week', label: 'รายสัปดาห์' },
    { value: 'month', label: 'รายเดือน' },
  ];
  readonly IconTrend = TrendingUp;
  readonly IconReceipt = ReceiptText;
  readonly IconCalendar = CalendarDays;
  readonly IconBanknote = Banknote;

  readonly chart: ApexChart = {
    type: 'area',
    height: 264,
    background: 'transparent',
    fontFamily: 'inherit',
    foreColor: '#cbd5e1',
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: true, speed: 420, animateGradually: { enabled: true, delay: 80 } },
    parentHeightOffset: 0,
  };
  readonly stroke: ApexStroke = { curve: 'smooth', width: 3, lineCap: 'round' };
  readonly fill: ApexFill = {
    type: 'gradient',
    gradient: { shadeIntensity: 0.35, opacityFrom: 0.46, opacityTo: 0.02, stops: [0, 92, 100] },
  };
  readonly markers: ApexMarkers = {
    size: 0,
    strokeWidth: 3,
    strokeColors: '#0f172a',
    hover: { size: 6, sizeOffset: 2 },
  };
  readonly grid: ApexGrid = {
    borderColor: 'rgba(226,232,240,0.16)',
    strokeDashArray: 4,
    padding: { top: -8, right: 4, bottom: -2, left: 2 },
    xaxis: { lines: { show: false } },
  };
  readonly tooltip: ApexTooltip = {
    theme: 'dark',
    x: { show: true },
    y: { formatter: (value) => `฿${this.currency(value)}` },
    marker: { show: true },
  };
  readonly yaxis: ApexYAxis = {
    tickAmount: 3,
    labels: {
      minWidth: 46,
      style: { colors: '#94a3b8', fontSize: '10px', fontWeight: 600 },
      formatter: (value) => this.compactCurrency(value),
    },
  };

  get chartSeries(): ApexAxisChartSeries {
    return [{ name: 'เงินรับ', data: (this.summary?.series ?? []).map((item) => item.amount) }];
  }

  get xaxis(): ApexXAxis {
    return {
      categories: (this.summary?.series ?? []).map((item) => this.formatPeriod(item.period)),
      labels: {
        trim: true,
        hideOverlappingLabels: true,
        style: { colors: '#94a3b8', fontSize: '10px', fontWeight: 600 },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    };
  }

  get cashFlowLatestAmount(): number | undefined {
    const series = this.summary?.series ?? [];
    return series.length ? series[series.length - 1].amount : undefined;
  }

  get cashFlowChange(): number | null {
    const series = this.summary?.series ?? [];
    return series.length < 2 ? null : series[series.length - 1].amount - series[series.length - 2].amount;
  }

  get cashFlowPeriodLabel(): string {
    const series = this.summary?.series ?? [];
    if (!series.length) return 'ยังไม่มีรายการรับชำระในเงื่อนไขนี้';
    if (series.length === 1) return `ข้อมูล${this.intervalLabel} ${this.formatPeriod(series[0].period)}`;
    return `${this.formatPeriod(series[0].period)} – ${this.formatPeriod(series[series.length - 1].period)} · ${series.length} ช่วงข้อมูล`;
  }

  get averageLabel(): string {
    return { day: 'เฉลี่ยต่อวัน', week: 'เฉลี่ยต่อสัปดาห์', month: 'เฉลี่ยต่อเดือน' }[this.interval];
  }

  get paymentMethodChart(): IPaymentMethodChartItem[] {
    const total = this.summary?.totalAmount || 0;
    return (this.summary?.byMethod ?? [])
      .filter((item) => item.amount > 0)
      .map((item) => ({
        method: item.method,
        label: this.paymentMethodLabel(item.method),
        amount: item.amount,
        transactions: item.transactions,
        percentage: total ? (item.amount / total) * 100 : 0,
        ...this.paymentMethodChartStyle(item.method),
      }));
  }

  get paymentMethodGradient(): string {
    const methods = this.paymentMethodChart;
    if (!methods.length) return 'conic-gradient(#e2e8f0 0 100%)';
    let cursor = 0;
    const slices = methods.map((item) => {
      const start = cursor;
      cursor += item.percentage;
      return `${this.paymentMethodColor(item.method)} ${start.toFixed(2)}% ${cursor.toFixed(2)}%`;
    });
    return `conic-gradient(${slices.join(', ')})`;
  }

  setInterval(interval: TCashFlowInterval): void {
    if (interval !== this.interval) this.intervalChange.emit(interval);
  }

  currency(value: number | null | undefined): string {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
  }

  private emptySummary(): IPaymentCashFlowSummary {
    return {
      interval: 'day',
      totalAmount: 0,
      totalTransactions: 0,
      averagePeriodAmount: 0,
      series: [],
      byMethod: [],
    };
  }

  private compactCurrency(value: number): string {
    if (Math.abs(value) >= 1000000) return `฿${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `฿${(value / 1000).toFixed(0)}k`;
    return `฿${Math.round(value)}`;
  }

  private formatPeriod(period: string): string {
    if (this.interval === 'week') {
      const [year, week] = period.split('-W');
      return `สัปดาห์ ${Number(week)} · ${Number(year) + 543}`;
    }
    const date = new Date(`${period}${this.interval === 'month' ? '-01' : ''}T12:00:00`);
    if (Number.isNaN(date.getTime())) return period;
    return new Intl.DateTimeFormat('th-TH', this.interval === 'month'
      ? { month: 'short', year: '2-digit' }
      : { day: 'numeric', month: 'short' }).format(date);
  }

  private get intervalLabel(): string {
    return { day: 'รายวัน', week: 'รายสัปดาห์', month: 'รายเดือน' }[this.interval];
  }

  private paymentMethodLabel(method: EPaymentMethod): string {
    return {
      [EPaymentMethod.CASH]: 'เงินสด',
      [EPaymentMethod.TRANSFER]: 'โอนเงิน',
      [EPaymentMethod.CARD]: 'บัตรเครดิต/เดบิต',
      [EPaymentMethod.QR]: 'PromptPay QR',
      [EPaymentMethod.OTHER]: 'อื่น ๆ',
    }[method] ?? method;
  }

  private paymentMethodChartStyle(method: EPaymentMethod): Pick<IPaymentMethodChartItem, 'dotClass' | 'barClass'> {
    return {
      [EPaymentMethod.CASH]: { dotClass: 'bg-amber-400', barClass: 'bg-amber-400' },
      [EPaymentMethod.TRANSFER]: { dotClass: 'bg-sky-500', barClass: 'bg-sky-500' },
      [EPaymentMethod.CARD]: { dotClass: 'bg-violet-500', barClass: 'bg-violet-500' },
      [EPaymentMethod.QR]: { dotClass: 'bg-emerald-500', barClass: 'bg-emerald-500' },
      [EPaymentMethod.OTHER]: { dotClass: 'bg-slate-400', barClass: 'bg-slate-400' },
    }[method] ?? { dotClass: 'bg-slate-400', barClass: 'bg-slate-400' };
  }

  private paymentMethodColor(method: EPaymentMethod): string {
    return {
      [EPaymentMethod.CASH]: '#fbbf24',
      [EPaymentMethod.TRANSFER]: '#0ea5e9',
      [EPaymentMethod.CARD]: '#8b5cf6',
      [EPaymentMethod.QR]: '#10b981',
      [EPaymentMethod.OTHER]: '#94a3b8',
    }[method] ?? '#94a3b8';
  }
}
