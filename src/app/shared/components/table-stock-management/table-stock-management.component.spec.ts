import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableStockManagementComponent } from './table-stock-management.component';

describe('TableStockManagementComponent', () => {
  let component: TableStockManagementComponent;
  let fixture: ComponentFixture<TableStockManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableStockManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableStockManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
