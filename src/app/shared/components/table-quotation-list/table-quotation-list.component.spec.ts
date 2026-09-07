import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableQuotationListComponent } from './table-quotation-list.component';

describe('TableQuotationListComponent', () => {
  let component: TableQuotationListComponent;
  let fixture: ComponentFixture<TableQuotationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableQuotationListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableQuotationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
