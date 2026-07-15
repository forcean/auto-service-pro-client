import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableVehicleServiceHistoryComponent } from './table-vehicle-service-history.component';

describe('TableVehicleServiceHistoryComponent', () => {
  let component: TableVehicleServiceHistoryComponent;
  let fixture: ComponentFixture<TableVehicleServiceHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableVehicleServiceHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableVehicleServiceHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
